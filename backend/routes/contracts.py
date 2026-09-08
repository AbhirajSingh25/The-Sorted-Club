import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import (
    Client,
    Proposal,
    ProposalItem,
    ProposalStatus,
    Contract,
    ContractStatus,
    ClientOnboardingItem,
    LeadActivity,
    ActivityType
)
from schemas import (
    ContractCreate,
    ContractUpdate,
    ContractOut,
    PublicContractOut,
    PublicContractAccept
)
from auth import get_current_admin
from rate_limiter import limiter
from services.notification_service import send_business_notification, send_customer_email

router = APIRouter(tags=["Contracts"])

def generate_contract_number(db: Session) -> str:
    """Generate human readable format SC-C-YYYY-0001"""
    current_year = datetime.now(timezone.utc).year
    prefix = f"SC-C-{current_year}-"
    latest = db.query(Contract).filter(Contract.contract_number.like(f"{prefix}%")).order_by(desc(Contract.id)).first()
    if latest and latest.contract_number:
        try:
            seq = int(latest.contract_number.split("-")[-1]) + 1
        except Exception:
            seq = db.query(func.count(Contract.id)).scalar() + 1
    else:
        seq = db.query(func.count(Contract.id)).scalar() + 1
    return f"{prefix}{seq:04d}"

def generate_standard_contract_text(client: Client, proposal: Proposal, items: List[ProposalItem]) -> str:
    """Generate a structured agreement document with legal disclaimer."""
    deliverables_txt = "\n".join([f"- {it.name} (Qty: {it.quantity}): ${it.total:,.2f}" for it in items])
    
    return f"""MASTER SERVICES AGREEMENT

CONTRACT REFERENCE: Generated for {client.business_name}
ASSOCIATED PROPOSAL: {proposal.proposal_number} — {proposal.title}
DATE: {datetime.now(timezone.utc).strftime('%B %d, %Y')}

1. PARTIES
This Agreement is entered into by and between:
- Service Provider: THE SORTED CLUB ("Sorted Club", "Agency")
- Client: {client.business_name} ("Client"), represented by {client.name} ({client.email}, {client.phone})

2. SCOPE OF SERVICES & DELIVERABLES
Sorted Club agrees to execute the following services as outlined in Proposal {proposal.proposal_number}:
{deliverables_txt}

3. INVESTMENT & COMPENSATION
- Total Agreed Compensation: ${proposal.total:,.2f} {proposal.currency}
- Subtotal: ${proposal.subtotal:,.2f}
- Discount Applied: ${proposal.discount:,.2f}
- Applicable Tax: ${proposal.tax:,.2f}

4. PAYMENT TERMS
- Payments shall be made according to the agreed payment milestone schedule upon invoice issuance.
- Invoices are payable via Bank Wire Transfer, UPI, or designated payment methods.

5. INTELLECTUAL PROPERTY & CONFIDENTIALITY
- Upon full payment of all fees, all final custom deliverable assets created specifically for Client shall transfer to Client.
- Both parties agree to maintain the strict confidentiality of proprietary business information and trade data.

6. APPLICABLE DISCLAIMER & LEGAL NOTICE
IMPORTANT NOTICE: This agreement document is generated for operational clarity and project scoping between The Sorted Club and Client. It does not constitute formal legal counsel. Both parties are encouraged to review terms with legal counsel for specific jurisdictional compliance.
"""

def enrich_contract_out(contract: Contract, db: Session) -> ContractOut:
    client = db.query(Client).filter(Client.id == contract.client_id).first()
    return ContractOut(
        id=contract.id,
        client_id=contract.client_id,
        proposal_id=contract.proposal_id,
        contract_number=contract.contract_number,
        title=contract.title,
        content=contract.content,
        status=contract.status,
        secure_token=contract.secure_token,
        accepted_by_name=contract.accepted_by_name,
        accepted_by_email=contract.accepted_by_email,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
        sent_at=contract.sent_at,
        accepted_at=contract.accepted_at,
        client_name=client.name if client else None,
        client_business_name=client.business_name if client else None,
        client_code=client.client_code if client else None
    )

