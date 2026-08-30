from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import (
    Lead,
    LeadStatus,
    Client,
    ClientStatus,
    OnboardingStatus,
    ClientOnboardingItem,
    LeadActivity,
    ActivityType
)
from schemas import (
    ClientOut,
    ClientUpdate,
    ClientStats,
    ClientOnboardingResponse,
    OnboardingItemOut,
    OnboardingBatchUpdate,
    LeadActivityCreate,
    LeadActivityOut
)
from auth import get_current_admin

router = APIRouter(prefix="/api/clients", tags=["Clients & Onboarding"])

INITIAL_ONBOARDING_CHECKLIST = [
    {"key": "agreement_signed", "title": "Client agreement signed", "category": "LEGAL_FINANCE", "order": 1},
    {"key": "initial_payment", "title": "Initial payment received", "category": "LEGAL_FINANCE", "order": 2},
    {"key": "business_info", "title": "Business information received", "category": "ACCESS_ASSETS", "order": 3},
    {"key": "brand_assets", "title": "Brand assets received", "category": "ACCESS_ASSETS", "order": 4},
    {"key": "website_credentials", "title": "Website / access credentials received if required", "category": "ACCESS_ASSETS", "order": 5},
    {"key": "social_media_access", "title": "Social media access received if required", "category": "ACCESS_ASSETS", "order": 6},
    {"key": "google_business_access", "title": "Google Business access received if required", "category": "ACCESS_ASSETS", "order": 7},
    {"key": "project_requirements", "title": "Project requirements confirmed", "category": "ALIGNMENT_SETUP", "order": 8},
    {"key": "kickoff_meeting", "title": "Kickoff meeting completed", "category": "ALIGNMENT_SETUP", "order": 9},
    {"key": "workspace_created", "title": "Project workspace created", "category": "ALIGNMENT_SETUP", "order": 10},
]

def generate_client_code(db: Session) -> str:
    """Generate a unique human-readable client code format: SC-YYYY-0001"""
    current_year = datetime.now(timezone.utc).year
    prefix = f"SC-{current_year}-"
    
    # Find latest client code for the current year
    latest_client = db.query(Client).filter(Client.client_code.like(f"{prefix}%")).order_by(desc(Client.id)).first()
    if latest_client and latest_client.client_code:
        try:
            seq = int(latest_client.client_code.split("-")[-1]) + 1
        except Exception:
            seq = db.query(func.count(Client.id)).scalar() + 1
    else:
        seq = db.query(func.count(Client.id)).scalar() + 1

    return f"{prefix}{seq:04d}"

def calculate_client_progress(db: Session, client_id: int) -> int:
    """Return onboarding percentage integer 0-100."""
    total = db.query(func.count(ClientOnboardingItem.id)).filter(ClientOnboardingItem.client_id == client_id).scalar() or 0
    if total == 0:
        return 0
    completed = db.query(func.count(ClientOnboardingItem.id)).filter(
        ClientOnboardingItem.client_id == client_id,
        ClientOnboardingItem.completed == True
    ).scalar() or 0
    return int((completed / total) * 100)

@router.post("/from-lead/{lead_id}", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
def convert_lead_to_client(
    lead_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Convert a WON CRM lead into an official Client.
    Validates lead status is 'WON' and ensures no duplicate client conversion.
    Generates unique client code and seeds the 10-step onboarding checklist.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    # 1. Lead must be in WON stage
    if (lead.status or "").upper() != LeadStatus.WON.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only leads with status 'WON' can be converted into clients. Current status: '{lead.status}'."
        )

    # 2. Check if already converted
    existing_client = db.query(Client).filter(Client.lead_id == lead_id).first()
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lead has already been converted to client {existing_client.client_code}."
        )

    try:
        # Generate client code
        client_code = generate_client_code(db)

        # Ensure lead.converted_at is set
        if not lead.converted_at:
            lead.converted_at = datetime.now(timezone.utc)

        # Create Client record
        new_client = Client(
            lead_id=lead.id,
            client_code=client_code,
            name=lead.name,
            business_name=lead.business_name,
            email=lead.email,
            phone=lead.phone,
            website=lead.website,
            business_type=lead.business_type,
            status=ClientStatus.ACTIVE.value,
            source=lead.source or "Website",
            assigned_to=lead.assigned_to,
            onboarding_status=OnboardingStatus.NOT_STARTED.value,
            notes=lead.notes
        )
        db.add(new_client)
        db.flush() # Flush to obtain new_client.id

        # Seed initial 10-item onboarding checklist
        for item in INITIAL_ONBOARDING_CHECKLIST:
            onboarding_item = ClientOnboardingItem(
                client_id=new_client.id,
                item_key=item["key"],
                title=item["title"],
                category=item["category"],
                completed=False,
                order_index=item["order"]
            )
            db.add(onboarding_item)

        # Record activity
        conversion_activity = LeadActivity(
            lead_id=lead.id,
            client_id=new_client.id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Converted from lead to official Client ({client_code}). Initial onboarding checklist created.",
            created_by=admin_user
        )
        db.add(conversion_activity)

        db.commit()
        db.refresh(new_client)

        # Attach progress
        new_client.onboarding_progress = 0
        return new_client
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to convert lead to client: {str(e)}"
        )

