import re
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import (
    Client,
    Proposal,
    Contract,
    Invoice,
    ClientOnboardingItem,
    Project,
    ProjectStatus,
    ProjectPriority,
    ProjectHealth,
    ServiceType,
    MilestoneStatus,
    ApprovalStatus,
    ApprovalItemType,
    ProjectUpdateCategory,
    ProjectBrief,
    ProjectMilestone,
    ProjectApproval,
    ProjectUpdate,
    ProjectTask,
    TaskStatus,
    TaskPriority,
    ProjectActivity,
    ProjectActivityType,
    ProjectResource,
    ResourceType,
    LeadActivity,
    ActivityType
)
from schemas import (
    ProjectCreate,
    ProjectPatchIn,
    ProjectOut,
    ProjectStatsOut,
    ProjectBriefCreate,
    ProjectBriefUpdate,
    ProjectBriefOut,
    ProjectMilestoneCreate,
    ProjectMilestoneUpdate,
    ProjectMilestoneOut,
    ProjectApprovalCreate,
    ProjectApprovalOut,
    PublicApprovalOut,
    PublicApprovalDecisionIn,
    ProjectUpdateCreate,
    ProjectUpdateOut,
    PublicProjectUpdateOut,
    ProjectHandoverUpdateIn,
    PublicProjectOut,
    ProjectTaskCreate,
    ProjectTaskUpdate,
    ProjectTaskOut,
    ProjectActivityCreate,
    ProjectActivityOut,
    ProjectResourceCreate,
    ProjectResourceUpdate,
    ProjectResourceOut
)
from auth import get_current_admin
from rate_limiter import limiter
from services.notification_service import send_business_notification

router = APIRouter(tags=["Project Delivery & Build Engine"])

def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

# ==============================================================================
# DEFAULT DELIVERY TEMPLATES & CHECKLISTS
# ==============================================================================

DEFAULT_BUILD_MILESTONES = [
    {"title": "Discovery", "description": "Business scope, requirements, target audience & sitemap", "order_index": 0},
    {"title": "Design", "description": "Wireframes, UI designs & client visual approval", "order_index": 1},
    {"title": "Development", "description": "Frontend, backend, integrations & CMS implementation", "order_index": 2},
    {"title": "QA & Testing", "description": "Desktop, mobile, browser, speed & form testing", "order_index": 3},
    {"title": "Client Review", "description": "Live client review walkthrough & revision round", "order_index": 4},
    {"title": "Launch & Deployment", "description": "Domain, SSL, production hosting & analytics setup", "order_index": 5},
    {"title": "Handover & Completion", "description": "Documentation, secure credentials transfer & signoff", "order_index": 6},
]

DEFAULT_DISCOVERY_CHECKLIST = [
    {"key": "disc_1", "title": "Business goals confirmed", "completed": False, "notes": ""},
    {"key": "disc_2", "title": "Target audience confirmed", "completed": False, "notes": ""},
    {"key": "disc_3", "title": "Sitemap/pages confirmed", "completed": False, "notes": ""},
    {"key": "disc_4", "title": "Required functionality confirmed", "completed": False, "notes": ""},
    {"key": "disc_5", "title": "Brand assets received", "completed": False, "notes": ""},
    {"key": "disc_6", "title": "Content status confirmed", "completed": False, "notes": ""},
    {"key": "disc_7", "title": "Domain confirmed", "completed": False, "notes": ""},
    {"key": "disc_8", "title": "Hosting confirmed", "completed": False, "notes": ""},
    {"key": "disc_9", "title": "Integrations confirmed", "completed": False, "notes": ""},
    {"key": "disc_10", "title": "Analytics requirements confirmed", "completed": False, "notes": ""},
    {"key": "disc_11", "title": "Conversion goals confirmed", "completed": False, "notes": ""},
    {"key": "disc_12", "title": "Final scope confirmed", "completed": False, "notes": ""},
]

DEFAULT_HANDOVER_CHECKLIST = [
    {"key": "handover_1", "title": "Production website verified", "completed": False, "notes": ""},
    {"key": "handover_2", "title": "Domain verified", "completed": False, "notes": ""},
    {"key": "handover_3", "title": "SSL certificate verified", "completed": False, "notes": ""},
    {"key": "handover_4", "title": "Forms & leads tested", "completed": False, "notes": ""},
    {"key": "handover_5", "title": "Analytics & conversion tracking verified", "completed": False, "notes": ""},
    {"key": "handover_6", "title": "Mobile QA completed", "completed": False, "notes": ""},
    {"key": "handover_7", "title": "Admin access configured", "completed": False, "notes": ""},
    {"key": "handover_8", "title": "Client credentials/access transferred securely", "completed": False, "notes": "Transferred via secure password manager."},
    {"key": "handover_9", "title": "Documentation delivered", "completed": False, "notes": ""},
    {"key": "handover_10", "title": "Final client approval confirmed", "completed": False, "notes": ""},
    {"key": "handover_11", "title": "Handover completed", "completed": False, "notes": ""},
]

# 36-Task Professional Build Delivery Template across 9 distinct phases
WEBSITE_PHASED_TASKS = [
    # PHASE 1 — DISCOVERY
    {"title": "Business discovery", "priority": "HIGH"},
    {"title": "Requirements confirmed", "priority": "HIGH"},
    {"title": "Target audience confirmed", "priority": "MEDIUM"},
    {"title": "Sitemap confirmed", "priority": "HIGH"},
    # PHASE 2 — CONTENT & BRAND
    {"title": "Content collection", "priority": "HIGH"},
    {"title": "Brand assets collected", "priority": "HIGH"},
    {"title": "Content gaps identified", "priority": "MEDIUM"},
    # PHASE 3 — UX
    {"title": "Wireframes", "priority": "HIGH"},
    {"title": "User flow confirmation", "priority": "MEDIUM"},
    {"title": "Client UX approval", "priority": "HIGH"},
    # PHASE 4 — DESIGN
    {"title": "Visual direction", "priority": "HIGH"},
    {"title": "Homepage design", "priority": "HIGH"},
    {"title": "Internal page designs", "priority": "HIGH"},
    {"title": "Responsive design", "priority": "HIGH"},
    {"title": "Client design approval", "priority": "URGENT"},
    # PHASE 5 — DEVELOPMENT
    {"title": "Frontend development", "priority": "HIGH"},
    {"title": "Backend/integrations", "priority": "HIGH"},
    {"title": "CMS/admin functionality", "priority": "HIGH"},
    {"title": "Forms and conversion tracking", "priority": "HIGH"},
    # PHASE 6 — QA
    {"title": "Desktop QA", "priority": "MEDIUM"},
    {"title": "Mobile QA", "priority": "HIGH"},
    {"title": "Browser QA", "priority": "MEDIUM"},
    {"title": "Performance QA", "priority": "HIGH"},
    {"title": "Accessibility QA", "priority": "MEDIUM"},
    {"title": "Form/integration QA", "priority": "HIGH"},
    # PHASE 7 — CLIENT REVIEW
    {"title": "Client review", "priority": "HIGH"},
    {"title": "Revision round", "priority": "HIGH"},
    {"title": "Final approval", "priority": "URGENT"},
    # PHASE 8 — LAUNCH
    {"title": "Domain/hosting setup", "priority": "HIGH"},
    {"title": "Production deployment", "priority": "URGENT"},
    {"title": "Analytics setup", "priority": "HIGH"},
    {"title": "Final verification", "priority": "HIGH"},
    # PHASE 9 — HANDOVER
    {"title": "Client handover", "priority": "HIGH"},
    {"title": "Credentials/access handover", "priority": "HIGH"},
    {"title": "Documentation", "priority": "MEDIUM"},
    {"title": "Project completion", "priority": "HIGH"},
]

