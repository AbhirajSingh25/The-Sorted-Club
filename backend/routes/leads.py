from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import Lead, Client, LeadActivity, LeadStatus, LeadPriority, ActivityType
from schemas import (
    LeadCreate,
    LeadUpdate,
    LeadOut,
    LeadStats,
    CRMMetrics,
    LeadActivityCreate,
    LeadActivityOut
)
from auth import get_current_admin
from rate_limiter import limiter
from services.notification_service import send_business_notification, send_customer_email

router = APIRouter(prefix="/api/leads", tags=["Leads & CRM"])

@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(lead_in: LeadCreate, request: Request, db: Session = Depends(get_db)):
    """
    Public endpoint: Submit a new business inquiry / lead.
    Validates all inputs and persists the inquiry with status 'NEW' and source 'Website'.
    Rate limited to 10 inquiries per minute per IP.
    """
    limiter.check(request, "lead_create", max_requests=10, window_seconds=60)
    try:
        lead_data = lead_in.model_dump(exclude={"consent"})
        new_lead = Lead(
            name=lead_data["name"],
            business_name=lead_data["business_name"],
            email=lead_data["email"],
            phone=lead_data["phone"],
            website=lead_data.get("website"),
            business_type=lead_data["business_type"],
            service_interest=lead_data["service_interest"],
            problem=lead_data["problem"],
            budget=lead_data["budget"],
            status=lead_data.get("status") or LeadStatus.NEW.value,
            source=lead_data.get("source") or "Website",
            utm_source=lead_data.get("utm_source"),
            utm_medium=lead_data.get("utm_medium"),
            utm_campaign=lead_data.get("utm_campaign"),
            utm_content=lead_data.get("utm_content"),
            referral_source=lead_data.get("referral_source"),
            priority=lead_data.get("priority") or LeadPriority.MEDIUM.value,
            assigned_to=lead_data.get("assigned_to"),
            estimated_value=lead_data.get("estimated_value"),
            next_follow_up_at=lead_data.get("next_follow_up_at"),
            last_contacted_at=lead_data.get("last_contacted_at"),
            notes=lead_data.get("notes"),
            qualification_notes=lead_data.get("qualification_notes"),
            decision_maker=lead_data.get("decision_maker"),
            budget_fit=lead_data.get("budget_fit"),
            timeline=lead_data.get("timeline"),
            relevant_template=lead_data.get("relevant_template"),
            problem_noticed=lead_data.get("problem_noticed"),
            has_real_business=bool(lead_data.get("has_real_business", False)),
            has_clear_need=bool(lead_data.get("has_clear_need", False)),
            has_budget=bool(lead_data.get("has_budget", False)),
            has_timeline=bool(lead_data.get("has_timeline", False)),
            is_decision_maker=bool(lead_data.get("is_decision_maker", False)),
            responds_communication=bool(lead_data.get("responds_communication", False)),
            qualification_score=lead_data.get("qualification_score") or sum([
                bool(lead_data.get("has_real_business")),
                bool(lead_data.get("has_clear_need")),
                bool(lead_data.get("has_budget")),
                bool(lead_data.get("has_timeline")),
                bool(lead_data.get("is_decision_maker")),
                bool(lead_data.get("responds_communication"))
            ])
        )
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)

        # Record initial inquiry submission activity
        initial_activity = LeadActivity(
            lead_id=new_lead.id,
            type=ActivityType.NOTE.value,
            text=f"Inquiry received via {new_lead.source}. Service: {new_lead.service_interest}, Budget: {new_lead.budget}.",
            created_by="System"
        )
        db.add(initial_activity)
        db.commit()

        # Trigger customer acknowledgement email
        send_customer_email(
            db=db,
            recipient=new_lead.email,
            event_type="INQUIRY_RECEIVED",
            subject="We received your brief — The Sorted Club",
            title=f"Thanks for reaching out, {new_lead.name}!",
            message=f"We have received your inquiry for {new_lead.service_interest}. Our core team is reviewing your requirements and will connect with you within 24 business hours.",
            data={
                "Requested Service": new_lead.service_interest,
                "Company": new_lead.business_name,
                "Indicated Budget": new_lead.budget
            }
        )

        # Trigger admin notification & email
        send_business_notification(
            db=db,
            event_type="NEW_INQUIRY",
            subject=f"[The Sorted Club] New Inquiry — {new_lead.business_name}",
            title=f"New Inquiry: {new_lead.business_name}",
            message=f"New business inquiry received for {new_lead.service_interest}. Budget: {new_lead.budget}. Contact: {new_lead.name} ({new_lead.phone}).",
            data={
                "Business": new_lead.business_name,
                "Contact Name": new_lead.name,
                "Email": new_lead.email,
                "Phone": new_lead.phone,
                "Service Needed": new_lead.service_interest,
                "Budget": new_lead.budget,
                "Source Channel": new_lead.source,
                "Problem Brief": new_lead.problem
            },
            entity_type="lead",
            entity_id=new_lead.id,
            action_url=f"/admin/crm?selectedLead={new_lead.id}"
        )

        # Trigger Web Push notification for iPhone & desktop admin devices
        try:
            from services.push_service import send_web_push

            lead_name = (new_lead.name or new_lead.business_name or "").strip()
            service = (new_lead.service_interest or "").strip()
            if lead_name and service:
                push_body = f"{lead_name} · {service}"
            elif lead_name:
                push_body = lead_name
            elif service:
                push_body = service
            else:
                push_body = "A new inquiry has arrived."

            send_web_push(
                db=db,
                title="New website inquiry",
                body=push_body,
                url=f"/admin/crm?selectedLead={new_lead.id}",
                tag=f"lead-{new_lead.id}",
                event_type="NEW_INQUIRY"
            )
        except Exception:
            pass

        return new_lead
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to submit inquiry at this time. Please try again shortly."
        )