@router.get("/stats", response_model=ClientStats)
def get_client_stats(
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Return aggregate metrics for client dashboard.
    """
    try:
        total_clients = db.query(func.count(Client.id)).scalar() or 0
        active_clients = db.query(func.count(Client.id)).filter(Client.status == ClientStatus.ACTIVE.value).scalar() or 0
        onboarding_in_progress = db.query(func.count(Client.id)).filter(Client.onboarding_status == OnboardingStatus.IN_PROGRESS.value).scalar() or 0
        waiting_for_client = db.query(func.count(Client.id)).filter(Client.onboarding_status == OnboardingStatus.WAITING_FOR_CLIENT.value).scalar() or 0
        completed_clients = db.query(func.count(Client.id)).filter(Client.onboarding_status == OnboardingStatus.COMPLETED.value).scalar() or 0

        return ClientStats(
            total_clients=total_clients,
            active_clients=active_clients,
            onboarding_in_progress=onboarding_in_progress,
            waiting_for_client=waiting_for_client,
            completed_clients=completed_clients
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve client statistics."
        )

@router.get("", response_model=List[ClientOut])
def get_clients(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by client status"),
    onboarding_filter: Optional[str] = Query(None, alias="onboarding_status", description="Filter by onboarding status"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned person"),
    search: Optional[str] = Query(None, description="Search client code, business name, contact, email, phone"),
    sort_by: Optional[str] = Query("newest", description="Sort by: newest, oldest, code_asc"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: List clients with search, status filters, and sorting.
    """
    try:
        query = db.query(Client)

        if status_filter:
            norm_st = status_filter.strip().upper()
            if norm_st != "ALL":
                query = query.filter(func.upper(Client.status) == norm_st)

        if onboarding_filter:
            norm_ob = onboarding_filter.strip().upper()
            if norm_ob != "ALL":
                query = query.filter(func.upper(Client.onboarding_status) == norm_ob)

        if assigned_to:
            norm_ass = assigned_to.strip()
            if norm_ass.upper() != "ALL":
                if norm_ass.upper() == "UNASSIGNED":
                    query = query.filter(or_(Client.assigned_to.is_(None), Client.assigned_to == ""))
                else:
                    query = query.filter(Client.assigned_to.ilike(f"%{norm_ass}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Client.client_code.ilike(term),
                    Client.name.ilike(term),
                    Client.business_name.ilike(term),
                    Client.email.ilike(term),
                    Client.phone.ilike(term),
                    Client.notes.ilike(term)
                )
            )

        if sort_by == "oldest":
            query = query.order_by(asc(Client.created_at))
        elif sort_by == "code_asc":
            query = query.order_by(asc(Client.client_code))
        else:
            query = query.order_by(desc(Client.created_at))

        clients = query.all()

        # Compute onboarding progress for each client
        for c in clients:
            c.onboarding_progress = calculate_client_progress(db, c.id)

        return clients
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query clients."
        )

@router.get("/{client_id}", response_model=ClientOut)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Retrieve detailed client profile with onboarding progress.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found."
        )
    client.onboarding_progress = calculate_client_progress(db, client.id)
    return client

@router.patch("/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Update client details, status, or assignment.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found."
        )

    try:
        update_dict = client_update.model_dump(exclude_unset=True)
        old_status = client.status
        old_onboarding = client.onboarding_status

        if "status" in update_dict and update_dict["status"] is not None:
            new_st = update_dict["status"].value if isinstance(update_dict["status"], ClientStatus) else str(update_dict["status"]).upper()
            update_dict["status"] = new_st
            if old_status != new_st:
                db.add(LeadActivity(
                    client_id=client.id,
                    lead_id=client.lead_id,
                    type=ActivityType.STATUS_CHANGE.value,
                    text=f"Client status changed from {old_status} to {new_st}.",
                    created_by=admin_user
                ))

        if "onboarding_status" in update_dict and update_dict["onboarding_status"] is not None:
            new_ob = update_dict["onboarding_status"].value if isinstance(update_dict["onboarding_status"], OnboardingStatus) else str(update_dict["onboarding_status"]).upper()
            update_dict["onboarding_status"] = new_ob
            if new_ob == OnboardingStatus.COMPLETED.value and not client.onboarding_completed_at:
                client.onboarding_completed_at = datetime.now(timezone.utc)
            if old_onboarding != new_ob:
                db.add(LeadActivity(
                    client_id=client.id,
                    lead_id=client.lead_id,
                    type=ActivityType.STATUS_CHANGE.value,
                    text=f"Onboarding status updated from {old_onboarding} to {new_ob}.",
                    created_by=admin_user
                ))

        for key, val in update_dict.items():
            setattr(client, key, val)

        client.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(client)

        client.onboarding_progress = calculate_client_progress(db, client.id)
        return client
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update client."
        )

