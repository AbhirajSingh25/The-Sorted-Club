import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import (
    Client,
    Lead,
    Proposal,
    ProposalItem,
    ProposalStatus,
    LeadActivity,
    ActivityType
)
from schemas import (
    ProposalCreate,
    ProposalUpdate,
    ProposalOut,
    ProposalItemCreate,
    ProposalItemOut,
    PublicProposalOut,
    PublicProposalAccept,
    PublicProposalReject
)
from auth import get_current_admin

router = APIRouter(tags=["Proposals"])

def generate_proposal_number(db: Session) -> str:
    """Generate human readable format SC-P-YYYY-0001"""
    current_year = datetime.now(timezone.utc).year
    prefix = f"SC-P-{current_year}-"
    latest = db.query(Proposal).filter(Proposal.proposal_number.like(f"{prefix}%")).order_by(desc(Proposal.id)).first()
    if latest and latest.proposal_number:
        try:
            seq = int(latest.proposal_number.split("-")[-1]) + 1
        except Exception:
            seq = db.query(func.count(Proposal.id)).scalar() + 1
    else:
        seq = db.query(func.count(Proposal.id)).scalar() + 1
    return f"{prefix}{seq:04d}"

def calculate_proposal_totals(items_data: list, discount: float = 0.0, tax: float = 0.0):
    """Compute subtotal, discount, tax, and grand total safely on the server."""
    subtotal = sum(float(item.get("quantity", 1.0)) * float(item.get("unit_price", 0.0)) for item in items_data)
    clean_discount = max(0.0, float(discount or 0.0))
    clean_tax = max(0.0, float(tax or 0.0))
    total = max(0.0, subtotal - clean_discount + clean_tax)
    return round(subtotal, 2), round(clean_discount, 2), round(clean_tax, 2), round(total, 2)

def enrich_proposal_out(proposal: Proposal, db: Session) -> ProposalOut:
    """Enrich proposal model with client metadata for output schema."""
    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    items = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal.id).order_by(asc(ProposalItem.order_index)).all()
    
    out_dict = {
        "id": proposal.id,
        "client_id": proposal.client_id,
        "lead_id": proposal.lead_id,
        "proposal_number": proposal.proposal_number,
        "title": proposal.title,
        "description": proposal.description,
        "status": proposal.status,
        "subtotal": proposal.subtotal,
        "discount": proposal.discount,
        "tax": proposal.tax,
        "total": proposal.total,
        "currency": proposal.currency,
        "valid_until": proposal.valid_until,
        "notes": proposal.notes,
        "terms": proposal.terms,
        "secure_token": proposal.secure_token,
        "accepted_by_name": proposal.accepted_by_name,
        "accepted_by_email": proposal.accepted_by_email,
        "created_at": proposal.created_at,
        "updated_at": proposal.updated_at,
        "sent_at": proposal.sent_at,
        "accepted_at": proposal.accepted_at,
        "rejected_at": proposal.rejected_at,
        "items": items,
        "client_name": client.name if client else None,
        "client_business_name": client.business_name if client else None,
        "client_code": client.client_code if client else None
    }
    return ProposalOut(**out_dict)

# ==============================================================================
# AUTHENTICATED ADMIN PROPOSAL ENDPOINTS
# ==============================================================================

