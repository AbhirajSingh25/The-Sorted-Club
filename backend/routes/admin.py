from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import (
    Lead,
    Client,
    Proposal,
    ProposalStatus,
    Invoice,
    InvoiceStatus,
    PaymentConfirmation,
    PaymentConfirmationStatus,
    Project,
    ProjectStatus,
    ProjectHealth,
    ProjectApproval,
    ApprovalStatus,
    Notification,
    LeadActivity,
    ProjectActivity
)
from schemas import (
    CommandCenterMetrics,
    AttentionItem,
    RecentActivityItem
)
from auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Command Center"])

@router.get("/command-center", response_model=CommandCenterMetrics)
def get_command_center_metrics(
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Central operational command cockpit aggregator for founder daily execution.
    Returns counts for leads, follow-ups, proposals, verifications, invoices,
    active projects, health blockers, and curated attention items.
    """
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    # 1. Lead & Follow-Up Metrics
    new_leads_count = db.query(Lead).filter(Lead.status == "NEW").count()
    followups_due_today_count = db.query(Lead).filter(
        Lead.next_follow_up_at >= today_start,
        Lead.next_follow_up_at < today_end,
        Lead.status.notin_(["WON", "LOST"])
    ).count()
    followups_overdue_count = db.query(Lead).filter(
        Lead.next_follow_up_at < today_start,
        Lead.status.notin_(["WON", "LOST"])
    ).count()

    # 2. Commercial Metrics
    proposals_awaiting_count = db.query(Proposal).filter(
        Proposal.status.in_([ProposalStatus.SENT.value, ProposalStatus.DRAFT.value])
    ).count()
    payments_awaiting_verification_count = db.query(PaymentConfirmation).filter(
        PaymentConfirmation.status == PaymentConfirmationStatus.PENDING_VERIFICATION.value
    ).count()

    unpaid_invoices = db.query(Invoice).filter(
        Invoice.status.notin_([InvoiceStatus.PAID.value, InvoiceStatus.CANCELLED.value])
    ).all()
    outstanding_invoice_amount = round(sum(inv.amount_due for inv in unpaid_invoices), 2)

    # 3. Delivery & Health Metrics
    active_projects_count = db.query(Project).filter(
        Project.status.in_([
            ProjectStatus.IN_PROGRESS.value,
            ProjectStatus.WAITING_FOR_CLIENT.value,
            ProjectStatus.IN_REVIEW.value
        ])
    ).count()
    projects_at_risk_count = db.query(Project).filter(
        Project.health.in_([ProjectHealth.AT_RISK.value, ProjectHealth.BLOCKED.value, ProjectHealth.OVERDUE.value]),
        Project.status != ProjectStatus.COMPLETED.value
    ).count()
    client_approvals_waiting_count = db.query(ProjectApproval).filter(
        ProjectApproval.status == ApprovalStatus.PENDING.value
    ).count()

    # 4. System Notifications
    unread_notifications_count = db.query(Notification).filter(
        Notification.is_read == False
    ).count()

    # 5. Attention Items (What Needs Attention Today)
    attention_items: List[AttentionItem] = []

    # Priority A: Pending Payment Verifications (Cashflow)
    pending_confs = db.query(PaymentConfirmation).filter(
        PaymentConfirmation.status == PaymentConfirmationStatus.PENDING_VERIFICATION.value
    ).order_by(desc(PaymentConfirmation.created_at)).limit(5).all()

    for conf in pending_confs:
        client = db.query(Client).filter(Client.id == conf.client_id).first()
        biz = client.business_name if client else conf.payer_name
        attention_items.append(AttentionItem(
            id=f"pay_conf_{conf.id}",
            type="PENDING_PAYMENT",
            title=f"Verify Payment: {biz} ({conf.payment_method})",
            subtitle=f"Claimed {conf.amount:,.2f} (Ref: {conf.reference or 'None'}). Requires verification.",
            action_label="Verify Payment",
            action_url="/admin/finance?tab=verifications",
            priority="URGENT",
            timestamp=conf.created_at
        ))

    # Priority B: Overdue Follow-ups (Sales pipeline velocity)
    overdue_leads = db.query(Lead).filter(
        Lead.next_follow_up_at < today_start,
        Lead.status.notin_(["WON", "LOST"])
    ).order_by(asc(Lead.next_follow_up_at)).limit(5).all()

    for lead in overdue_leads:
        attention_items.append(AttentionItem(
            id=f"lead_followup_{lead.id}",
            type="OVERDUE_FOLLOWUP",
            title=f"Overdue Follow-up: {lead.business_name}",
            subtitle=f"Contact {lead.name} ({lead.phone}). Scheduled for {lead.next_follow_up_at.strftime('%b %d') if lead.next_follow_up_at else 'Past'}.",
            action_label="Open Lead",
            action_url=f"/admin/crm?selectedLead={lead.id}",
            priority="HIGH",
            timestamp=lead.next_follow_up_at
        ))

    # Priority C: Blocked / At Risk Projects (Delivery SLAs)
    blocked_projects = db.query(Project).filter(
        Project.health.in_([ProjectHealth.BLOCKED.value, ProjectHealth.AT_RISK.value]),
        Project.status != ProjectStatus.COMPLETED.value
    ).order_by(desc(Project.updated_at)).limit(5).all()

    for proj in blocked_projects:
        client = db.query(Client).filter(Client.id == proj.client_id).first()
        biz = client.business_name if client else "Client"
        attention_items.append(AttentionItem(
            id=f"project_health_{proj.id}",
            type="BLOCKED_PROJECT",
            title=f"Project {proj.health.replace('_', ' ')}: {proj.name}",
            subtitle=f"{biz} • Waiting on: {proj.waiting_for or 'Unresolved blocker'}.",
            action_label="View Project",
            action_url=f"/admin/projects?selectedProject={proj.id}",
            priority="HIGH",
            timestamp=proj.updated_at
        ))

    # Priority D: Pending Client Approvals
    pending_approvals = db.query(ProjectApproval).filter(
        ProjectApproval.status == ApprovalStatus.PENDING.value
    ).order_by(desc(ProjectApproval.created_at)).limit(5).all()

    for appr in pending_approvals:
        proj = db.query(Project).filter(Project.id == appr.project_id).first()
        attention_items.append(AttentionItem(
            id=f"approval_{appr.id}",
            type="PENDING_APPROVAL",
            title=f"Approval Pending: {appr.title}",
            subtitle=f"Project {proj.name if proj else ''} • {appr.item_type} awaiting client sign-off.",
            action_label="View Approvals",
            action_url=f"/admin/projects?selectedProject={appr.project_id}",
            priority="MEDIUM",
            timestamp=appr.created_at
        ))

    # Priority E: Unhandled New Leads
    fresh_leads = db.query(Lead).filter(
        Lead.status == "NEW"
    ).order_by(desc(Lead.created_at)).limit(5).all()

    for lead in fresh_leads:
        attention_items.append(AttentionItem(
            id=f"lead_new_{lead.id}",
            type="UNREAD_INQUIRY",
            title=f"New Lead: {lead.business_name}",
            subtitle=f"{lead.name} inquired for {lead.service_interest} ({lead.budget}).",
            action_label="Qualify Lead",
            action_url=f"/admin/crm?selectedLead={lead.id}",
            priority="HIGH",
            timestamp=lead.created_at
        ))

    # 6. Unified Recent Activities
    recent_activities: List[RecentActivityItem] = []

    lead_acts = db.query(LeadActivity).order_by(desc(LeadActivity.created_at)).limit(10).all()
    for act in lead_acts:
        recent_activities.append(RecentActivityItem(
            id=f"crm_act_{act.id}",
            category="CRM",
            title=f"Sales CRM: {act.type.replace('_', ' ').title()}",
            description=act.text,
            action_url=f"/admin/crm?selectedLead={act.lead_id}" if act.lead_id else "/admin/crm",
            timestamp=act.created_at
        ))

    proj_acts = db.query(ProjectActivity).order_by(desc(ProjectActivity.created_at)).limit(10).all()
    for act in proj_acts:
        proj = db.query(Project).filter(Project.id == act.project_id).first()
        recent_activities.append(RecentActivityItem(
            id=f"proj_act_{act.id}",
            category="DELIVERY",
            title=f"Delivery: {proj.name if proj else 'Project'}",
            description=act.description,
            action_url=f"/admin/projects?selectedProject={act.project_id}",
            timestamp=act.created_at
        ))

    # Sort combined activities desc by timestamp
    recent_activities.sort(key=lambda x: x.timestamp, reverse=True)
    recent_activities = recent_activities[:15]

    return CommandCenterMetrics(
        new_leads_count=new_leads_count,
        followups_due_today_count=followups_due_today_count,
        followups_overdue_count=followups_overdue_count,
        proposals_awaiting_count=proposals_awaiting_count,
        payments_awaiting_verification_count=payments_awaiting_verification_count,
        outstanding_invoice_amount=outstanding_invoice_amount,
        active_projects_count=active_projects_count,
        projects_at_risk_count=projects_at_risk_count,
        client_approvals_waiting_count=client_approvals_waiting_count,
        unread_notifications_count=unread_notifications_count,
        attention_items=attention_items,
        recent_activities=recent_activities
    )