@router.get("/{client_id}/onboarding", response_model=ClientOnboardingResponse)
def get_client_onboarding(
    client_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Fetch the 10-step onboarding checklist and current completion progress.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found."
        )

    items = db.query(ClientOnboardingItem).filter(
        ClientOnboardingItem.client_id == client_id
    ).order_by(asc(ClientOnboardingItem.order_index)).all()

    total_items = len(items)
    completed_items = sum(1 for it in items if it.completed)
    progress_percentage = int((completed_items / total_items) * 100) if total_items > 0 else 0

    return ClientOnboardingResponse(
        client_id=client.id,
        client_code=client.client_code,
        business_name=client.business_name,
        onboarding_status=client.onboarding_status,
        onboarding_completed_at=client.onboarding_completed_at,
        total_items=total_items,
        completed_items=completed_items,
        progress_percentage=progress_percentage,
        items=items
    )

@router.patch("/{client_id}/onboarding", response_model=ClientOnboardingResponse)
def update_client_onboarding(
    client_id: int,
    batch_update: OnboardingBatchUpdate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Update checklist items (mark complete/incomplete, add notes)
    and calculate onboarding progression.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found."
        )

    try:
        now = datetime.now(timezone.utc)

        # Update each checklist item
        for item_data in batch_update.items:
            item = db.query(ClientOnboardingItem).filter(
                ClientOnboardingItem.id == item_data.item_id,
                ClientOnboardingItem.client_id == client_id
            ).first()

            if item:
                was_completed = item.completed
                item.completed = item_data.completed

                if item_data.completed and not was_completed:
                    item.completed_at = now
                    # Log activity
                    db.add(LeadActivity(
                        client_id=client.id,
                        lead_id=client.lead_id,
                        type=ActivityType.NOTE.value,
                        text=f"Onboarding item '{item.title}' marked as completed.",
                        created_by=admin_user
                    ))
                elif not item_data.completed and was_completed:
                    item.completed_at = None

                if item_data.notes is not None:
                    item.notes = item_data.notes.strip() if item_data.notes else None

        db.flush()

        # Recalculate completion
        items = db.query(ClientOnboardingItem).filter(
            ClientOnboardingItem.client_id == client_id
        ).order_by(asc(ClientOnboardingItem.order_index)).all()

        total_items = len(items)
        completed_items = sum(1 for it in items if it.completed)
        progress_percentage = int((completed_items / total_items) * 100) if total_items > 0 else 0

        # Auto-update client onboarding status based on progression
        if completed_items == total_items and total_items > 0:
            client.onboarding_status = OnboardingStatus.COMPLETED.value
            if not client.onboarding_completed_at:
                client.onboarding_completed_at = now
                db.add(LeadActivity(
                    client_id=client.id,
                    lead_id=client.lead_id,
                    type=ActivityType.STATUS_CHANGE.value,
                    text=f"All {total_items} onboarding checklist items completed! Client is now fully onboarded.",
                    created_by=admin_user
                ))
        elif completed_items > 0 and client.onboarding_status == OnboardingStatus.NOT_STARTED.value:
            client.onboarding_status = OnboardingStatus.IN_PROGRESS.value

        # Explicit status override if provided
        if batch_update.onboarding_status is not None:
            new_st = batch_update.onboarding_status.value
            client.onboarding_status = new_st
            if new_st == OnboardingStatus.COMPLETED.value and not client.onboarding_completed_at:
                client.onboarding_completed_at = now

        client.updated_at = now
        db.commit()

        return ClientOnboardingResponse(
            client_id=client.id,
            client_code=client.client_code,
            business_name=client.business_name,
            onboarding_status=client.onboarding_status,
            onboarding_completed_at=client.onboarding_completed_at,
            total_items=total_items,
            completed_items=completed_items,
            progress_percentage=progress_percentage,
            items=items
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update onboarding items."
        )

@router.get("/{client_id}/activities", response_model=List[LeadActivityOut])
def get_client_activities(
    client_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Fetch chronological activity feed for a client (including pre-conversion lead activities).
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found."
        )

    activities = db.query(LeadActivity).filter(
        or_(
            LeadActivity.client_id == client_id,
            LeadActivity.lead_id == client.lead_id
        )
    ).order_by(desc(LeadActivity.created_at)).all()
    return activities

@router.post("/{client_id}/activities", response_model=LeadActivityOut, status_code=status.HTTP_201_CREATED)
def create_client_activity(
    client_id: int,
    activity_in: LeadActivityCreate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Record a note, call, email, WhatsApp, or meeting activity for a client.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found."
        )

    try:
        act_type = activity_in.type.value if isinstance(activity_in.type, ActivityType) else str(activity_in.type).upper()
        new_activity = LeadActivity(
            client_id=client_id,
            lead_id=client.lead_id,
            type=act_type,
            text=activity_in.text.strip(),
            created_by=activity_in.created_by or admin_user
        )
        db.add(new_activity)
        client.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(new_activity)
        return new_activity
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log client activity."
        )