PROJECT_TEMPLATES = {
    "WEBSITE": WEBSITE_PHASED_TASKS,
    "LANDING_PAGE": [
        {"title": "Campaign discovery & objective", "priority": "HIGH"},
        {"title": "Copywriting & offer framing", "priority": "HIGH"},
        {"title": "Wireframe & layout", "priority": "MEDIUM"},
        {"title": "Visual design & asset styling", "priority": "HIGH"},
        {"title": "Client design approval", "priority": "URGENT"},
        {"title": "Frontend development", "priority": "HIGH"},
        {"title": "Lead form & CRM integration", "priority": "HIGH"},
        {"title": "Mobile & speed optimization", "priority": "HIGH"},
        {"title": "Tracking pixels setup", "priority": "HIGH"},
        {"title": "Client review & revisions", "priority": "MEDIUM"},
        {"title": "Production launch", "priority": "URGENT"},
        {"title": "Handover & completion", "priority": "HIGH"}
    ],
    "ECOMMERCE": [
        {"title": "Store discovery & catalog architecture", "priority": "HIGH"},
        {"title": "Product data & media collection", "priority": "HIGH"},
        {"title": "Store UX & checkout wireframing", "priority": "HIGH"},
        {"title": "Visual design of store & product pages", "priority": "HIGH"},
        {"title": "Client design signoff", "priority": "URGENT"},
        {"title": "Store engine & cart setup", "priority": "HIGH"},
        {"title": "Payment gateway integration", "priority": "URGENT"},
        {"title": "Shipping & tax rules configuration", "priority": "HIGH"},
        {"title": "Catalog import & SEO optimization", "priority": "MEDIUM"},
        {"title": "Checkout & order processing QA", "priority": "HIGH"},
        {"title": "Security & SSL verification", "priority": "HIGH"},
        {"title": "Client training & review", "priority": "HIGH"},
        {"title": "Domain launch", "priority": "URGENT"},
        {"title": "Handover & completion", "priority": "HIGH"}
    ],
    "SOFTWARE": [
        {"title": "Requirements confirmed", "priority": "HIGH"},
        {"title": "Architecture plan", "priority": "HIGH"},
        {"title": "Database schema", "priority": "HIGH"},
        {"title": "API design", "priority": "HIGH"},
        {"title": "Core features", "priority": "HIGH"},
        {"title": "Testing & QA", "priority": "HIGH"},
        {"title": "Security audit", "priority": "HIGH"},
        {"title": "Deployment", "priority": "HIGH"},
        {"title": "Documentation", "priority": "HIGH"},
        {"title": "Handover", "priority": "HIGH"}
    ],
    "AI_AUTOMATION": [
        {"title": "Requirements", "priority": "HIGH"},
        {"title": "Workflow mapping", "priority": "HIGH"},
        {"title": "Integration planning", "priority": "HIGH"},
        {"title": "Data/API setup", "priority": "HIGH"},
        {"title": "AI configuration", "priority": "HIGH"},
        {"title": "Automation development", "priority": "HIGH"},
        {"title": "Testing", "priority": "HIGH"},
        {"title": "Client testing", "priority": "HIGH"},
        {"title": "Deployment", "priority": "HIGH"},
        {"title": "Monitoring", "priority": "HIGH"},
        {"title": "Handover", "priority": "HIGH"}
    ],
    "MARKETING": [
        {"title": "Business audit & competitive analysis", "priority": "HIGH"},
        {"title": "Growth strategy & positioning", "priority": "HIGH"},
        {"title": "Content calendar & topic scripting", "priority": "HIGH"},
        {"title": "Creative asset production", "priority": "HIGH"},
        {"title": "Client approval round", "priority": "HIGH"},
        {"title": "Publishing & campaign launch", "priority": "HIGH"},
        {"title": "Performance tracking & report", "priority": "MEDIUM"},
        {"title": "Monthly report", "priority": "HIGH"}
    ],
    "RECRUITMENT": [
        {"title": "Job requirements", "priority": "HIGH"},
        {"title": "Job description", "priority": "HIGH"},
        {"title": "Candidate sourcing", "priority": "HIGH"},
        {"title": "AI screening", "priority": "HIGH"},
        {"title": "Shortlist", "priority": "HIGH"},
        {"title": "Client review", "priority": "HIGH"},
        {"title": "Interviews", "priority": "HIGH"},
        {"title": "Offer", "priority": "HIGH"},
        {"title": "Hiring confirmation", "priority": "HIGH"}
    ]
}

