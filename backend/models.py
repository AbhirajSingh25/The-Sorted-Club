import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.sql import func
from database import Base

class LeadStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    REPLIED = "REPLIED"
    DISCOVERY_CALL = "DISCOVERY_CALL"
    QUALIFIED = "QUALIFIED"
    PROPOSAL = "PROPOSAL"
    PROPOSAL_SENT = "PROPOSAL_SENT"
    NEGOTIATION = "NEGOTIATION"
    WON = "WON"
    LOST = "LOST"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED"

class LeadPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class ActivityType(str, enum.Enum):
    NOTE = "NOTE"
    CALL = "CALL"
    EMAIL = "EMAIL"
    WHATSAPP = "WHATSAPP"
    MEETING = "MEETING"
    STATUS_CHANGE = "STATUS_CHANGE"

class ClientStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class OnboardingStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_FOR_CLIENT = "WAITING_FOR_CLIENT"
    COMPLETED = "COMPLETED"

class ProposalStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    VIEWED = "VIEWED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class ContractStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class InvoiceStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class InstallmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class PaymentMethod(str, enum.Enum):
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"
    CASH = "CASH"
    CARD = "CARD"
    OTHER = "OTHER"

class PaymentConfirmationStatus(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"

class ProjectStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_FOR_CLIENT = "WAITING_FOR_CLIENT"
    BLOCKED = "BLOCKED"
    IN_REVIEW = "IN_REVIEW"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ProjectPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class ProjectHealth(str, enum.Enum):
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    BLOCKED = "BLOCKED"
    OVERDUE = "OVERDUE"

class ServiceType(str, enum.Enum):
    WEBSITE = "WEBSITE"
    LANDING_PAGE = "LANDING_PAGE"
    ECOMMERCE = "ECOMMERCE"
    WEB_APP = "WEB_APP"
    SOFTWARE = "SOFTWARE"
    INTERNAL_TOOL = "INTERNAL_TOOL"
    CUSTOM = "CUSTOM"
    AI_AUTOMATION = "AI_AUTOMATION"
    MARKETING = "MARKETING"
    RECRUITMENT = "RECRUITMENT"

class MilestoneStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"

class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"

class ApprovalItemType(str, enum.Enum):
    DESIGN = "DESIGN"
    CONTENT = "CONTENT"
    FINAL_WEBSITE = "FINAL_WEBSITE"
    OTHER = "OTHER"

class ProjectUpdateCategory(str, enum.Enum):
    PROGRESS = "PROGRESS"
    MILESTONE = "MILESTONE"
    ANNOUNCEMENT = "ANNOUNCEMENT"
    ACTION_REQUIRED = "ACTION_REQUIRED"

class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    IN_REVIEW = "IN_REVIEW"
    DONE = "DONE"

class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class ProjectActivityType(str, enum.Enum):
    NOTE = "NOTE"
    TASK_CREATED = "TASK_CREATED"
    TASK_COMPLETED = "TASK_COMPLETED"
    STATUS_CHANGE = "STATUS_CHANGE"
    CLIENT_MESSAGE = "CLIENT_MESSAGE"
    MEETING = "MEETING"
    MILESTONE = "MILESTONE"
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    APPROVAL_DECIDED = "APPROVAL_DECIDED"
    HANDOVER = "HANDOVER"

class ResourceType(str, enum.Enum):
    DOCUMENT = "DOCUMENT"
    DESIGN = "DESIGN"
    WEBSITE = "WEBSITE"
    REPOSITORY = "REPOSITORY"
    DRIVE = "DRIVE"
    OTHER = "OTHER"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    website = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=False)
    service_interest = Column(String(100), nullable=False, index=True)
    problem = Column(Text, nullable=False)
    budget = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default=LeadStatus.NEW.value, index=True)
    
    # CRM Sales Pipeline Fields
    source = Column(String(100), nullable=False, default="Website", index=True)
    utm_source = Column(String(100), nullable=True, index=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    utm_content = Column(String(100), nullable=True)
    referral_source = Column(String(100), nullable=True, index=True)
    priority = Column(String(50), nullable=False, default=LeadPriority.MEDIUM.value, index=True)
    assigned_to = Column(String(100), nullable=True, index=True)
    estimated_value = Column(Float, nullable=True)
    next_follow_up_at = Column(DateTime(timezone=True), nullable=True, index=True)
    last_contacted_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    qualification_notes = Column(Text, nullable=True)
    decision_maker = Column(String(255), nullable=True)
    budget_fit = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    lost_reason = Column(Text, nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)

    # Prospect Outreach & Qualification Intelligence
    relevant_template = Column(String(100), nullable=True, index=True)
    problem_noticed = Column(Text, nullable=True)
    has_real_business = Column(Boolean, default=False, nullable=True)
    has_clear_need = Column(Boolean, default=False, nullable=True)
    has_budget = Column(Boolean, default=False, nullable=True)
    has_timeline = Column(Boolean, default=False, nullable=True)
    is_decision_maker = Column(Boolean, default=False, nullable=True)
    responds_communication = Column(Boolean, default=False, nullable=True)
    qualification_score = Column(Integer, default=0, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<Lead id={self.id} name='{self.name}' business='{self.business_name}' status='{self.status}'>"

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, unique=True, index=True)
    client_code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    website = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default=ClientStatus.ACTIVE.value, index=True)
    source = Column(String(100), nullable=False, default="Website")
    assigned_to = Column(String(100), nullable=True, index=True)
    onboarding_status = Column(String(50), nullable=False, default=OnboardingStatus.NOT_STARTED.value, index=True)
    onboarding_completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<Client id={self.id} code='{self.client_code}' business='{self.business_name}' status='{self.status}'>"