@router.post("/api/contracts/from-proposal/{proposal_id}", response_model=ContractOut, status_code=status.HTTP_201_CREATED)
def create_contract_from_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Generate a formal contract from an ACCEPTED proposal."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    if (proposal.status or "").upper() != ProposalStatus.ACCEPTED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contracts can only be generated from ACCEPTED proposals. Current status: '{proposal.status}'."
        )

    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client associated with proposal not found."
        )

    try:
        contract_number = generate_contract_number(db)
        items = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal.id).all()
        contract_content = generate_standard_contract_text(client, proposal, items)
        secure_token = secrets.token_urlsafe(32)

        new_contract = Contract(
            client_id=client.id,
            proposal_id=proposal.id,
            contract_number=contract_number,
            title=f"Service Agreement: {proposal.title}",
            content=contract_content,
            status=ContractStatus.DRAFT.value,
            secure_token=secure_token
        )
        db.add(new_contract)
        db.flush()

        db.add(LeadActivity(
            client_id=client.id,
            lead_id=client.lead_id,
            type=ActivityType.NOTE.value,
            text=f"Draft Contract {contract_number} generated from accepted Proposal {proposal.proposal_number}.",
            created_by=admin_user
        ))

        db.commit()
        db.refresh(new_contract)
        return enrich_contract_out(new_contract, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate contract: {str(e)}"
        )

@router.get("/api/contracts", response_model=List[ContractOut])
def get_contracts(
    status_filter: Optional[str] = Query(None, alias="status"),
    client_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """List contracts with filters."""
    try:
        query = db.query(Contract)

        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(func.upper(Contract.status) == status_filter.strip().upper())

        if client_id:
            query = query.filter(Contract.client_id == client_id)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Contract.contract_number.ilike(term),
                    Contract.title.ilike(term),
                    Contract.content.ilike(term)
                )
            )

        contracts = query.order_by(desc(Contract.created_at)).all()
        return [enrich_contract_out(c, db) for c in contracts]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query contracts."
        )

@router.get("/api/contracts/{contract_id}", response_model=ContractOut)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """Retrieve single contract."""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with id {contract_id} not found."
        )
    return enrich_contract_out(contract, db)

@router.patch("/api/contracts/{contract_id}", response_model=ContractOut)
def update_contract(
    contract_id: int,
    contract_update: ContractUpdate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Update contract title, content, or status."""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with id {contract_id} not found."
        )

    try:
        update_dict = contract_update.model_dump(exclude_unset=True)
        if "status" in update_dict and update_dict["status"] is not None:
            new_st = update_dict["status"].value if isinstance(update_dict["status"], ContractStatus) else str(update_dict["status"]).upper()
            update_dict["status"] = new_st

        for key, val in update_dict.items():
            setattr(contract, key, val)

        contract.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(contract)
        return enrich_contract_out(contract, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update contract: {str(e)}"
        )

@router.post("/api/contracts/{contract_id}/send", response_model=ContractOut)
def send_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Mark contract as SENT."""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with id {contract_id} not found."
        )

    contract.status = ContractStatus.SENT.value
    contract.sent_at = datetime.now(timezone.utc)
    contract.updated_at = datetime.now(timezone.utc)

    db.add(LeadActivity(
        client_id=contract.client_id,
        type=ActivityType.EMAIL.value,
        text=f"Contract {contract.contract_number} ('{contract.title}') marked as SENT to client.",
        created_by=admin_user
    ))

    db.commit()
    db.refresh(contract)

    # Customer transactional email
    client = db.query(Client).filter(Client.id == contract.client_id).first()
    if client and client.email:
        send_customer_email(
            db=db,
            recipient=client.email,
            event_type="CONTRACT_READY",
            subject=f"Agreement Ready: {contract.contract_number} — The Sorted Club",
            title="Service Agreement Ready for Review",
            message=f"Master Services Agreement {contract.contract_number} has been generated for {client.business_name}. Please review and sign online to proceed with the engagement.",
            cta_text="REVIEW & SIGN AGREEMENT →",
            cta_url=f"/contract/{contract.secure_token}",
            data={
                "Agreement Reference": contract.contract_number,
                "Client Business": client.business_name,
                "Title": contract.title
            }
        )

    return enrich_contract_out(contract, db)