@router.get("/stats", response_model=LeadStats)
def get_lead_stats(
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Return basic aggregate counts for public dashboard.
    """
    try:
        total = db.query(func.count(Lead.id)).scalar() or 0
        new_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.NEW.value).scalar() or 0
        contacted_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.CONTACTED.value).scalar() or 0
        qualified_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.QUALIFIED.value).scalar() or 0
        proposal_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.PROPOSAL.value).scalar() or 0
        won_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.WON.value).scalar() or 0
        lost_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.LOST.value).scalar() or 0

        return LeadStats(
            total=total,
            new=new_count,
            contacted=contacted_count,
            qualified=qualified_count,
            proposal=proposal_count,
            won=won_count,
            lost=lost_count
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve lead statistics."
        )

@router.get("/crm-stats", response_model=CRMMetrics)
def get_crm_metrics(
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Calculate real CRM sales pipeline metrics.
    """
    try:
        now = datetime.now(timezone.utc)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_today = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Stage counts
        new_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.NEW.value).scalar() or 0
        contacted_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.CONTACTED.value).scalar() or 0
        replied_count = db.query(func.count(Lead.id)).filter(func.upper(Lead.status) == "REPLIED").scalar() or 0
        discovery_call_count = db.query(func.count(Lead.id)).filter(func.upper(Lead.status) == "DISCOVERY_CALL").scalar() or 0
        qualified_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.QUALIFIED.value).scalar() or 0
        proposal_count = db.query(func.count(Lead.id)).filter(or_(Lead.status == LeadStatus.PROPOSAL.value, func.upper(Lead.status) == "PROPOSAL_SENT")).scalar() or 0
        proposal_sent_count = db.query(func.count(Lead.id)).filter(func.upper(Lead.status) == "PROPOSAL_SENT").scalar() or 0
        negotiation_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.NEGOTIATION.value).scalar() or 0
        won_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.WON.value).scalar() or 0
        lost_count = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.LOST.value).scalar() or 0
        follow_up_required_count = db.query(func.count(Lead.id)).filter(func.upper(Lead.status) == "FOLLOW_UP_REQUIRED").scalar() or 0

        active_stages = [
            LeadStatus.NEW.value,
            LeadStatus.CONTACTED.value,
            "REPLIED",
            "DISCOVERY_CALL",
            LeadStatus.QUALIFIED.value,
            LeadStatus.PROPOSAL.value,
            "PROPOSAL_SENT",
            LeadStatus.NEGOTIATION.value,
            "FOLLOW_UP_REQUIRED"
        ]

        active_deals_count = (
            new_count + contacted_count + replied_count + discovery_call_count +
            qualified_count + proposal_count + proposal_sent_count +
            negotiation_count + follow_up_required_count
        )

        # Total pipeline value (sum of estimated_value for active deals)
        total_pipeline_value = db.query(func.sum(Lead.estimated_value)).filter(
            Lead.status.in_(active_stages),
            Lead.estimated_value.isnot(None)
        ).scalar() or 0.0

        # Won value
        won_value = db.query(func.sum(Lead.estimated_value)).filter(
            Lead.status == LeadStatus.WON.value,
            Lead.estimated_value.isnot(None)
        ).scalar() or 0.0

        # Win Rate
        closed_total = won_count + lost_count
        win_rate = (won_count / closed_total * 100.0) if closed_total > 0 else 0.0

        # Average Deal Value
        if won_count > 0 and won_value > 0:
            avg_deal_value = won_value / won_count
        elif active_deals_count > 0 and total_pipeline_value > 0:
            avg_deal_value = total_pipeline_value / active_deals_count
        else:
            avg_deal_value = 0.0

        # Follow-ups due today (only for non-closed deals)
        followups_due_today = db.query(func.count(Lead.id)).filter(
            Lead.status.in_(active_stages),
            Lead.next_follow_up_at.isnot(None),
            Lead.next_follow_up_at >= start_of_today,
            Lead.next_follow_up_at <= end_of_today
        ).scalar() or 0

        # Overdue follow-ups (before now, non-closed)
        followups_overdue = db.query(func.count(Lead.id)).filter(
            Lead.status.in_(active_stages),
            Lead.next_follow_up_at.isnot(None),
            Lead.next_follow_up_at < now
        ).scalar() or 0

        # Source Breakdown
        source_counts = db.query(Lead.source, func.count(Lead.id)).group_by(Lead.source).all()
        breakdown_by_source = {s or "Unknown": count for s, count in source_counts}

        # Service Breakdown
        service_counts = db.query(Lead.service_interest, func.count(Lead.id)).group_by(Lead.service_interest).all()
        breakdown_by_service = {srv or "Unknown": count for srv, count in service_counts}

        return CRMMetrics(
            total_pipeline_value=round(float(total_pipeline_value), 2),
            active_deals_count=active_deals_count,
            new_count=new_count,
            contacted_count=contacted_count,
            qualified_count=qualified_count,
            proposal_count=proposal_count,
            negotiation_count=negotiation_count,
            won_count=won_count,
            won_value=round(float(won_value), 2),
            lost_count=lost_count,
            win_rate_percentage=round(float(win_rate), 1),
            avg_deal_value=round(float(avg_deal_value), 2),
            followups_due_today=followups_due_today,
            followups_overdue=followups_overdue,
            replied_count=replied_count,
            discovery_call_count=discovery_call_count,
            proposal_sent_count=proposal_sent_count,
            follow_up_required_count=follow_up_required_count,
            breakdown_by_source=breakdown_by_source,
            breakdown_by_service=breakdown_by_service
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate CRM sales metrics."
        )