def generate_project_code(db: Session) -> str:
    """Generate sequential human-readable project code: SC-PROJ-{YYYY}-{0001}."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"SC-PROJ-{current_year}-"
    
    projects_this_year = db.query(Project).filter(
        Project.project_code.like(f"{prefix}%")
    ).all()
    
    max_num = 0
    for p in projects_this_year:
        try:
            num_part = int(p.project_code.split("-")[-1])
            if num_part > max_num:
                max_num = num_part
        except Exception:
            continue
            
    next_num = max_num + 1
    return f"{prefix}{next_num:04d}"

def compute_project_health(project: Project, tasks: List[ProjectTask]) -> str:
    """Derive project health accurately based on deadlines, task blocks, and waiting state."""
    now = datetime.now(timezone.utc)
    if project.status == ProjectStatus.BLOCKED.value or project.status == ProjectStatus.WAITING_FOR_CLIENT.value:
        return ProjectHealth.BLOCKED.value
    
    target_utc = ensure_utc(project.target_date)
    if target_utc and target_utc < now and project.status not in [ProjectStatus.COMPLETED.value, ProjectStatus.CANCELLED.value]:
        return ProjectHealth.OVERDUE.value
        
    has_blocked_tasks = any(t.status == TaskStatus.BLOCKED.value for t in tasks)
    has_overdue_tasks = any(ensure_utc(t.due_date) and ensure_utc(t.due_date) < now and t.status != TaskStatus.DONE.value for t in tasks)
    
    if has_blocked_tasks or has_overdue_tasks:
        return ProjectHealth.AT_RISK.value
        
    return ProjectHealth.ON_TRACK.value

def enrich_project_out(project: Project, db: Session) -> ProjectOut:
    """Enrich project instance with brief, milestones, tasks, approvals, updates, and commercial data."""
    now = datetime.now(timezone.utc)
    client = db.query(Client).filter(Client.id == project.client_id).first()
    
    proposal = db.query(Proposal).filter(Proposal.id == project.proposal_id).first() if project.proposal_id else None
    contract = db.query(Contract).filter(Contract.id == project.contract_id).first() if project.contract_id else None
    invoice = db.query(Invoice).filter(Invoice.id == project.invoice_id).first() if project.invoice_id else None
    
    brief = db.query(ProjectBrief).filter(ProjectBrief.project_id == project.id).first()
    milestones = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project.id
    ).order_by(asc(ProjectMilestone.order_index), asc(ProjectMilestone.id)).all()
    
    tasks = db.query(ProjectTask).filter(
        ProjectTask.project_id == project.id
    ).order_by(asc(ProjectTask.order_index), asc(ProjectTask.id)).all()
    
    approvals = db.query(ProjectApproval).filter(
        ProjectApproval.project_id == project.id
    ).order_by(desc(ProjectApproval.created_at)).all()
    
    updates = db.query(ProjectUpdate).filter(
        ProjectUpdate.project_id == project.id
    ).order_by(desc(ProjectUpdate.created_at)).all()
    
    activities = db.query(ProjectActivity).filter(
        ProjectActivity.project_id == project.id
    ).order_by(desc(ProjectActivity.created_at)).all()
    
    resources = db.query(ProjectResource).filter(
        ProjectResource.project_id == project.id
    ).order_by(desc(ProjectResource.created_at)).all()
    
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == TaskStatus.DONE.value)
    progress_pct = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
    
    target_utc = ensure_utc(project.target_date)
    is_proj_overdue = bool(
        target_utc and target_utc < now and project.status not in [ProjectStatus.COMPLETED.value, ProjectStatus.CANCELLED.value]
    )
    
    derived_health = compute_project_health(project, tasks)
    
    task_outs = []
    for t in tasks:
        due_utc = ensure_utc(t.due_date)
        is_task_overdue = bool(due_utc and due_utc < now and t.status != TaskStatus.DONE.value)
        task_outs.append(ProjectTaskOut(
            id=t.id,
            project_id=t.project_id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            assigned_to=t.assigned_to,
            due_date=t.due_date,
            completed_at=t.completed_at,
            order_index=t.order_index,
            is_overdue=is_task_overdue,
            created_at=t.created_at,
            updated_at=t.updated_at
        ))
        
    return ProjectOut(
        id=project.id,
        client_id=project.client_id,
        project_code=project.project_code,
        name=project.name,
        description=project.description,
        service_type=project.service_type,
        status=project.status,
        priority=project.priority,
        health=derived_health,
        public_token=project.public_token,
        assigned_to=project.assigned_to,
        waiting_for=project.waiting_for,
        start_date=project.start_date,
        target_date=project.target_date,
        completed_at=project.completed_at,
        proposal_id=project.proposal_id,
        contract_id=project.contract_id,
        invoice_id=project.invoice_id,
        handover_checklist=project.handover_checklist or DEFAULT_HANDOVER_CHECKLIST,
        handover_notes=project.handover_notes,
        handover_completed_at=project.handover_completed_at,
        created_at=project.created_at,
        updated_at=project.updated_at,
        client_name=client.name if client else None,
        client_business_name=client.business_name if client else None,
        client_code=client.client_code if client else None,
        proposal_number=proposal.proposal_number if proposal else None,
        contract_number=contract.contract_number if contract else None,
        invoice_number=invoice.invoice_number if invoice else None,
        invoice_payment_status=invoice.status if invoice else None,
        progress_percentage=progress_pct,
        total_tasks_count=total_tasks,
        completed_tasks_count=completed_tasks,
        is_overdue=is_proj_overdue,
        tasks=task_outs,
        milestones=milestones,
        approvals=approvals,
        updates=updates,
        activities=activities,
        resources=resources,
        brief=brief
    )

# ==============================================================================
# ADMIN API: PROJECT STATS
# ==============================================================================

@router.get("/api/projects/stats", response_model=ProjectStatsOut)
def get_project_stats(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Calculate real-time project delivery metrics."""
    now = datetime.now(timezone.utc)
    week_end = now + timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    projects = db.query(Project).all()
    
    total = len(projects)
    planned = 0
    in_progress = 0
    waiting_for_client = 0
    blocked = 0
    in_review = 0
    completed = 0
    cancelled = 0
    overdue = 0
    due_this_week = 0
    high_priority = 0
    
    active_build = 0
    build_due_this_week = 0
    build_overdue = 0
    completed_this_month = 0
    
    build_service_types = [
        ServiceType.WEBSITE.value,
        ServiceType.LANDING_PAGE.value,
        ServiceType.ECOMMERCE.value,
        ServiceType.WEB_APP.value,
        ServiceType.SOFTWARE.value,
        ServiceType.INTERNAL_TOOL.value,
        ServiceType.CUSTOM.value
    ]
    
    for p in projects:
        st = p.status
        is_build = p.service_type in build_service_types
        is_active = st not in [ProjectStatus.COMPLETED.value, ProjectStatus.CANCELLED.value]
        
        if st == ProjectStatus.PLANNED.value:
            planned += 1
        elif st == ProjectStatus.IN_PROGRESS.value:
            in_progress += 1
        elif st == ProjectStatus.WAITING_FOR_CLIENT.value:
            waiting_for_client += 1
        elif st == ProjectStatus.BLOCKED.value:
            blocked += 1
        elif st == ProjectStatus.IN_REVIEW.value:
            in_review += 1
        elif st == ProjectStatus.COMPLETED.value:
            completed += 1
            if p.completed_at:
                c_utc = ensure_utc(p.completed_at)
                if c_utc and c_utc >= month_start:
                    completed_this_month += 1
        elif st == ProjectStatus.CANCELLED.value:
            cancelled += 1
            
        if is_build and is_active:
            active_build += 1
            
        if p.priority in [ProjectPriority.HIGH.value, ProjectPriority.URGENT.value] and is_active:
            high_priority += 1
            
        if p.target_date and is_active:
            target_utc = ensure_utc(p.target_date)
            if target_utc:
                if target_utc < now:
                    overdue += 1
                    if is_build:
                        build_overdue += 1
                elif now <= target_utc <= week_end:
                    due_this_week += 1
                    if is_build:
                        build_due_this_week += 1

    return ProjectStatsOut(
        total_projects=total,
        planned=planned,
        in_progress=in_progress,
        waiting_for_client=waiting_for_client,
        blocked=blocked,
        in_review=in_review,
        completed=completed,
        cancelled=cancelled,
        overdue=overdue,
        due_this_week=due_this_week,
        high_priority=high_priority,
        active_build_projects=active_build,
        build_projects_due_this_week=build_due_this_week,
        build_projects_overdue=build_overdue,
        completed_this_month=completed_this_month
    )