@router.post("/api/contracts/{contract_id}/accept", response_model=ContractOut)
def accept_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Mark contract as ACCEPTED."""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with id {contract_id} not found."
        )

    contract.status = ContractStatus.ACCEPTED.value
    contract.accepted_at = datetime.now(timezone.utc)
    contract.updated_at = datetime.now(timezone.utc)

    db.add(LeadActivity(
        client_id=contract.client_id,
        type=ActivityType.STATUS_CHANGE.value,
        text=f"Contract {contract.contract_number} marked as ACCEPTED / SIGNED.",
        created_by=admin_user
    ))

    db.commit()
    db.refresh(contract)
    return enrich_contract_out(contract, db)

# ==============================================================================
# PUBLIC TOKENIZED CONTRACT ENDPOINTS (NO AUTH REQUIRED)
# ==============================================================================

@router.get("/api/public/contract/{token}", response_model=PublicContractOut)
def get_public_contract(token: str, db: Session = Depends(get_db)):
    """Fetch sanitized contract agreement document by secure token."""
    contract = db.query(Contract).filter(Contract.secure_token == token).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent contract link."
        )

    client = db.query(Client).filter(Client.id == contract.client_id).first()

    return PublicContractOut(
        contract_number=contract.contract_number,
        title=contract.title,
        content=contract.content,
        status=contract.status,
        secure_token=contract.secure_token,
        accepted_by_name=contract.accepted_by_name,
        created_at=contract.created_at,
        sent_at=contract.sent_at,
        accepted_at=contract.accepted_at,
        client_name=client.name if client else "Client",
        client_business_name=client.business_name if client else "Client Company",
        client_email=client.email if client else "",
        client_phone=client.phone if client else ""
    )

@router.post("/api/public/contract/{token}/accept", response_model=PublicContractOut)
def accept_public_contract(
    token: str,
    accept_in: PublicContractAccept,
    request: Request,
    db: Session = Depends(get_db)
):
    """Client acknowledges and accepts agreement terms online. Rate limited to 15 per minute per IP."""
    limiter.check(request, "contract_accept", max_requests=15, window_seconds=60)
    contract = db.query(Contract).filter(Contract.secure_token == token).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent contract link."
        )

    if contract.status == ContractStatus.ACCEPTED.value:
        return get_public_contract(token, db)

    now = datetime.now(timezone.utc)
    contract.status = ContractStatus.ACCEPTED.value
    contract.accepted_at = now
    contract.accepted_by_name = accept_in.accepted_by_name.strip()
    contract.accepted_by_email = accept_in.accepted_by_email.strip()
    contract.updated_at = now

    client = db.query(Client).filter(Client.id == contract.client_id).first()
    if client:
        db.add(LeadActivity(
            client_id=client.id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Contract {contract.contract_number} ('{contract.title}') was ACKNOWLEDGED & ACCEPTED online by {accept_in.accepted_by_name} ({accept_in.accepted_by_email}).",
            created_by="Client Online Agreement"
        ))

        # Check and update onboarding item
        onboarding_item = db.query(ClientOnboardingItem).filter(
            ClientOnboardingItem.client_id == contract.client_id,
            or_(
                ClientOnboardingItem.item_key == "agreement_signed",
                ClientOnboardingItem.title.ilike("%contract%"),
                ClientOnboardingItem.title.ilike("%agreement%")
            ),
            ClientOnboardingItem.completed == False
        ).first()
        if onboarding_item:
            onboarding_item.completed = True
            onboarding_item.completed_at = now
            onboarding_item.notes = f"Signed online via agreement {contract.contract_number}."

    db.commit()
    db.refresh(contract)

    if client:
        send_business_notification(
            db=db,
            event_type="CONTRACT_ACCEPTED",
            subject=f"[The Sorted Club] Agreement Signed — {client.business_name}",
            title=f"Agreement Signed: {contract.contract_number}",
            message=f"{accept_in.accepted_by_name} ({accept_in.accepted_by_email}) accepted Agreement {contract.contract_number} for {client.business_name}.",
            data={
                "Agreement Reference": contract.contract_number,
                "Client Business": client.business_name,
                "Signer": accept_in.accepted_by_name,
                "Signer Email": accept_in.accepted_by_email
            },
            entity_type="contract",
            entity_id=contract.id,
            action_url=f"/admin/clients?selectedClient={client.id}"
        )

    return get_public_contract(token, db)