class ClientOnboardingItem(Base):
    __tablename__ = "client_onboarding_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    item_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<ClientOnboardingItem id={self.id} client_id={self.client_id} title='{self.title}' completed={self.completed}>"

class LeadActivity(Base):
    __tablename__ = "lead_activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String(50), nullable=False, default=ActivityType.NOTE.value)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    created_by = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<LeadActivity id={self.id} lead_id={self.lead_id} client_id={self.client_id} type='{self.type}'>"

# ==============================================================================
# COMMERCIAL MODELS: PROPOSALS, CONTRACTS, INVOICES, PAYMENTS
# ==============================================================================

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    proposal_number = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default=ProposalStatus.DRAFT.value, index=True)
    subtotal = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, nullable=False, default=0.0)
    tax = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    valid_until = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    terms = Column(Text, nullable=True)
    secure_token = Column(String(100), nullable=False, unique=True, index=True)
    accepted_by_name = Column(String(255), nullable=True)
    accepted_by_email = Column(String(255), nullable=True)
    payment_schedule = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )
    sent_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Proposal id={self.id} number='{self.proposal_number}' status='{self.status}' total={self.total}>"

class ProposalItem(Base):
    __tablename__ = "proposal_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit_price = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    order_index = Column(Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<ProposalItem id={self.id} proposal_id={self.proposal_id} name='{self.name}' total={self.total}>"

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="SET NULL"), nullable=True, index=True)
    contract_number = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default=ContractStatus.DRAFT.value, index=True)
    secure_token = Column(String(100), nullable=False, unique=True, index=True)
    accepted_by_name = Column(String(255), nullable=True)
    accepted_by_email = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )
    sent_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Contract id={self.id} number='{self.contract_number}' status='{self.status}'>"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_number = Column(String(50), nullable=False, unique=True, index=True)
    status = Column(String(50), nullable=False, default=InvoiceStatus.DRAFT.value, index=True)
    subtotal = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, nullable=False, default=0.0)
    tax = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    amount_paid = Column(Float, nullable=False, default=0.0)
    amount_due = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    issue_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    secure_token = Column(String(100), nullable=False, unique=True, index=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<Invoice id={self.id} number='{self.invoice_number}' status='{self.status}' total={self.total}>"

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit_price = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    order_index = Column(Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<InvoiceItem id={self.id} invoice_id={self.invoice_id} name='{self.name}' total={self.total}>"

class InvoiceInstallment(Base):
    __tablename__ = "invoice_installments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    installment_number = Column(Integer, nullable=False, default=1)
    description = Column(String(255), nullable=False)
    percentage = Column(Float, nullable=True)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default=InstallmentStatus.PENDING.value, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<InvoiceInstallment id={self.id} invoice_id={self.invoice_id} #{self.installment_number} amount={self.amount} status='{self.status}'>"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False, default=PaymentMethod.BANK_TRANSFER.value)
    reference = Column(String(100), nullable=True)
    paid_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    def __repr__(self):
        return f"<Payment id={self.id} invoice_id={self.invoice_id} amount={self.amount} method='{self.payment_method}'>"

class PaymentConfirmation(Base):
    __tablename__ = "payment_confirmations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False, default=PaymentMethod.BANK_TRANSFER.value)
    reference = Column(String(100), nullable=False)
    payer_name = Column(String(255), nullable=False)
    payer_email = Column(String(255), nullable=False)
    payment_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default=PaymentConfirmationStatus.PENDING_VERIFICATION.value, index=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<PaymentConfirmation id={self.id} invoice_id={self.invoice_id} amount={self.amount} status='{self.status}'>"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="SET NULL"), nullable=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)

    project_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    service_type = Column(String(50), nullable=False, default=ServiceType.CUSTOM.value, index=True)
    status = Column(String(50), nullable=False, default=ProjectStatus.PLANNED.value, index=True)
    priority = Column(String(50), nullable=False, default=ProjectPriority.MEDIUM.value, index=True)
    health = Column(String(50), nullable=False, default=ProjectHealth.ON_TRACK.value, index=True)
    assigned_to = Column(String(100), nullable=True, index=True)
    waiting_for = Column(Text, nullable=True)

    # Secure customer-facing token for /project/{token}
    public_token = Column(String(100), unique=True, nullable=False, index=True)

    start_date = Column(DateTime(timezone=True), nullable=True)
    target_date = Column(DateTime(timezone=True), nullable=True, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Handover checklist state and completion notes
    handover_checklist = Column(JSON, nullable=True)
    handover_notes = Column(Text, nullable=True)
    handover_completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<Project id={self.id} code='{self.project_code}' name='{self.name}' status='{self.status}'>"

class ProjectBrief(Base):
    __tablename__ = "project_briefs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Business
    business_name = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    target_audience = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    website_domain = Column(String(255), nullable=True)
    existing_website = Column(String(255), nullable=True)

    # Brand
    brand_description = Column(Text, nullable=True)
    logo_received = Column(Boolean, default=False, nullable=False)
    colors = Column(String(255), nullable=True)
    fonts = Column(String(255), nullable=True)
    visual_references = Column(Text, nullable=True)
    brand_guidelines_url = Column(String(1000), nullable=True)

    # Goals
    primary_business_goal = Column(Text, nullable=True)
    website_goal = Column(Text, nullable=True)
    conversion_goal = Column(Text, nullable=True)
    primary_cta = Column(String(255), nullable=True)

    # Content
    content_status = Column(String(100), nullable=True)
    copy_received = Column(Boolean, default=False, nullable=False)
    images_received = Column(Boolean, default=False, nullable=False)
    videos_received = Column(Boolean, default=False, nullable=False)
    testimonials_received = Column(Boolean, default=False, nullable=False)
    other_assets = Column(Text, nullable=True)

    # Technical
    domain_info = Column(String(255), nullable=True)
    hosting_info = Column(String(255), nullable=True)
    cms_requirement = Column(String(100), nullable=True)
    integrations_needed = Column(Text, nullable=True)
    analytics_needed = Column(Text, nullable=True)
    forms_needed = Column(Text, nullable=True)
    payment_requirements = Column(Text, nullable=True)
    third_party_services = Column(Text, nullable=True)

    # Functional
    required_pages = Column(Text, nullable=True)
    required_features = Column(Text, nullable=True)
    user_accounts_needed = Column(Boolean, default=False, nullable=False)
    admin_requirements = Column(Text, nullable=True)

    # Discovery Checklist (JSON structured list)
    discovery_checklist = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<ProjectBrief id={self.id} project_id={self.project_id}>"

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default=MilestoneStatus.UPCOMING.value, index=True)
    target_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    order_index = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<ProjectMilestone id={self.id} project_id={self.project_id} title='{self.title}' status='{self.status}'>"

class ProjectApproval(Base):
    __tablename__ = "project_approvals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    item_type = Column(String(50), nullable=False, default=ApprovalItemType.DESIGN.value, index=True)
    description = Column(Text, nullable=True)
    preview_url = Column(String(1000), nullable=True)
    asset_urls = Column(JSON, nullable=True)
    public_token = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(String(50), nullable=False, default=ApprovalStatus.PENDING.value, index=True)
    decision_name = Column(String(255), nullable=True)
    decision_email = Column(String(255), nullable=True)
    decision_comment = Column(Text, nullable=True)
    decision_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<ProjectApproval id={self.id} project_id={self.project_id} title='{self.title}' status='{self.status}'>"

class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default=ProjectUpdateCategory.PROGRESS.value, index=True)
    customer_visible = Column(Boolean, nullable=False, default=True, index=True)
    created_by = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    def __repr__(self):
        return f"<ProjectUpdate id={self.id} project_id={self.project_id} title='{self.title}' customer_visible={self.customer_visible}>"

class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default=TaskStatus.TODO.value, index=True)
    priority = Column(String(50), nullable=False, default=TaskPriority.MEDIUM.value, index=True)
    assigned_to = Column(String(100), nullable=True, index=True)
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    order_index = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<ProjectTask id={self.id} project_id={self.project_id} title='{self.title}' status='{self.status}'>"