# ==============================================================================
# ADMIN API: PROJECT CRUD
# ==============================================================================

@router.post("/api/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Create a new service engagement with public token, milestones, and phased task template."""
    client = db.query(Client).filter(Client.id == project_in.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client #{project_in.client_id} not found."
        )

    project_code = generate_project_code(db)
    public_token = secrets.token_urlsafe(24)

    project = Project(
        client_id=project_in.client_id,
        project_code=project_code,
        name=project_in.name.strip(),
        description=project_in.description.strip() if project_in.description else None,
        service_type=project_in.service_type.value if hasattr(project_in.service_type, 'value') else str(project_in.service_type),
        priority=project_in.priority.value if hasattr(project_in.priority, 'value') else str(project_in.priority),
        health=ProjectHealth.ON_TRACK.value,
        status=ProjectStatus.PLANNED.value,
        assigned_to=project_in.assigned_to.strip() if project_in.assigned_to else None,
        start_date=ensure_utc(project_in.start_date) or datetime.now(timezone.utc),
        target_date=ensure_utc(project_in.target_date),
        proposal_id=project_in.proposal_id,
        contract_id=project_in.contract_id,
        invoice_id=project_in.invoice_id,
        public_token=public_token,
        handover_checklist=DEFAULT_HANDOVER_CHECKLIST
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # 1. Initialize Project Brief with Discovery Checklist
    brief = ProjectBrief(
        project_id=project.id,
        business_name=client.business_name,
        target_audience=None,
        discovery_checklist=DEFAULT_DISCOVERY_CHECKLIST
    )
    db.add(brief)

    # 2. Seed Default Milestones for Build Projects
    for m in DEFAULT_BUILD_MILESTONES:
        milestone = ProjectMilestone(
            project_id=project.id,
            title=m["title"],
            description=m["description"],
            status=MilestoneStatus.UPCOMING.value,
            order_index=m["order_index"]
        )
        db.add(milestone)

    # 3. Seed Phased Tasks from Template
    template_key = project_in.template_type.upper() if project_in.template_type else project.service_type.upper()
    if template_key in PROJECT_TEMPLATES:
        template_tasks = PROJECT_TEMPLATES[template_key]
        for idx, t in enumerate(template_tasks):
            if isinstance(t, dict):
                task_title = t["title"]
                task_pri = t.get("priority", "MEDIUM")
            else:
                task_title = str(t)
                task_pri = "MEDIUM"

            task = ProjectTask(
                project_id=project.id,
                title=task_title,
                priority=task_pri,
                status=TaskStatus.TODO.value,
                order_index=idx
            )
            db.add(task)

    # 4. Log Project Created Activity
    act = ProjectActivity(
        project_id=project.id,
        type=ProjectActivityType.STATUS_CHANGE.value,
        description=f"Project {project.project_code} '{project.name}' initialized under {project.service_type} pillar.",
        created_by=admin
    )
    db.add(act)

    lead_act = LeadActivity(
        lead_id=client.lead_id,
        client_id=client.id,
        type=ActivityType.NOTE.value,
        text=f"Build project {project.project_code} created for client.",
        created_by=admin
    )
    db.add(lead_act)

    db.commit()
    return enrich_project_out(project, db)

@router.get("/api/projects", response_model=List[ProjectOut])
def get_projects(
    status: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    health: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    client_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Retrieve filtered list of projects."""
    query = db.query(Project)

    if status and status.upper() != "ALL":
        query = query.filter(Project.status == status.upper())

    if service_type and service_type.upper() != "ALL":
        query = query.filter(Project.service_type == service_type.upper())

    if priority and priority.upper() != "ALL":
        query = query.filter(Project.priority == priority.upper())

    if health and health.upper() != "ALL":
        query = query.filter(Project.health == health.upper())

    if assigned_to and assigned_to.upper() != "ALL":
        query = query.filter(Project.assigned_to == assigned_to)

    if client_id:
        query = query.filter(Project.client_id == client_id)

    if search:
        term = f"%{search.strip()}%"
        query = query.join(Client, Project.client_id == Client.id).filter(
            or_(
                Project.project_code.ilike(term),
                Project.name.ilike(term),
                Project.description.ilike(term),
                Client.name.ilike(term),
                Client.business_name.ilike(term),
                Client.client_code.ilike(term)
            )
        )

    if sort_by == "oldest":
        query = query.order_by(asc(Project.created_at))
    elif sort_by == "target_date":
        query = query.order_by(asc(Project.target_date))
    elif sort_by == "priority":
        query = query.order_by(desc(Project.priority))
    else:
        query = query.order_by(desc(Project.created_at))

    projects = query.all()
    return [enrich_project_out(p, db) for p in projects]

@router.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Retrieve full project detail."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project #{project_id} not found."
        )
    return enrich_project_out(project, db)

@router.patch("/api/projects/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    update_in: ProjectPatchIn,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Update project status, dates, priority, health, or waiting_for state."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project #{project_id} not found."
        )

    changes = []
    if update_in.name is not None:
        project.name = update_in.name.strip()
    if update_in.description is not None:
        project.description = update_in.description.strip() or None
    if update_in.service_type is not None:
        project.service_type = update_in.service_type.value if hasattr(update_in.service_type, 'value') else str(update_in.service_type)
    if update_in.priority is not None:
        val = update_in.priority.value if hasattr(update_in.priority, 'value') else str(update_in.priority)
        if project.priority != val:
            changes.append(f"Priority changed from {project.priority} to {val}")
            project.priority = val
    if update_in.health is not None:
        val = update_in.health.value if hasattr(update_in.health, 'value') else str(update_in.health)
        project.health = val
    if update_in.assigned_to is not None:
        project.assigned_to = update_in.assigned_to.strip() or None
    if update_in.waiting_for is not None:
        project.waiting_for = update_in.waiting_for.strip() or None
    if update_in.start_date is not None:
        project.start_date = ensure_utc(update_in.start_date)
    if update_in.target_date is not None:
        project.target_date = ensure_utc(update_in.target_date)

    if update_in.status is not None:
        new_status = update_in.status.value if hasattr(update_in.status, 'value') else str(update_in.status)
        if project.status != new_status:
            # Business rule: Never activate project before required initial payment is verified
            if new_status == ProjectStatus.IN_PROGRESS.value:
                if project.invoice_id:
                    linked_inv = db.query(Invoice).filter(Invoice.id == project.invoice_id).first()
                    if linked_inv and linked_inv.amount_paid <= 0:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cannot activate project to IN_PROGRESS: Initial advance payment has not been verified. Please confirm client payment in Commercial & Finance."
                        )

            changes.append(f"Status changed from {project.status} to {new_status}")
            project.status = new_status
            if new_status == ProjectStatus.COMPLETED.value:
                project.completed_at = datetime.now(timezone.utc)
            elif project.completed_at and new_status != ProjectStatus.COMPLETED.value:
                project.completed_at = None

            # If project activated, update client onboarding workspace item
            if new_status == ProjectStatus.IN_PROGRESS.value:
                ws_item = db.query(ClientOnboardingItem).filter(
                    ClientOnboardingItem.client_id == project.client_id,
                    or_(
                        ClientOnboardingItem.item_key == "workspace_created",
                        ClientOnboardingItem.title.ilike("%workspace%")
                    ),
                    ClientOnboardingItem.completed == False
                ).first()
                if ws_item:
                    ws_item.completed = True
                    ws_item.completed_at = datetime.now(timezone.utc)
                    ws_item.notes = f"Auto-completed upon project {project.project_code} activation."

    if changes:
        act = ProjectActivity(
            project_id=project.id,
            type=ProjectActivityType.STATUS_CHANGE.value,
            description="; ".join(changes),
            created_by=admin
        )
        db.add(act)

    db.commit()
    db.refresh(project)

    if update_in.status and (update_in.status == ProjectStatus.BLOCKED or str(update_in.status) == "BLOCKED"):
        client = db.query(Client).filter(Client.id == project.client_id).first()
        send_business_notification(
            db=db,
            event_type="PROJECT_BLOCKED",
            subject=f"[The Sorted Club] Project Blocked — {project.name}",
            title=f"Project Blocked: {project.name}",
            message=f"Project {project.name} is marked as BLOCKED. Waiting on / reason: {project.waiting_for or 'Client input or dependency blocker'}.",
            data={
                "Project Name": project.name,
                "Project Code": project.project_code,
                "Client Business": client.business_name if client else "—",
                "Blocked Reason / Waiting For": project.waiting_for or "Requires attention",
                "Updated By": admin
            },
            entity_type="project",
            entity_id=project.id,
            action_url=f"/admin/projects?selectedProject={project.id}"
        )
    elif update_in.status and (update_in.status == ProjectStatus.COMPLETED or str(update_in.status) == "COMPLETED"):
        client = db.query(Client).filter(Client.id == project.client_id).first()
        send_business_notification(
            db=db,
            event_type="PROJECT_COMPLETED",
            subject=f"[The Sorted Club] Project Completed — {project.name}",
            title=f"Project Completed: {project.name}",
            message=f"Project {project.name} ({project.project_code}) has been marked as COMPLETED.",
            data={
                "Project Name": project.name,
                "Project Code": project.project_code,
                "Client Business": client.business_name if client else "—",
                "Service Type": project.service_type,
                "Completed By": admin
            },
            entity_type="project",
            entity_id=project.id,
            action_url=f"/admin/projects?selectedProject={project.id}"
        )

    return enrich_project_out(project, db)

@router.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Delete a project and all associated tasks, briefs, milestones, approvals, and activities."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project #{project_id} not found."
        )

    db.delete(project)
    db.commit()
    return None

# ==============================================================================
# ADMIN API: BUILD PROJECT BRIEF
# ==============================================================================

@router.get("/api/projects/{project_id}/brief", response_model=ProjectBriefOut)
def get_project_brief(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Retrieve or auto-create project brief."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    brief = db.query(ProjectBrief).filter(ProjectBrief.project_id == project_id).first()
    if not brief:
        client = db.query(Client).filter(Client.id == project.client_id).first()
        brief = ProjectBrief(
            project_id=project.id,
            business_name=client.business_name if client else None,
            discovery_checklist=DEFAULT_DISCOVERY_CHECKLIST
        )
        db.add(brief)
        db.commit()
        db.refresh(brief)
    return brief

@router.put("/api/projects/{project_id}/brief", response_model=ProjectBriefOut)
def update_project_brief(
    project_id: int,
    brief_in: ProjectBriefUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Save or update structured Build brief and Discovery checklist."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    brief = db.query(ProjectBrief).filter(ProjectBrief.project_id == project_id).first()
    if not brief:
        brief = ProjectBrief(project_id=project_id)
        db.add(brief)

    for field, val in brief_in.model_dump(exclude_unset=True).items():
        setattr(brief, field, val)

    act = ProjectActivity(
        project_id=project_id,
        type=ProjectActivityType.NOTE.value,
        description="Project brief & discovery parameters updated.",
        created_by=admin
    )
    db.add(act)

    db.commit()
    db.refresh(brief)
    return brief

# ==============================================================================
# ADMIN API: MILESTONES
# ==============================================================================

@router.get("/api/projects/{project_id}/milestones", response_model=List[ProjectMilestoneOut])
def get_milestones(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    return db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project_id
    ).order_by(asc(ProjectMilestone.order_index), asc(ProjectMilestone.id)).all()

@router.post("/api/projects/{project_id}/milestones", response_model=ProjectMilestoneOut, status_code=201)
def create_milestone(
    project_id: int,
    milestone_in: ProjectMilestoneCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    milestone = ProjectMilestone(
        project_id=project_id,
        title=milestone_in.title.strip(),
        description=milestone_in.description.strip() if milestone_in.description else None,
        status=milestone_in.status.value if hasattr(milestone_in.status, 'value') else str(milestone_in.status),
        target_date=ensure_utc(milestone_in.target_date),
        order_index=milestone_in.order_index
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone

@router.patch("/api/projects/{project_id}/milestones/{milestone_id}", response_model=ProjectMilestoneOut)
def update_milestone(
    project_id: int,
    milestone_id: int,
    update_in: ProjectMilestoneUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.id == milestone_id,
        ProjectMilestone.project_id == project_id
    ).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    if update_in.title is not None:
        milestone.title = update_in.title.strip()
    if update_in.description is not None:
        milestone.description = update_in.description.strip() or None
    if update_in.order_index is not None:
        milestone.order_index = update_in.order_index
    if update_in.target_date is not None:
        milestone.target_date = ensure_utc(update_in.target_date)

    if update_in.status is not None:
        val = update_in.status.value if hasattr(update_in.status, 'value') else str(update_in.status)
        milestone.status = val
        if val == MilestoneStatus.COMPLETED.value:
            milestone.completed_at = datetime.now(timezone.utc)
            act = ProjectActivity(
                project_id=project_id,
                type=ProjectActivityType.MILESTONE.value,
                description=f"Milestone '{milestone.title}' reached and marked completed.",
                created_by=admin
            )
            db.add(act)
        elif val != MilestoneStatus.COMPLETED.value:
            milestone.completed_at = None

    db.commit()
    db.refresh(milestone)
    return milestone

@router.delete("/api/projects/{project_id}/milestones/{milestone_id}", status_code=204)
def delete_milestone(
    project_id: int,
    milestone_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.id == milestone_id,
        ProjectMilestone.project_id == project_id
    ).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(milestone)
    db.commit()
    return None

# ==============================================================================
# ADMIN API: CLIENT APPROVALS
# ==============================================================================

@router.get("/api/projects/{project_id}/approvals", response_model=List[ProjectApprovalOut])
def get_approvals(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    return db.query(ProjectApproval).filter(
        ProjectApproval.project_id == project_id
    ).order_by(desc(ProjectApproval.created_at)).all()

@router.post("/api/projects/{project_id}/approvals", response_model=ProjectApprovalOut, status_code=201)
def create_approval(
    project_id: int,
    approval_in: ProjectApprovalCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    token = secrets.token_urlsafe(24)
    approval = ProjectApproval(
        project_id=project_id,
        title=approval_in.title.strip(),
        item_type=approval_in.item_type.value if hasattr(approval_in.item_type, 'value') else str(approval_in.item_type),
        description=approval_in.description.strip() if approval_in.description else None,
        preview_url=approval_in.preview_url.strip() if approval_in.preview_url else None,
        asset_urls=approval_in.asset_urls or [],
        public_token=token,
        status=ApprovalStatus.PENDING.value,
        created_by=admin
    )
    db.add(approval)

    act = ProjectActivity(
        project_id=project_id,
        type=ProjectActivityType.APPROVAL_REQUESTED.value,
        description=f"Client approval requested: '{approval.title}' ({approval.item_type}).",
        created_by=admin
    )
    db.add(act)

    db.commit()
    db.refresh(approval)
    return approval

@router.delete("/api/projects/{project_id}/approvals/{approval_id}", status_code=204)
def delete_approval(
    project_id: int,
    approval_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    approval = db.query(ProjectApproval).filter(
        ProjectApproval.id == approval_id,
        ProjectApproval.project_id == project_id
    ).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    db.delete(approval)
    db.commit()
    return None

# ==============================================================================
# ADMIN API: PROJECT UPDATES
# ==============================================================================

@router.get("/api/projects/{project_id}/updates", response_model=List[ProjectUpdateOut])
def get_updates(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    return db.query(ProjectUpdate).filter(
        ProjectUpdate.project_id == project_id
    ).order_by(desc(ProjectUpdate.created_at)).all()

@router.post("/api/projects/{project_id}/updates", response_model=ProjectUpdateOut, status_code=201)
def create_update(
    project_id: int,
    update_in: ProjectUpdateCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    upd = ProjectUpdate(
        project_id=project_id,
        title=update_in.title.strip(),
        message=update_in.message.strip(),
        category=update_in.category.value if hasattr(update_in.category, 'value') else str(update_in.category),
        customer_visible=update_in.customer_visible,
        created_by=admin
    )
    db.add(upd)

    act = ProjectActivity(
        project_id=project_id,
        type=ProjectActivityType.CLIENT_MESSAGE.value if update_in.customer_visible else ProjectActivityType.NOTE.value,
        description=f"Project update published: '{upd.title}' (Visible to customer: {upd.customer_visible})",
        created_by=admin
    )
    db.add(act)

    db.commit()
    db.refresh(upd)
    return upd

@router.delete("/api/projects/{project_id}/updates/{update_id}", status_code=204)
def delete_update(
    project_id: int,
    update_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    upd = db.query(ProjectUpdate).filter(
        ProjectUpdate.id == update_id,
        ProjectUpdate.project_id == project_id
    ).first()
    if not upd:
        raise HTTPException(status_code=404, detail="Update not found")
    db.delete(upd)
    db.commit()
    return None

# ==============================================================================
# ADMIN API: HANDOVER & STRICT COMPLETION FLOW
# ==============================================================================

@router.patch("/api/projects/{project_id}/handover", response_model=ProjectOut)
def update_handover_checklist(
    project_id: int,
    handover_in: ProjectHandoverUpdateIn,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if handover_in.handover_checklist is not None:
        project.handover_checklist = handover_in.handover_checklist
    if handover_in.handover_notes is not None:
        project.handover_notes = handover_in.handover_notes.strip() or None

    db.commit()
    db.refresh(project)
    return enrich_project_out(project, db)

@router.post("/api/projects/{project_id}/complete", response_model=ProjectOut)
def complete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """Enforce real completion requirements: tasks done, handover checklist complete."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(ProjectTask).filter(ProjectTask.project_id == project_id).all()
    incomplete_tasks = [t for t in tasks if t.status != TaskStatus.DONE.value]
    if incomplete_tasks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete project: {len(incomplete_tasks)} task(s) are still pending completion."
        )

    # Validate handover checklist
    checklist = project.handover_checklist or []
    uncompleted_items = [item for item in checklist if not item.get("completed")]
    if uncompleted_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete project: Handover checklist has {len(uncompleted_items)} unchecked verification item(s)."
        )

    project.status = ProjectStatus.COMPLETED.value
    project.completed_at = datetime.now(timezone.utc)
    project.health = ProjectHealth.ON_TRACK.value
    project.handover_completed_at = datetime.now(timezone.utc)

    # Mark all milestones completed if not already
    milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()
    for m in milestones:
        m.status = MilestoneStatus.COMPLETED.value
        if not m.completed_at:
            m.completed_at = datetime.now(timezone.utc)

    act = ProjectActivity(
        project_id=project_id,
        type=ProjectActivityType.HANDOVER.value,
        description=f"🎉 Project {project.project_code} '{project.name}' successfully delivered and marked COMPLETED.",
        created_by=admin
    )
    db.add(act)

    client = db.query(Client).filter(Client.id == project.client_id).first()
    if client:
        lead_act = LeadActivity(
            lead_id=client.lead_id,
            client_id=client.id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Project {project.project_code} completed and delivered.",
            created_by=admin
        )
        db.add(lead_act)

    db.commit()
    db.refresh(project)

    # Trigger admin notification & email
    send_business_notification(
        db=db,
        event_type="PROJECT_COMPLETED",
        subject=f"[The Sorted Club] Project Completed — {project.name}",
        title=f"Project Completed: {project.name}",
        message=f"Project {project.name} ({project.project_code}) has completed all delivery tasks, verified 100% of handover checklist items, and is officially marked COMPLETED by {admin}.",
        data={
            "Project Name": project.name,
            "Project Code": project.project_code,
            "Client Business": client.business_name if client else "—",
            "Completed At": str(project.completed_at),
            "Verified By": admin
        },
        entity_type="project",
        entity_id=project.id,
        action_url=f"/admin/projects?selectedProject={project.id}"
    )

    return enrich_project_out(project, db)

# ==============================================================================
# ADMIN API: TASKS, ACTIVITIES, RESOURCES
# ==============================================================================

@router.post("/api/projects/{project_id}/tasks", response_model=ProjectTaskOut, status_code=201)
def create_task(
    project_id: int,
    task_in: ProjectTaskCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = ProjectTask(
        project_id=project_id,
        title=task_in.title.strip(),
        description=task_in.description.strip() if task_in.description else None,
        priority=task_in.priority.value if hasattr(task_in.priority, 'value') else str(task_in.priority),
        status=TaskStatus.TODO.value,
        assigned_to=task_in.assigned_to.strip() if task_in.assigned_to else None,
        due_date=ensure_utc(task_in.due_date),
        order_index=task_in.order_index
    )
    db.add(task)

    act = ProjectActivity(
        project_id=project_id,
        type=ProjectActivityType.TASK_CREATED.value,
        description=f"Added task: '{task.title}'",
        created_by=admin
    )
    db.add(act)

    db.commit()
    db.refresh(task)
    return task

@router.patch("/api/projects/{project_id}/tasks/{task_id}", response_model=ProjectTaskOut)
def update_task(
    project_id: int,
    task_id: int,
    task_in: ProjectTaskUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    task = db.query(ProjectTask).filter(
        ProjectTask.id == task_id,
        ProjectTask.project_id == project_id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_in.title is not None:
        task.title = task_in.title.strip()
    if task_in.description is not None:
        task.description = task_in.description.strip() or None
    if task_in.priority is not None:
        task.priority = task_in.priority.value if hasattr(task_in.priority, 'value') else str(task_in.priority)
    if task_in.assigned_to is not None:
        task.assigned_to = task_in.assigned_to.strip() or None
    if task_in.due_date is not None:
        task.due_date = ensure_utc(task_in.due_date)
    if task_in.order_index is not None:
        task.order_index = task_in.order_index

    if task_in.status is not None:
        val = task_in.status.value if hasattr(task_in.status, 'value') else str(task_in.status)
        if task.status != val:
            task.status = val
            if val == TaskStatus.DONE.value:
                task.completed_at = datetime.now(timezone.utc)
                act = ProjectActivity(
                    project_id=project_id,
                    type=ProjectActivityType.TASK_COMPLETED.value,
                    description=f"Completed task: '{task.title}'",
                    created_by=admin
                )
                db.add(act)
            elif task.completed_at and val != TaskStatus.DONE.value:
                task.completed_at = None

    db.commit()
    db.refresh(task)
    return task

@router.delete("/api/projects/{project_id}/tasks/{task_id}", status_code=204)
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    task = db.query(ProjectTask).filter(
        ProjectTask.id == task_id,
        ProjectTask.project_id == project_id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None

@router.get("/api/projects/{project_id}/activities", response_model=List[ProjectActivityOut])
def get_activities(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    return db.query(ProjectActivity).filter(
        ProjectActivity.project_id == project_id
    ).order_by(desc(ProjectActivity.created_at)).all()

@router.post("/api/projects/{project_id}/activities", response_model=ProjectActivityOut, status_code=201)
def create_activity(
    project_id: int,
    act_in: ProjectActivityCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    act = ProjectActivity(
        project_id=project_id,
        type=act_in.type.value if hasattr(act_in.type, 'value') else str(act_in.type),
        description=act_in.description.strip(),
        created_by=admin
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act

@router.get("/api/projects/{project_id}/resources", response_model=List[ProjectResourceOut])
def get_resources(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    return db.query(ProjectResource).filter(
        ProjectResource.project_id == project_id
    ).order_by(desc(ProjectResource.created_at)).all()

@router.post("/api/projects/{project_id}/resources", response_model=ProjectResourceOut, status_code=201)
def create_resource(
    project_id: int,
    res_in: ProjectResourceCreate,
    db: Session = Depends(get_db),

    admin: str = Depends(get_current_admin)
):
    res = ProjectResource(
        project_id=project_id,
        title=res_in.title.strip(),
        url=res_in.url.strip(),
        resource_type=res_in.resource_type.value if hasattr(res_in.resource_type, 'value') else str(res_in.resource_type),
        notes=res_in.notes.strip() if res_in.notes else None
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

@router.delete("/api/projects/{project_id}/resources/{resource_id}", status_code=204)
def delete_resource(
    project_id: int,
    resource_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    res = db.query(ProjectResource).filter(
        ProjectResource.id == resource_id,
        ProjectResource.project_id == project_id
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(res)
    db.commit()
    return None

# ==============================================================================
# PUBLIC CUSTOMER ENDPOINTS (Token Authenticated)
# ==============================================================================

@router.get("/api/public/project/{token}", response_model=PublicProjectOut)
def get_public_project(token: str, db: Session = Depends(get_db)):
    """Secure customer-facing project progress and deliverables view."""
    project = db.query(Project).filter(Project.public_token == token.strip()).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project engagement not found or invalid token."
        )

    client = db.query(Client).filter(Client.id == project.client_id).first()
    tasks = db.query(ProjectTask).filter(ProjectTask.project_id == project.id).all()
    milestones = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project.id
    ).order_by(asc(ProjectMilestone.order_index), asc(ProjectMilestone.id)).all()

    # Customer-visible updates only
    updates = db.query(ProjectUpdate).filter(
        ProjectUpdate.project_id == project.id,
        ProjectUpdate.customer_visible == True
    ).order_by(desc(ProjectUpdate.created_at)).all()

    resources = db.query(ProjectResource).filter(
        ProjectResource.project_id == project.id
    ).order_by(desc(ProjectResource.created_at)).all()

    # Pending approvals for customer action
    pending_approvals = db.query(ProjectApproval).filter(
        ProjectApproval.project_id == project.id,
        ProjectApproval.status == ApprovalStatus.PENDING.value
    ).all()

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == TaskStatus.DONE.value)
    progress_pct = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    # Determine current milestone
    current_ms = None
    for m in milestones:
        if m.status in [MilestoneStatus.IN_PROGRESS.value, MilestoneStatus.UPCOMING.value]:
            current_ms = m.title
            break
    if not current_ms and milestones:
        current_ms = milestones[-1].title

    approval_outs = [
        PublicApprovalOut(
            title=a.title,
            item_type=a.item_type,
            description=a.description,
            preview_url=a.preview_url,
            asset_urls=a.asset_urls,
            public_token=a.public_token,
            status=a.status,
            decision_name=a.decision_name,
            decision_comment=a.decision_comment,
            decision_at=a.decision_at,
            created_at=a.created_at,
            project_name=project.name,
            project_code=project.project_code,
            client_name=client.name if client else "Customer",
            client_business_name=client.business_name if client else "Client"
        ) for a in pending_approvals
    ]

    return PublicProjectOut(
        project_code=project.project_code,
        name=project.name,
        description=project.description,
        service_type=project.service_type,
        status=project.status,
        health=compute_project_health(project, tasks),
        progress_percentage=progress_pct,
        total_tasks_count=total_tasks,
        completed_tasks_count=completed_tasks,
        start_date=project.start_date,
        target_date=project.target_date,
        completed_at=project.completed_at,
        waiting_for=project.waiting_for,
        client_business_name=client.business_name if client else "Client",
        client_name=client.name if client else "Customer",
        current_milestone=current_ms,
        milestones=milestones,
        updates=updates,
        resources=resources,
        pending_approvals=approval_outs
    )

@router.get("/api/public/approval/{token}", response_model=PublicApprovalOut)
def get_public_approval(token: str, db: Session = Depends(get_db)):
    """Customer-facing deliverable approval review details."""
    approval = db.query(ProjectApproval).filter(ProjectApproval.public_token == token.strip()).first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval request not found or invalid token."
        )

    project = db.query(Project).filter(Project.id == approval.project_id).first()
    client = db.query(Client).filter(Client.id == project.client_id).first() if project else None

    return PublicApprovalOut(
        title=approval.title,
        item_type=approval.item_type,
        description=approval.description,
        preview_url=approval.preview_url,
        asset_urls=approval.asset_urls,
        public_token=approval.public_token,
        status=approval.status,
        decision_name=approval.decision_name,
        decision_comment=approval.decision_comment,
        decision_at=approval.decision_at,
        created_at=approval.created_at,
        project_name=project.name if project else "Project",
        project_code=project.project_code if project else "SC-PROJ",
        client_name=client.name if client else "Customer",
        client_business_name=client.business_name if client else "Client"
    )

@router.post("/api/public/approval/{token}/decision", response_model=PublicApprovalOut)
def submit_approval_decision(
    token: str,
    decision_in: PublicApprovalDecisionIn,
    request: Request,
    db: Session = Depends(get_db)
):
    """Customer approves deliverable or requests changes with mandatory comment. Rate limited to 15 per minute per IP."""
    limiter.check(request, "approval_decision", max_requests=15, window_seconds=60)
    approval = db.query(ProjectApproval).filter(ProjectApproval.public_token == token.strip()).first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval request not found or invalid token."
        )

    if approval.status in [ApprovalStatus.APPROVED.value, ApprovalStatus.CHANGES_REQUESTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This deliverable review was already submitted as '{approval.status}'."
        )

    if decision_in.decision == "CHANGES_REQUESTED" and not (decision_in.comment and decision_in.comment.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide detailed feedback comments when requesting changes."
        )

    approval.status = decision_in.decision
    approval.decision_name = decision_in.customer_name.strip()
    approval.decision_email = decision_in.customer_email.strip()
    approval.decision_comment = decision_in.comment.strip() if decision_in.comment else None
    approval.decision_at = datetime.now(timezone.utc)

    # Log project activity
    project = db.query(Project).filter(Project.id == approval.project_id).first()
    act = ProjectActivity(
        project_id=approval.project_id,
        type=ProjectActivityType.APPROVAL_DECIDED.value,
        description=f"Client {approval.decision_name} submitted decision '{approval.status}' on deliverable '{approval.title}'.",
        created_by="Customer"
    )
    db.add(act)
    db.commit()
    db.refresh(approval)

    client = db.query(Client).filter(Client.id == project.client_id).first() if project else None
    proj_name = project.name if project else "Project"

    if approval.status == ApprovalStatus.CHANGES_REQUESTED.value:
        send_business_notification(
            db=db,
            event_type="CUSTOMER_REQUESTED_CHANGES",
            subject=f"[The Sorted Club] Customer Requested Changes — {proj_name}",
            title=f"Changes Requested on {approval.title}",
            message=f"Customer {approval.decision_name} requested changes on deliverable '{approval.title}' for project {proj_name}. Feedback: {approval.decision_comment or 'No comment'}",
            data={
                "Project": proj_name,
                "Deliverable": approval.title,
                "Customer Feedback": approval.decision_comment or "Changes requested",
                "Customer Name": approval.decision_name,
                "Customer Email": approval.decision_email or "—"
            },
            entity_type="project",
            entity_id=project.id if project else None,
            action_url=f"/admin/projects?selectedProject={project.id}" if project else "/admin/projects"
        )
    elif approval.status == ApprovalStatus.APPROVED.value:
        send_business_notification(
            db=db,
            event_type="CUSTOMER_APPROVAL_RECEIVED",
            subject=f"[The Sorted Club] Customer Approval Received — {proj_name}",
            title=f"Deliverable Approved: {approval.title}",
            message=f"Customer {approval.decision_name} approved deliverable '{approval.title}' for project {proj_name}.",
            data={
                "Project": proj_name,
                "Deliverable": approval.title,
                "Status": "APPROVED",
                "Customer Name": approval.decision_name,
                "Customer Email": approval.decision_email or "—"
            },
            entity_type="project",
            entity_id=project.id if project else None,
            action_url=f"/admin/projects?selectedProject={project.id}" if project else "/admin/projects"
        )

    return PublicApprovalOut(
        title=approval.title,
        item_type=approval.item_type,
        description=approval.description,
        preview_url=approval.preview_url,
        asset_urls=approval.asset_urls,
        public_token=approval.public_token,
        status=approval.status,
        decision_name=approval.decision_name,
        decision_comment=approval.decision_comment,
        decision_at=approval.decision_at,
        created_at=approval.created_at,
        project_name=project.name if project else "Project",
        project_code=project.project_code if project else "SC-PROJ",
        client_name=client.name if client else "Customer",
        client_business_name=client.business_name if client else "Client"
    )