@router.post("/api/proposals", response_model=ProposalOut, status_code=status.HTTP_201_CREATED)
def create_proposal(
    proposal_in: ProposalCreate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Create a new commercial proposal with line items."""
    client = db.query(Client).filter(Client.id == proposal_in.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {proposal_in.client_id} not found."
        )

    try:
        items_dict = [it.model_dump() for it in proposal_in.items]
        subtotal, discount, tax, total = calculate_proposal_totals(
            items_dict,
            discount=proposal_in.discount,
            tax=proposal_in.tax
        )

        proposal_number = generate_proposal_number(db)
        secure_token = secrets.token_urlsafe(32)

        new_proposal = Proposal(
            client_id=proposal_in.client_id,
            lead_id=proposal_in.lead_id or client.lead_id,
            proposal_number=proposal_number,
            title=proposal_in.title.strip(),
            description=proposal_in.description.strip() if proposal_in.description else None,
            status=ProposalStatus.DRAFT.value,
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            total=total,
            currency=proposal_in.currency or "USD",
            valid_until=proposal_in.valid_until,
            notes=proposal_in.notes,
            terms=proposal_in.terms,
            secure_token=secure_token
        )
        db.add(new_proposal)
        db.flush()

        for idx, it in enumerate(proposal_in.items):
            it_total = round(it.quantity * it.unit_price, 2)
            db_item = ProposalItem(
                proposal_id=new_proposal.id,
                name=it.name.strip(),
                description=it.description.strip() if it.description else None,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total=it_total,
                order_index=it.order_index if it.order_index is not None else idx
            )
            db.add(db_item)

        # Log activity on client
        db.add(LeadActivity(
            client_id=client.id,
            lead_id=client.lead_id,
            type=ActivityType.NOTE.value,
            text=f"Draft proposal {proposal_number} ('{new_proposal.title}') created. Total: ${total:,.2f}.",
            created_by=admin_user
        ))

        db.commit()
        db.refresh(new_proposal)
        return enrich_proposal_out(new_proposal, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create proposal: {str(e)}"
        )

@router.get("/api/proposals", response_model=List[ProposalOut])
def get_proposals(
    status_filter: Optional[str] = Query(None, alias="status"),
    client_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """List proposals with filters and search."""
    try:
        query = db.query(Proposal)

        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(func.upper(Proposal.status) == status_filter.strip().upper())

        if client_id:
            query = query.filter(Proposal.client_id == client_id)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Proposal.proposal_number.ilike(term),
                    Proposal.title.ilike(term),
                    Proposal.description.ilike(term),
                    Proposal.notes.ilike(term)
                )
            )

        if sort_by == "value_desc":
            query = query.order_by(desc(Proposal.total))
        elif sort_by == "oldest":
            query = query.order_by(asc(Proposal.created_at))
        elif sort_by == "valid_asc":
            query = query.order_by(asc(Proposal.valid_until).nullslast())
        else:
            query = query.order_by(desc(Proposal.created_at))

        proposals = query.all()
        return [enrich_proposal_out(p, db) for p in proposals]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query proposals."
        )

@router.get("/api/proposals/{proposal_id}", response_model=ProposalOut)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """Retrieve detailed proposal."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )
    return enrich_proposal_out(proposal, db)

@router.patch("/api/proposals/{proposal_id}", response_model=ProposalOut)
def update_proposal(
    proposal_id: int,
    proposal_update: ProposalUpdate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Update draft or existing proposal details and recalculate totals."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    try:
        update_dict = proposal_update.model_dump(exclude_unset=True)

        if "items" in update_dict and update_dict["items"] is not None:
            # Replace items
            db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal.id).delete()
            for idx, it in enumerate(proposal_update.items):
                it_total = round(it.quantity * it.unit_price, 2)
                db_item = ProposalItem(
                    proposal_id=proposal.id,
                    name=it.name.strip(),
                    description=it.description.strip() if it.description else None,
                    quantity=it.quantity,
                    unit_price=it.unit_price,
                    total=it_total,
                    order_index=it.order_index if it.order_index is not None else idx
                )
                db.add(db_item)
            db.flush()

        # Recalculate totals
        curr_items = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal.id).all()
        items_raw = [{"quantity": it.quantity, "unit_price": it.unit_price} for it in curr_items]
        discount = update_dict.get("discount", proposal.discount)
        tax = update_dict.get("tax", proposal.tax)
        subtotal, discount, tax, total = calculate_proposal_totals(items_raw, discount, tax)

        proposal.subtotal = subtotal
        proposal.discount = discount
        proposal.tax = tax
        proposal.total = total

        for key, val in update_dict.items():
            if key != "items":
                setattr(proposal, key, val)

        proposal.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(proposal)
        return enrich_proposal_out(proposal, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update proposal: {str(e)}"
        )

@router.delete("/api/proposals/{proposal_id}")
def delete_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Delete a proposal."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )
    db.delete(proposal)
    db.commit()
    return {"message": f"Proposal {proposal.proposal_number} deleted successfully."}