class ProjectActivity(Base):
    __tablename__ = "project_activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False, default=ProjectActivityType.NOTE.value, index=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    created_by = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<ProjectActivity id={self.id} project_id={self.project_id} type='{self.type}'>"

class ProjectResource(Base):
    __tablename__ = "project_resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    resource_type = Column(String(50), nullable=False, default=ResourceType.DOCUMENT.value, index=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<ProjectResource id={self.id} project_id={self.project_id} title='{self.title}'>"


# ==============================================================================
# NOTIFICATIONS & EMAIL LOGS
# ==============================================================================

class NotificationType(str, enum.Enum):
    # High Priority
    NEW_INQUIRY = "NEW_INQUIRY"
    PROPOSAL_ACCEPTED = "PROPOSAL_ACCEPTED"
    PAYMENT_CONFIRMATION_SUBMITTED = "PAYMENT_CONFIRMATION_SUBMITTED"
    PAYMENT_VERIFIED = "PAYMENT_VERIFIED"
    PAYMENT_REJECTED = "PAYMENT_REJECTED"
    CUSTOMER_REQUESTED_CHANGES = "CUSTOMER_REQUESTED_CHANGES"
    CUSTOMER_APPROVAL_RECEIVED = "CUSTOMER_APPROVAL_RECEIVED"
    PROJECT_BLOCKED = "PROJECT_BLOCKED"
    PROJECT_OVERDUE = "PROJECT_OVERDUE"
    PROJECT_COMPLETED = "PROJECT_COMPLETED"
    
    # Operational Events
    ONBOARDING_COMPLETED = "ONBOARDING_COMPLETED"
    FOLLOW_UP_DUE = "FOLLOW_UP_DUE"
    MILESTONE_COMPLETED = "MILESTONE_COMPLETED"
    CUSTOMER_WAITING_ACTION = "CUSTOMER_WAITING_ACTION"
    FINAL_APPROVAL_REQUIRED = "FINAL_APPROVAL_REQUIRED"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    entity_type = Column(String(50), nullable=True, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    action_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    def __repr__(self):
        return f"<Notification id={self.id} type='{self.type}' title='{self.title}' is_read={self.is_read}>"

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String(100), nullable=False, index=True)
    recipient = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="SENT", index=True)  # SENT, FAILED, SKIPPED
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now())

    def __repr__(self):
        return f"<EmailLog id={self.id} event_type='{self.event_type}' recipient='{self.recipient}' status='{self.status}'>"