@router.get("", response_model=List[LeadOut])
def get_leads(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status/stage"),
    service_interest: Optional[str] = Query(None, description="Filter by service interest"),
    priority: Optional[str] = Query(None, description="Filter by priority: LOW, MEDIUM, HIGH, URGENT"),
    source: Optional[str] = Query(None, description="Filter by lead source"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned team member"),
    follow_up_filter: Optional[str] = Query(None, description="Filter follow-ups: ALL, TODAY, OVERDUE, UPCOMING, NO_FOLLOWUP"),
    search: Optional[str] = Query(None, description="Search across name, company, email, phone, business type, brief, and notes"),
    sort_by: Optional[str] = Query("newest", description="Sort by: newest, value_desc, follow_up_asc"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: List leads with comprehensive CRM filters and sorting.
    """
    try:
        now = datetime.now(timezone.utc)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_today = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        query = db.query(Lead)

        # Status filter
        if status_filter:
            norm_status = status_filter.strip().upper()
            if norm_status != "ALL":
                query = query.filter(func.upper(Lead.status) == norm_status)

        # Service filter
        if service_interest:
            norm_service = service_interest.strip()
            if norm_service.upper() != "ALL":
                query = query.filter(Lead.service_interest.ilike(f"%{norm_service}%"))

        # Priority filter
        if priority:
            norm_prio = priority.strip().upper()
            if norm_prio != "ALL":
                query = query.filter(func.upper(Lead.priority) == norm_prio)

        # Source filter
        if source:
            norm_source = source.strip()
            if norm_source.upper() != "ALL":
                query = query.filter(Lead.source.ilike(f"%{norm_source}%"))

        # Assigned to filter
        if assigned_to:
            norm_assigned = assigned_to.strip()
            if norm_assigned.upper() != "ALL":
                if norm_assigned.upper() == "UNASSIGNED":
                    query = query.filter(or_(Lead.assigned_to.is_(None), Lead.assigned_to == ""))
                else:
                    query = query.filter(Lead.assigned_to.ilike(f"%{norm_assigned}%"))

        # Follow-up filter
        if follow_up_filter:
            f_norm = follow_up_filter.strip().upper()
            if f_norm == "TODAY":
                query = query.filter(
                    Lead.next_follow_up_at.isnot(None),
                    Lead.next_follow_up_at >= start_of_today,
                    Lead.next_follow_up_at <= end_of_today
                )
            elif f_norm == "OVERDUE":
                query = query.filter(
                    Lead.next_follow_up_at.isnot(None),
                    Lead.next_follow_up_at < now
                )
            elif f_norm == "UPCOMING":
                query = query.filter(
                    Lead.next_follow_up_at.isnot(None),
                    Lead.next_follow_up_at > end_of_today
                )
            elif f_norm == "NO_FOLLOWUP":
                query = query.filter(Lead.next_follow_up_at.is_(None))

        # Search term across multiple fields
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Lead.name.ilike(term),
                    Lead.business_name.ilike(term),
                    Lead.email.ilike(term),
                    Lead.phone.ilike(term),
                    Lead.problem.ilike(term),
                    Lead.business_type.ilike(term),
                    Lead.notes.ilike(term),
                    Lead.assigned_to.ilike(term),
                    Lead.source.ilike(term),
                    Lead.problem_noticed.ilike(term),
                    Lead.relevant_template.ilike(term),
                    Lead.qualification_notes.ilike(term)
                )
            )

        # Sorting
        if sort_by == "value_desc":
            query = query.order_by(desc(Lead.estimated_value).nullslast(), desc(Lead.created_at))
        elif sort_by == "follow_up_asc":
            query = query.order_by(asc(Lead.next_follow_up_at).nullslast(), desc(Lead.created_at))
        else:
            query = query.order_by(desc(Lead.created_at))

        leads = query.all()
        # Enrich leads with client conversion info
        if leads:
            lead_ids = [l.id for l in leads]
            clients = db.query(Client).filter(Client.lead_id.in_(lead_ids)).all()
            client_map = {c.lead_id: c for c in clients}
            for l in leads:
                c = client_map.get(l.id)
                if c:
                    l.is_converted = True
                    l.client_id = c.id
                    l.client_code = c.client_code
                else:
                    l.is_converted = False
                    l.client_id = None
                    l.client_code = None

        return leads
    except Exception as e:
        import logging
        logging.getLogger("the_sorted_club.leads").error(f"Failed to query leads: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query leads."
        )

@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Fetch details for a specific lead.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    c = db.query(Client).filter(Client.lead_id == lead.id).first()
    if c:
        lead.is_converted = True
        lead.client_id = c.id
        lead.client_code = c.client_code
    else:
        lead.is_converted = False
        lead.client_id = None
        lead.client_code = None

    return lead

@router.patch("/{lead_id}", response_model=LeadOut)
def update_lead(
    lead_id: int,
    update_data: LeadUpdate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Update fields or status of an existing lead.
    Automatically refreshes updated_at, logs status changes to activities,
    and sets converted_at when status becomes WON.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        old_status = lead.status

        # Handle status update
        if "status" in update_dict and update_dict["status"] is not None:
            new_status = update_dict["status"]
            if isinstance(new_status, LeadStatus):
                new_status_str = new_status.value
            else:
                new_status_str = str(new_status).upper()
            update_dict["status"] = new_status_str

            if old_status != new_status_str:
                # Log status change activity
                status_activity = LeadActivity(
                    lead_id=lead.id,
                    type=ActivityType.STATUS_CHANGE.value,
                    text=f"Stage moved from {old_status} to {new_status_str}.",
                    created_by=admin_user
                )
                db.add(status_activity)

                # Set converted_at if won
                if new_status_str == LeadStatus.WON.value and not lead.converted_at:
                    lead.converted_at = datetime.now(timezone.utc)

        # Handle priority update
        if "priority" in update_dict and update_dict["priority"] is not None:
            if isinstance(update_dict["priority"], LeadPriority):
                update_dict["priority"] = update_dict["priority"].value
            else:
                update_dict["priority"] = str(update_dict["priority"]).upper()

        # Handle qualification score calculation
        qual_keys = ["has_real_business", "has_clear_need", "has_budget", "has_timeline", "is_decision_maker", "responds_communication"]
        if any(k in update_dict for k in qual_keys):
            has_rb = update_dict.get("has_real_business", lead.has_real_business)
            has_cn = update_dict.get("has_clear_need", lead.has_clear_need)
            has_b = update_dict.get("has_budget", lead.has_budget)
            has_tl = update_dict.get("has_timeline", lead.has_timeline)
            is_dm = update_dict.get("is_decision_maker", lead.is_decision_maker)
            resp = update_dict.get("responds_communication", lead.responds_communication)
            if "qualification_score" not in update_dict:
                update_dict["qualification_score"] = sum([bool(has_rb), bool(has_cn), bool(has_b), bool(has_tl), bool(is_dm), bool(resp)])

        for key, value in update_dict.items():
            setattr(lead, key, value)

        lead.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(lead)

        c = db.query(Client).filter(Client.lead_id == lead.id).first()
        if c:
            lead.is_converted = True
            lead.client_id = c.id
            lead.client_code = c.client_code
        else:
            lead.is_converted = False
            lead.client_id = None
            lead.client_code = None

        return lead
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import logging
        logging.getLogger("the_sorted_club.leads").error(f"Failed to update lead {lead_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lead: {str(e)}"
        )

class FollowUpCompleteIn(BaseModel):
    notes: Optional[str] = None
    next_follow_up_at: Optional[datetime] = None

@router.post("/{lead_id}/complete-follow-up", response_model=LeadOut)
def complete_lead_follow_up(
    lead_id: int,
    follow_up_in: Optional[FollowUpCompleteIn] = None,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Mark current follow-up complete, log activity, and optionally schedule next follow-up.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    now = datetime.now(timezone.utc)
    notes_text = follow_up_in.notes.strip() if follow_up_in and follow_up_in.notes else "Completed follow-up action."
    next_date = follow_up_in.next_follow_up_at if follow_up_in else None

    # Log activity
    db.add(LeadActivity(
        lead_id=lead.id,
        type=ActivityType.NOTE.value,
        text=f"Follow-up completed: {notes_text}" + (f" Next follow-up scheduled for {next_date.strftime('%d %b %Y, %I:%M %p UTC')}." if next_date else " No further follow-up scheduled."),
        created_by=admin_user
    ))

    lead.last_contacted_at = now
    lead.next_follow_up_at = next_date
    lead.updated_at = now

    db.commit()
    db.refresh(lead)

    c = db.query(Client).filter(Client.lead_id == lead.id).first()
    if c:
        lead.is_converted = True
        lead.client_id = c.id
        lead.client_code = c.client_code
    return lead

@router.delete("/{lead_id}", status_code=status.HTTP_200_OK)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Delete a lead and its associated activities permanently.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    try:
        db.delete(lead)
        db.commit()
        return {"message": f"Lead {lead_id} deleted successfully.", "id": lead_id}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete lead."
        )

@router.get("/{lead_id}/activities", response_model=List[LeadActivityOut])
def get_lead_activities(
    lead_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Retrieve chronological activity log for a specific lead.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    activities = db.query(LeadActivity).filter(
        LeadActivity.lead_id == lead_id
    ).order_by(desc(LeadActivity.created_at)).all()
    return activities

@router.post("/{lead_id}/activities", response_model=LeadActivityOut, status_code=status.HTTP_201_CREATED)
def create_lead_activity(
    lead_id: int,
    activity_in: LeadActivityCreate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Add an activity entry (Note, Call, Email, WhatsApp, Meeting) to a lead.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found."
        )

    try:
        act_type = activity_in.type.value if isinstance(activity_in.type, ActivityType) else str(activity_in.type).upper()
        new_activity = LeadActivity(
            lead_id=lead_id,
            type=act_type,
            text=activity_in.text.strip(),
            created_by=activity_in.created_by or admin_user
        )
        db.add(new_activity)

        # Update last_contacted_at on call/email/whatsapp/meeting
        if act_type in [ActivityType.CALL.value, ActivityType.EMAIL.value, ActivityType.WHATSAPP.value, ActivityType.MEETING.value]:
            lead.last_contacted_at = datetime.now(timezone.utc)
            lead.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(new_activity)
        return new_activity
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record lead activity."
        )