@router.post("/api/proposals/{proposal_id}/send", response_model=ProposalOut)
def send_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Mark proposal as SENT and log activity."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    proposal.status = ProposalStatus.SENT.value
    proposal.sent_at = datetime.now(timezone.utc)
    proposal.updated_at = datetime.now(timezone.utc)

    db.add(LeadActivity(
        client_id=proposal.client_id,
        lead_id=proposal.lead_id,
        type=ActivityType.EMAIL.value,
        text=f"Proposal {proposal.proposal_number} ('{proposal.title}') marked as SENT to client.",
        created_by=admin_user
    ))

    db.commit()
    db.refresh(proposal)
    return enrich_proposal_out(proposal, db)

@router.post("/api/proposals/{proposal_id}/accept", response_model=ProposalOut)
def accept_proposal_admin(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Admin manual mark as ACCEPTED."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    proposal.status = ProposalStatus.ACCEPTED.value
    proposal.accepted_at = datetime.now(timezone.utc)
    proposal.accepted_by_name = admin_user
    proposal.updated_at = datetime.now(timezone.utc)

    db.add(LeadActivity(
        client_id=proposal.client_id,
        lead_id=proposal.lead_id,
        type=ActivityType.STATUS_CHANGE.value,
        text=f"Proposal {proposal.proposal_number} marked as ACCEPTED by {admin_user}.",
        created_by=admin_user
    ))

    db.commit()
    db.refresh(proposal)
    return enrich_proposal_out(proposal, db)

@router.post("/api/proposals/{proposal_id}/reject", response_model=ProposalOut)
def reject_proposal_admin(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Admin manual mark as REJECTED."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    proposal.status = ProposalStatus.REJECTED.value
    proposal.rejected_at = datetime.now(timezone.utc)
    proposal.updated_at = datetime.now(timezone.utc)

    db.add(LeadActivity(
        client_id=proposal.client_id,
        lead_id=proposal.lead_id,
        type=ActivityType.STATUS_CHANGE.value,
        text=f"Proposal {proposal.proposal_number} marked as REJECTED.",
        created_by=admin_user
    ))

    db.commit()
    db.refresh(proposal)
    return enrich_proposal_out(proposal, db)

@router.post("/api/proposals/{proposal_id}/duplicate", response_model=ProposalOut)
def duplicate_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Duplicate an existing proposal into a new DRAFT proposal."""
    original = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    new_number = generate_proposal_number(db)
    new_token = secrets.token_urlsafe(32)

    clone = Proposal(
        client_id=original.client_id,
        lead_id=original.lead_id,
        proposal_number=new_number,
        title=f"Copy of {original.title}",
        description=original.description,
        status=ProposalStatus.DRAFT.value,
        subtotal=original.subtotal,
        discount=original.discount,
        tax=original.tax,
        total=original.total,
        currency=original.currency,
        valid_until=original.valid_until,
        notes=original.notes,
        terms=original.terms,
        secure_token=new_token
    )
    db.add(clone)
    db.flush()

    orig_items = db.query(ProposalItem).filter(ProposalItem.proposal_id == original.id).all()
    for it in orig_items:
        db.add(ProposalItem(
            proposal_id=clone.id,
            name=it.name,
            description=it.description,
            quantity=it.quantity,
            unit_price=it.unit_price,
            total=it.total,
            order_index=it.order_index
        ))

    db.commit()
    db.refresh(clone)
    return enrich_proposal_out(clone, db)

# ==============================================================================
# PUBLIC TOKENIZED PROPOSAL ENDPOINTS (NO AUTH REQUIRED)
# ==============================================================================

def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

@router.get("/api/public/proposal/{token}", response_model=PublicProposalOut)
def get_public_proposal(token: str, db: Session = Depends(get_db)):
    """Fetch sanitized proposal document by secure token."""
    proposal = db.query(Proposal).filter(Proposal.secure_token == token).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent proposal link."
        )

    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    items = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal.id).order_by(asc(ProposalItem.order_index)).all()

    now = datetime.now(timezone.utc)
    valid_utc = ensure_utc(proposal.valid_until)
    is_expired = bool(valid_utc and valid_utc < now and proposal.status != ProposalStatus.ACCEPTED.value)

    if is_expired and proposal.status in [ProposalStatus.SENT.value, ProposalStatus.VIEWED.value]:
        proposal.status = ProposalStatus.EXPIRED.value
        proposal.updated_at = now
        db.commit()
    elif proposal.status == ProposalStatus.SENT.value and not is_expired:
        proposal.status = ProposalStatus.VIEWED.value
        proposal.updated_at = now
        if client:
            db.add(LeadActivity(
                client_id=client.id,
                lead_id=client.lead_id,
                type=ActivityType.NOTE.value,
                text=f"Proposal {proposal.proposal_number} ('{proposal.title}') was viewed online by client.",
                created_by="Client Portal"
            ))
        db.commit()

    return PublicProposalOut(
        proposal_number=proposal.proposal_number,
        title=proposal.title,
        description=proposal.description,
        status=proposal.status,
        subtotal=proposal.subtotal,
        discount=proposal.discount,
        tax=proposal.tax,
        total=proposal.total,
        currency=proposal.currency,
        valid_until=proposal.valid_until,
        notes=proposal.notes,
        terms=proposal.terms,
        secure_token=proposal.secure_token,
        client_name=client.name if client else "Client",
        client_business_name=client.business_name if client else "Client Company",
        client_email=client.email if client else "",
        client_phone=client.phone if client else "",
        created_at=proposal.created_at,
        sent_at=proposal.sent_at,
        accepted_at=proposal.accepted_at,
        accepted_by_name=proposal.accepted_by_name,
        is_expired=is_expired,
        items=items
    )

@router.post("/api/public/proposal/{token}/accept", response_model=PublicProposalOut)
def accept_public_proposal(
    token: str,
    accept_in: PublicProposalAccept,
    db: Session = Depends(get_db)
):
    """Client approves proposal online."""
    proposal = db.query(Proposal).filter(Proposal.secure_token == token).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent proposal link."
        )

    now = datetime.now(timezone.utc)
    valid_utc = ensure_utc(proposal.valid_until)
    if valid_utc and valid_utc < now and proposal.status != ProposalStatus.ACCEPTED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This proposal has expired. Please contact The Sorted Club for an updated proposal."
        )

    if proposal.status == ProposalStatus.ACCEPTED.value:
        # Already accepted
        return get_public_proposal(token, db)

    proposal.status = ProposalStatus.ACCEPTED.value
    proposal.accepted_at = now
    proposal.accepted_by_name = accept_in.accepted_by_name.strip()
    proposal.accepted_by_email = accept_in.accepted_by_email.strip()
    proposal.updated_at = now

    # Log activity on client
    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    if client:
        db.add(LeadActivity(
            client_id=client.id,
            lead_id=client.lead_id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Proposal {proposal.proposal_number} ('{proposal.title}') was APPROVED online by {accept_in.accepted_by_name} ({accept_in.accepted_by_email}).",
            created_by="Client Online Approval"
        ))

    db.commit()
    db.refresh(proposal)
    return get_public_proposal(token, db)

@router.post("/api/public/proposal/{token}/reject", response_model=PublicProposalOut)
def reject_public_proposal(
    token: str,
    reject_in: PublicProposalReject,
    db: Session = Depends(get_db)
):
    """Client declines proposal."""
    proposal = db.query(Proposal).filter(Proposal.secure_token == token).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent proposal link."
        )

    now = datetime.now(timezone.utc)
    proposal.status = ProposalStatus.REJECTED.value
    proposal.rejected_at = now
    proposal.updated_at = now

    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    reason_note = f" Reason: '{reject_in.reason}'." if reject_in.reason else ""
    if client:
        db.add(LeadActivity(
            client_id=client.id,
            lead_id=client.lead_id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Proposal {proposal.proposal_number} was DECLINED by client.{reason_note}",
            created_by="Client Portal"
        ))

    db.commit()
    return get_public_proposal(token, db)
