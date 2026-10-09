import re
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator
from models import (
    LeadStatus,
    LeadPriority,
    ActivityType,
    ClientStatus,
    OnboardingStatus,
    ProposalStatus,
    ContractStatus,
    InvoiceStatus,
    InstallmentStatus,
    PaymentMethod,
    PaymentConfirmationStatus,
    ProjectStatus,
    ProjectPriority,
    ProjectHealth,
    ServiceType,
    MilestoneStatus,
    ApprovalStatus,
    ApprovalItemType,
    ProjectUpdateCategory,
    TaskStatus,
    TaskPriority,
    ProjectActivityType,
    ResourceType
)


def clean_and_validate_phone(raw_phone: str) -> str:
    if not isinstance(raw_phone, str):
        raise ValueError("Phone number must be a string.")
    
    clean = raw_phone.strip()
    if not clean:
        raise ValueError("Phone number is required.")
    
    digits_only = re.sub(r"\D", "", clean)
    
    if len(digits_only) < 7:
        raise ValueError("Phone number is too short. Please provide at least 7 digits.")
    if len(digits_only) > 15:
        raise ValueError("Phone number is too long. Please provide a valid phone number (max 15 digits).")

    if len(digits_only) == 10:
        if digits_only[0] in "6789":
            return clean
        raise ValueError("10-digit Indian mobile numbers must start with 6, 7, 8, or 9.")

    if len(digits_only) == 11 and digits_only.startswith("0"):
        if digits_only[1] in "6789":
            return clean
        raise ValueError("11-digit numbers starting with 0 must be followed by 6, 7, 8, or 9.")

    if len(digits_only) == 12 and digits_only.startswith("91"):
        if digits_only[2] in "6789":
            return clean
        raise ValueError("Indian numbers with +91 / 91 prefix must have a 10-digit mobile number starting with 6, 7, 8, or 9.")

    if clean.startswith("+") and 7 <= len(digits_only) <= 15:
        return clean

    if 7 <= len(digits_only) <= 15:
        return clean

    raise ValueError(
        "Please provide a valid Indian or international phone number (e.g. +91 98765 43210, 9876543210, or +1 555 019 2834)."
    )

def clean_and_validate_email(raw_email: str) -> str:
    if not isinstance(raw_email, str):
        raise ValueError("Email must be a string.")
    
    clean = raw_email.strip().lower()
    if not clean:
        raise ValueError("Email address is required.")
    
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(email_regex, clean) or ".." in clean or clean.endswith("."):
        raise ValueError("Please provide a valid email address (e.g. alex@acmestudio.com).")
    
    return clean

# ==============================================================================
# LEAD SCHEMAS
# ==============================================================================

class LeadBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    business_name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=5, max_length=255)
    phone: str = Field(..., min_length=7, max_length=50)
    website: Optional[str] = Field(default=None, max_length=255)
    business_type: str = Field(..., min_length=2, max_length=100)
    service_interest: str = Field(..., min_length=2, max_length=100)
    problem: str = Field(..., min_length=10, max_length=5000)
    budget: str = Field(..., min_length=2, max_length=100)
    status: Optional[str] = Field(default=LeadStatus.NEW.value, max_length=50)
    
    source: Optional[str] = Field(default="Website", max_length=100)
    utm_source: Optional[str] = Field(default=None, max_length=100)
    utm_medium: Optional[str] = Field(default=None, max_length=100)
    utm_campaign: Optional[str] = Field(default=None, max_length=100)
    utm_content: Optional[str] = Field(default=None, max_length=100)
    referral_source: Optional[str] = Field(default=None, max_length=100)
    priority: Optional[str] = Field(default=LeadPriority.MEDIUM.value, max_length=50)
    assigned_to: Optional[str] = Field(default=None, max_length=100)
    estimated_value: Optional[float] = Field(default=None, ge=0)
    next_follow_up_at: Optional[datetime] = None
    last_contacted_at: Optional[datetime] = None
    notes: Optional[str] = None
    qualification_notes: Optional[str] = None
    decision_maker: Optional[str] = None
    budget_fit: Optional[str] = None
    timeline: Optional[str] = None
    lost_reason: Optional[str] = None
    converted_at: Optional[datetime] = None

    # Prospect Outreach & Qualification Intelligence
    relevant_template: Optional[str] = Field(default=None, max_length=100)
    problem_noticed: Optional[str] = None
    has_real_business: Optional[bool] = False
    has_clear_need: Optional[bool] = False
    has_budget: Optional[bool] = False
    has_timeline: Optional[bool] = False
    is_decision_maker: Optional[bool] = False
    responds_communication: Optional[bool] = False
    qualification_score: Optional[int] = 0

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return clean_and_validate_email(v)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_and_validate_phone(v)

class LeadCreate(LeadBase):
    consent: bool = Field(default=True)

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Consent to be contacted is required to submit an inquiry.")
        return v

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    business_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    business_type: Optional[str] = None
    service_interest: Optional[str] = None
    problem: Optional[str] = None
    budget: Optional[str] = None
    status: Optional[LeadStatus] = None
    source: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    referral_source: Optional[str] = None
    priority: Optional[LeadPriority] = None
    assigned_to: Optional[str] = None
    estimated_value: Optional[float] = None
    next_follow_up_at: Optional[datetime] = None
    last_contacted_at: Optional[datetime] = None
    notes: Optional[str] = None
    qualification_notes: Optional[str] = None
    decision_maker: Optional[str] = None
    budget_fit: Optional[str] = None
    timeline: Optional[str] = None
    lost_reason: Optional[str] = None
    converted_at: Optional[datetime] = None
    relevant_template: Optional[str] = None
    problem_noticed: Optional[str] = None
    has_real_business: Optional[bool] = None
    has_clear_need: Optional[bool] = None
    has_budget: Optional[bool] = None
    has_timeline: Optional[bool] = None
    is_decision_maker: Optional[bool] = None
    responds_communication: Optional[bool] = None
    qualification_score: Optional[int] = None

class LeadOut(LeadBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    is_converted: bool = False
    client_id: Optional[int] = None
    client_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LeadActivityCreate(BaseModel):
    type: ActivityType = Field(default=ActivityType.NOTE)
    text: str = Field(..., min_length=1, max_length=5000)
    created_by: Optional[str] = None

class LeadActivityOut(BaseModel):
    id: int
    lead_id: Optional[int] = None
    client_id: Optional[int] = None
    type: str
    text: str
    created_at: datetime
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LeadStats(BaseModel):
    total: int
    new: int
    contacted: int
    qualified: int
    proposal: int
    won: int
    lost: int

class CRMMetrics(BaseModel):
    total_pipeline_value: float
    active_deals_count: int
    new_count: int
    contacted_count: int
    qualified_count: int
    proposal_count: int
    negotiation_count: int
    won_count: int
    won_value: float
    lost_count: int
    win_rate_percentage: float
    avg_deal_value: float
    followups_due_today: int
    followups_overdue: int
    replied_count: Optional[int] = 0
    discovery_call_count: Optional[int] = 0
    proposal_sent_count: Optional[int] = 0
    follow_up_required_count: Optional[int] = 0
    breakdown_by_source: Optional[dict] = None
    breakdown_by_service: Optional[dict] = None

# ==============================================================================
# CLIENT & ONBOARDING SCHEMAS
# ==============================================================================

class ClientBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    business_name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=5, max_length=255)
    phone: str = Field(..., min_length=7, max_length=50)
    website: Optional[str] = None
    business_type: str = Field(..., min_length=2, max_length=100)
    status: str = Field(default=ClientStatus.ACTIVE.value, max_length=50)
    source: str = Field(default="Website", max_length=100)
    assigned_to: Optional[str] = None
    onboarding_status: str = Field(default=OnboardingStatus.NOT_STARTED.value, max_length=50)
    notes: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_client_email(cls, v: str) -> str:
        return clean_and_validate_email(v)

    @field_validator("phone")
    @classmethod
    def validate_client_phone(cls, v: str) -> str:
        return clean_and_validate_phone(v)

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    business_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    business_type: Optional[str] = None
    status: Optional[ClientStatus] = None
    assigned_to: Optional[str] = None
    onboarding_status: Optional[OnboardingStatus] = None
    notes: Optional[str] = None

class ClientOut(ClientBase):
    id: int
    lead_id: int
    client_code: str
    onboarding_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    onboarding_progress: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class OnboardingItemOut(BaseModel):
    id: int
    client_id: int
    item_key: str
    title: str
    category: str
    completed: bool
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class OnboardingItemUpdateItem(BaseModel):
    item_id: int
    completed: bool
    notes: Optional[str] = None

class OnboardingBatchUpdate(BaseModel):
    onboarding_status: Optional[OnboardingStatus] = None
    items: List[OnboardingItemUpdateItem] = []

class ClientOnboardingResponse(BaseModel):
    client_id: int
    client_code: str
    business_name: str
    onboarding_status: str
    onboarding_completed_at: Optional[datetime] = None
    total_items: int
    completed_items: int
    progress_percentage: int
    items: List[OnboardingItemOut]

class ClientStats(BaseModel):
    total_clients: int
    active_clients: int
    onboarding_in_progress: int
    waiting_for_client: int
    completed_clients: int

# ==============================================================================
# COMMERCIAL SCHEMAS: PROPOSALS, CONTRACTS, INVOICES, PAYMENTS
# ==============================================================================

class ProposalItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    quantity: float = Field(default=1.0, gt=0)
    unit_price: float = Field(default=0.0, ge=0)
    order_index: int = Field(default=0, ge=0)

class ProposalItemOut(BaseModel):
    id: int
    proposal_id: int
    name: str
    description: Optional[str] = None
    quantity: float
    unit_price: float
    total: float
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class ProposalCreate(BaseModel):
    client_id: int
    lead_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    discount: float = Field(default=0.0, ge=0)
    tax: float = Field(default=0.0, ge=0)
    currency: str = Field(default="USD", max_length=10)
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    payment_schedule: Optional[List[dict]] = None
    items: List[ProposalItemCreate] = []

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProposalStatus] = None
    discount: Optional[float] = Field(default=None, ge=0)
    tax: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = None
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    payment_schedule: Optional[List[dict]] = None
    items: Optional[List[ProposalItemCreate]] = None

class ProposalOut(BaseModel):
    id: int
    client_id: int
    lead_id: Optional[int] = None
    proposal_number: str
    title: str
    description: Optional[str] = None
    status: str
    subtotal: float
    discount: float
    tax: float
    total: float
    currency: str
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    payment_schedule: Optional[List[dict]] = None
    secure_token: str
    accepted_by_name: Optional[str] = None
    accepted_by_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sent_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    items: List[ProposalItemOut] = []
    client_name: Optional[str] = None
    client_business_name: Optional[str] = None
    client_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PublicProposalOut(BaseModel):
    proposal_number: str
    title: str
    description: Optional[str] = None
    status: str
    subtotal: float
    discount: float
    tax: float
    total: float
    currency: str
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    payment_schedule: Optional[List[dict]] = None
    secure_token: str
    client_name: str
    client_business_name: str
    client_email: str
    client_phone: str
    created_at: datetime
    sent_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    accepted_by_name: Optional[str] = None
    accepted_by_email: Optional[str] = None
    is_expired: bool = False
    items: List[ProposalItemOut] = []

class PublicProposalAccept(BaseModel):
    accepted_by_name: str = Field(..., min_length=2, max_length=255)
    accepted_by_email: str = Field(..., min_length=5, max_length=255)

    @field_validator("accepted_by_email")
    @classmethod
    def validate_accept_email(cls, v: str) -> str:
        return clean_and_validate_email(v)

class PublicProposalReject(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=1000)

# Contract Schemas
class ContractCreate(BaseModel):
    client_id: int
    proposal_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=255)
    content: str = Field(..., min_length=10)

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[ContractStatus] = None

class ContractOut(BaseModel):
    id: int
    client_id: int
    proposal_id: Optional[int] = None
    contract_number: str
    title: str
    content: str
    status: str
    secure_token: str
    accepted_by_name: Optional[str] = None
    accepted_by_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sent_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    client_name: Optional[str] = None
    client_business_name: Optional[str] = None
    client_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PublicContractOut(BaseModel):
    contract_number: str
    title: str
    content: str
    status: str
    secure_token: str
    accepted_by_name: Optional[str] = None
    created_at: datetime
    sent_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    client_name: str
    client_business_name: str
    client_email: str
    client_phone: str

class PublicContractAccept(BaseModel):
    accepted_by_name: str = Field(..., min_length=2, max_length=255)
    accepted_by_email: str = Field(..., min_length=5, max_length=255)

    @field_validator("accepted_by_email")
    @classmethod
    def validate_contract_accept_email(cls, v: str) -> str:
        return clean_and_validate_email(v)

# Invoice & Payment Schemas
class InvoiceItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    quantity: float = Field(default=1.0, gt=0)
    unit_price: float = Field(default=0.0, ge=0)
    order_index: int = Field(default=0, ge=0)

class InvoiceItemOut(BaseModel):
    id: int
    invoice_id: int
    name: str
    description: Optional[str] = None
    quantity: float
    unit_price: float
    total: float
    order_index: int

    model_config = ConfigDict(from_attributes=True)

class InvoiceInstallmentCreate(BaseModel):
    installment_number: int = Field(default=1, ge=1)
    description: str = Field(..., min_length=1, max_length=255)
    percentage: Optional[float] = Field(default=None, ge=0, le=100)
    amount: float = Field(..., ge=0)
    due_date: Optional[datetime] = None

class InvoiceInstallmentUpdate(BaseModel):
    description: Optional[str] = None
    percentage: Optional[float] = None
    amount: Optional[float] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None

class InvoiceInstallmentOut(BaseModel):
    id: int
    invoice_id: int
    installment_number: int
    description: str
    percentage: Optional[float] = None
    amount: float
    due_date: Optional[datetime] = None
    status: str
    payment_id: Optional[int] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount in invoice currency")
    payment_method: PaymentMethod = Field(default=PaymentMethod.BANK_TRANSFER)
    reference: Optional[str] = Field(default=None, max_length=100, description="Transaction ID / Wire reference / UTR")
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    invoice_id: int
    amount: float
    payment_method: str
    reference: Optional[str] = None
    paid_at: datetime
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InvoiceCreate(BaseModel):
    client_id: int
    proposal_id: Optional[int] = None
    discount: float = Field(default=0.0, ge=0)
    tax: float = Field(default=0.0, ge=0)
    currency: str = Field(default="USD", max_length=10)
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    payment_terms_preset: Optional[str] = None  # 'START_50_50', 'PRO_50_50', 'CUSTOM'
    installments: Optional[List[InvoiceInstallmentCreate]] = None
    items: List[InvoiceItemCreate] = []

class InvoiceUpdate(BaseModel):
    discount: Optional[float] = Field(default=None, ge=0)
    tax: Optional[float] = Field(default=None, ge=0)
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    status: Optional[InvoiceStatus] = None
    items: Optional[List[InvoiceItemCreate]] = None

class InvoiceOut(BaseModel):
    id: int
    client_id: int
    proposal_id: Optional[int] = None
    invoice_number: str
    status: str
    subtotal: float
    discount: float
    tax: float
    total: float
    amount_paid: float
    amount_due: float
    currency: str
    issue_date: datetime
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    secure_token: str
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceItemOut] = []
    payments: List[PaymentOut] = []
    installments: List[InvoiceInstallmentOut] = []
    client_name: Optional[str] = None
    client_business_name: Optional[str] = None
    client_code: Optional[str] = None
    is_overdue: bool = False

    model_config = ConfigDict(from_attributes=True)

class PaymentInstructionsOut(BaseModel):
    upi_id: str
    account_name: str
    bank_name: str
    account_number: str
    ifsc: str
    branch: Optional[str] = None

class PublicPaymentOut(BaseModel):
    amount: float
    payment_method: str
    reference: Optional[str] = None
    paid_at: datetime

class PublicInvoiceOut(BaseModel):
    invoice_number: str
    status: str
    subtotal: float
    discount: float
    tax: float
    total: float
    amount_paid: float
    amount_due: float
    currency: str
    issue_date: datetime
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    secure_token: str
    client_name: str
    client_business_name: str
    client_email: str
    client_phone: str
    items: List[InvoiceItemOut] = []
    payments: List[PublicPaymentOut] = []
    installments: List[InvoiceInstallmentOut] = []
    payment_instructions: PaymentInstructionsOut
    is_overdue: bool = False
    has_pending_confirmation: bool = False

class PublicPaymentConfirmationCreate(BaseModel):
    payer_name: str = Field(..., min_length=2, max_length=255)
    payer_email: str = Field(..., min_length=5, max_length=255)
    amount: float = Field(..., gt=0)
    payment_method: PaymentMethod = Field(default=PaymentMethod.BANK_TRANSFER)
    reference: str = Field(..., min_length=2, max_length=100, description="Transaction ID / UTR / Reference")
    payment_date: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("payer_email")
    @classmethod
    def validate_payer_email(cls, v: str) -> str:
        return clean_and_validate_email(v)

class PublicPaymentConfirmationOut(BaseModel):
    message: str
    status: str
    reference: str
    amount: float
    created_at: datetime

class PaymentConfirmationOut(BaseModel):
    id: int
    invoice_id: int
    client_id: int
    amount: float
    payment_method: str
    reference: str
    payer_name: str
    payer_email: str
    payment_date: datetime
    notes: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    invoice_number: Optional[str] = None
    client_name: Optional[str] = None
    client_business_name: Optional[str] = None
    client_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PaymentConfirmationReview(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=1000)

class FinanceStats(BaseModel):
    total_invoiced: float
    total_paid: float
    total_outstanding: float
    total_overdue: float
    proposals_pending_count: int
    proposals_accepted_count: int
    proposals_total_value: float
    conversion_rate_percentage: float

class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class AdminChangeUsernameRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current admin password for verification")
    new_username: str = Field(..., min_length=3, max_length=100, description="New admin username or email")

class AdminChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current admin password for verification")
    new_password: str = Field(..., min_length=8, max_length=128, description="New secure password")
    confirm_password: Optional[str] = Field(None, description="Password confirmation match")

class AdminCredentialChangeResponse(BaseModel):
    message: str
    access_token: str
    username: str
    token_type: str = "bearer"

# Project Delivery & Service Management Schemas

class ProjectTaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    order_index: int = Field(default=0, ge=0)

class ProjectTaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    order_index: Optional[int] = Field(default=None, ge=0)

class ProjectTaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    order_index: int
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProjectActivityCreate(BaseModel):
    type: ProjectActivityType = Field(default=ProjectActivityType.NOTE)
    description: str = Field(..., min_length=1)
    created_by: Optional[str] = None

class ProjectActivityOut(BaseModel):
    id: int
    project_id: int
    type: str
    description: str
    created_at: datetime
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

def validate_resource_url(url: str) -> str:
    cleaned = url.strip()
    if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
        raise ValueError("URL must start with http:// or https://")
    return cleaned

class ProjectResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=5, max_length=1000)
    resource_type: ResourceType = Field(default=ResourceType.DOCUMENT)
    notes: Optional[str] = None

    @field_validator("url")
    @classmethod
    def check_url(cls, v: str) -> str:
        return validate_resource_url(v)

class ProjectResourceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    url: Optional[str] = Field(default=None, min_length=5, max_length=1000)
    resource_type: Optional[ResourceType] = None
    notes: Optional[str] = None

    @field_validator("url")
    @classmethod
    def check_url_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_resource_url(v)
        return v

class ProjectResourceOut(BaseModel):
    id: int
    project_id: int
    title: str
    url: str
    resource_type: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Build Project Brief Schemas
class ProjectBriefCreate(BaseModel):
    business_name: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    location: Optional[str] = None
    website_domain: Optional[str] = None
    existing_website: Optional[str] = None

    brand_description: Optional[str] = None
    logo_received: bool = False
    colors: Optional[str] = None
    fonts: Optional[str] = None
    visual_references: Optional[str] = None
    brand_guidelines_url: Optional[str] = None

    primary_business_goal: Optional[str] = None
    website_goal: Optional[str] = None
    conversion_goal: Optional[str] = None
    primary_cta: Optional[str] = None

    content_status: Optional[str] = None
    copy_received: bool = False
    images_received: bool = False
    videos_received: bool = False
    testimonials_received: bool = False
    other_assets: Optional[str] = None

    domain_info: Optional[str] = None
    hosting_info: Optional[str] = None
    cms_requirement: Optional[str] = None
    integrations_needed: Optional[str] = None
    analytics_needed: Optional[str] = None
    forms_needed: Optional[str] = None
    payment_requirements: Optional[str] = None
    third_party_services: Optional[str] = None

    required_pages: Optional[str] = None
    required_features: Optional[str] = None
    user_accounts_needed: bool = False
    admin_requirements: Optional[str] = None

    discovery_checklist: Optional[list] = None

class ProjectBriefUpdate(BaseModel):
    business_name: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    location: Optional[str] = None
    website_domain: Optional[str] = None
    existing_website: Optional[str] = None

    brand_description: Optional[str] = None
    logo_received: Optional[bool] = None
    colors: Optional[str] = None
    fonts: Optional[str] = None
    visual_references: Optional[str] = None
    brand_guidelines_url: Optional[str] = None

    primary_business_goal: Optional[str] = None
    website_goal: Optional[str] = None
    conversion_goal: Optional[str] = None
    primary_cta: Optional[str] = None

    content_status: Optional[str] = None
    copy_received: Optional[bool] = None
    images_received: Optional[bool] = None
    videos_received: Optional[bool] = None
    testimonials_received: Optional[bool] = None
    other_assets: Optional[str] = None

    domain_info: Optional[str] = None
    hosting_info: Optional[str] = None
    cms_requirement: Optional[str] = None
    integrations_needed: Optional[str] = None
    analytics_needed: Optional[str] = None
    forms_needed: Optional[str] = None
    payment_requirements: Optional[str] = None
    third_party_services: Optional[str] = None

    required_pages: Optional[str] = None
    required_features: Optional[str] = None
    user_accounts_needed: Optional[bool] = None
    admin_requirements: Optional[str] = None

    discovery_checklist: Optional[list] = None

class ProjectBriefOut(BaseModel):
    id: int
    project_id: int

    business_name: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    location: Optional[str] = None
    website_domain: Optional[str] = None
    existing_website: Optional[str] = None

    brand_description: Optional[str] = None
    logo_received: bool = False
    colors: Optional[str] = None
    fonts: Optional[str] = None
    visual_references: Optional[str] = None
    brand_guidelines_url: Optional[str] = None

    primary_business_goal: Optional[str] = None
    website_goal: Optional[str] = None
    conversion_goal: Optional[str] = None
    primary_cta: Optional[str] = None

    content_status: Optional[str] = None
    copy_received: bool = False
    images_received: bool = False
    videos_received: bool = False
    testimonials_received: bool = False
    other_assets: Optional[str] = None

    domain_info: Optional[str] = None
    hosting_info: Optional[str] = None
    cms_requirement: Optional[str] = None
    integrations_needed: Optional[str] = None
    analytics_needed: Optional[str] = None
    forms_needed: Optional[str] = None
    payment_requirements: Optional[str] = None
    third_party_services: Optional[str] = None

    required_pages: Optional[str] = None
    required_features: Optional[str] = None
    user_accounts_needed: bool = False
    admin_requirements: Optional[str] = None

    discovery_checklist: Optional[list] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Milestone Schemas
class ProjectMilestoneCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: MilestoneStatus = Field(default=MilestoneStatus.UPCOMING)
    target_date: Optional[datetime] = None
    order_index: int = Field(default=0, ge=0)

class ProjectMilestoneUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[MilestoneStatus] = None
    target_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    order_index: Optional[int] = Field(default=None, ge=0)

class ProjectMilestoneOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: str
    target_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    order_index: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Approval Schemas
class ProjectApprovalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    item_type: ApprovalItemType = Field(default=ApprovalItemType.DESIGN)
    description: Optional[str] = None
    preview_url: Optional[str] = None
    asset_urls: Optional[list] = None

class ProjectApprovalOut(BaseModel):
    id: int
    project_id: int
    title: str
    item_type: str
    description: Optional[str] = None
    preview_url: Optional[str] = None
    asset_urls: Optional[list] = None
    public_token: str
    status: str
    decision_name: Optional[str] = None
    decision_email: Optional[str] = None
    decision_comment: Optional[str] = None
    decision_at: Optional[datetime] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PublicApprovalOut(BaseModel):
    title: str
    item_type: str
    description: Optional[str] = None
    preview_url: Optional[str] = None
    asset_urls: Optional[list] = None
    public_token: str
    status: str
    decision_name: Optional[str] = None
    decision_comment: Optional[str] = None
    decision_at: Optional[datetime] = None
    created_at: datetime
    project_name: str
    project_code: str
    client_name: str
    client_business_name: str

    model_config = ConfigDict(from_attributes=True)

class PublicApprovalDecisionIn(BaseModel):
    decision: str = Field(..., description="APPROVE or REQUEST_CHANGES")
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_email: str = Field(..., min_length=5, max_length=255)
    comment: Optional[str] = None

    @field_validator("customer_email")
    @classmethod
    def validate_customer_email(cls, v: str) -> str:
        return clean_and_validate_email(v)

    @field_validator("decision")
    @classmethod
    def validate_decision_val(cls, v: str) -> str:
        upper = v.strip().upper()
        if upper not in ["APPROVE", "REQUEST_CHANGES", "APPROVED", "CHANGES_REQUESTED"]:
            raise ValueError("Decision must be APPROVE or REQUEST_CHANGES")
        return "APPROVED" if upper in ["APPROVE", "APPROVED"] else "CHANGES_REQUESTED"

# Project Update Schemas
class ProjectUpdateCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    category: ProjectUpdateCategory = Field(default=ProjectUpdateCategory.PROGRESS)
    customer_visible: bool = Field(default=True)
    created_by: Optional[str] = None

class ProjectUpdateOut(BaseModel):
    id: int
    project_id: int
    title: str
    message: str
    category: str
    customer_visible: bool
    created_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PublicProjectUpdateOut(BaseModel):
    title: str
    message: str
    category: str
    created_at: datetime
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Handover & Completion Schemas
class ProjectHandoverUpdateIn(BaseModel):
    handover_checklist: Optional[list] = None
    handover_notes: Optional[str] = None

# Project Creation, Update, and Enriched Outputs
class ProjectCreate(BaseModel):
    client_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    service_type: ServiceType = Field(default=ServiceType.CUSTOM)
    priority: ProjectPriority = Field(default=ProjectPriority.MEDIUM)
    assigned_to: Optional[str] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    proposal_id: Optional[int] = None
    contract_id: Optional[int] = None
    invoice_id: Optional[int] = None
    template_type: Optional[str] = None

class ProjectPatchIn(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    service_type: Optional[ServiceType] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    health: Optional[ProjectHealth] = None
    assigned_to: Optional[str] = None
    waiting_for: Optional[str] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    proposal_id: Optional[int] = None
    contract_id: Optional[int] = None
    invoice_id: Optional[int] = None

ProjectUpdate = ProjectPatchIn


class ProjectOut(BaseModel):
    id: int
    client_id: int
    project_code: str
    name: str
    description: Optional[str] = None
    service_type: str
    status: str
    priority: str
    health: str
    public_token: str
    assigned_to: Optional[str] = None
    waiting_for: Optional[str] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    proposal_id: Optional[int] = None
    contract_id: Optional[int] = None
    invoice_id: Optional[int] = None
    handover_checklist: Optional[list] = None
    handover_notes: Optional[str] = None
    handover_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Associated and computed fields
    client_name: Optional[str] = None
    client_business_name: Optional[str] = None
    client_code: Optional[str] = None
    proposal_number: Optional[str] = None
    contract_number: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_payment_status: Optional[str] = None
    progress_percentage: int = 0
    total_tasks_count: int = 0
    completed_tasks_count: int = 0
    is_overdue: bool = False

    tasks: List[ProjectTaskOut] = []
    milestones: List[ProjectMilestoneOut] = []
    approvals: List[ProjectApprovalOut] = []
    updates: List[ProjectUpdateOut] = []
    resources: List[ProjectResourceOut] = []
    activities: List[ProjectActivityOut] = []
    brief: Optional[ProjectBriefOut] = None

    model_config = ConfigDict(from_attributes=True)

class PublicProjectOut(BaseModel):
    project_code: str
    name: str
    description: Optional[str] = None
    service_type: str
    status: str
    health: str
    progress_percentage: int = 0
    total_tasks_count: int = 0
    completed_tasks_count: int = 0
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    waiting_for: Optional[str] = None

    client_business_name: str
    client_name: str

    current_milestone: Optional[str] = None
    milestones: List[ProjectMilestoneOut] = []
    updates: List[PublicProjectUpdateOut] = []
    resources: List[ProjectResourceOut] = []
    pending_approvals: List[PublicApprovalOut] = []

class ProjectStatsOut(BaseModel):
    total_projects: int
    planned: int
    in_progress: int
    waiting_for_client: int
    blocked: int
    in_review: int
    completed: int
    cancelled: int
    overdue: int
    due_this_week: int
    high_priority: int
    active_build_projects: int = 0
    build_projects_due_this_week: int = 0
    build_projects_overdue: int = 0
    completed_this_month: int = 0

# ==============================================================================
# NOTIFICATION & EMAIL LOG SCHEMAS
# ==============================================================================

class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationListOut(BaseModel):
    notifications: List[NotificationOut]
    unread_count: int
    total_count: int

class EmailLogOut(BaseModel):
    id: int
    event_type: str
    recipient: str
    subject: str
    status: str
    error_message: Optional[str] = None
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ==============================================================================
# ADMIN COMMAND CENTER OPERATING SYSTEM SCHEMAS
# ==============================================================================

class AttentionItem(BaseModel):
    id: str
    type: str  # 'OVERDUE_FOLLOWUP', 'PENDING_PAYMENT', 'PENDING_APPROVAL', 'BLOCKED_PROJECT', 'UNREAD_INQUIRY'
    title: str
    subtitle: str
    action_label: str
    action_url: str
    priority: str  # 'URGENT', 'HIGH', 'MEDIUM'
    timestamp: Optional[datetime] = None

class RecentActivityItem(BaseModel):
    id: str
    category: str  # 'CRM', 'COMMERCIAL', 'DELIVERY', 'SYSTEM'
    title: str
    description: str
    action_url: Optional[str] = None
    timestamp: datetime

class CommandCenterMetrics(BaseModel):
    new_leads_count: int
    followups_due_today_count: int
    followups_overdue_count: int
    proposals_awaiting_count: int
    payments_awaiting_verification_count: int
    outstanding_invoice_amount: float
    active_projects_count: int
    projects_at_risk_count: int
    client_approvals_waiting_count: int
    unread_notifications_count: int
    attention_items: List[AttentionItem] = []
    recent_activities: List[RecentActivityItem] = []


# ==============================================================================
# WEB PUSH & ADMIN SETTINGS SCHEMAS
# ==============================================================================

class VapidPublicKeyResponse(BaseModel):
    public_key: Optional[str] = None
    configured: bool = False

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str = Field(..., min_length=5)
    keys: PushSubscriptionKeys
    user_agent: Optional[str] = None
    device_label: Optional[str] = None

class PushSubscriptionDelete(BaseModel):
    endpoint: Optional[str] = None

class PushLogOut(BaseModel):
    id: int
    event_type: str
    recipient: str
    title: str
    status: str
    error_message: Optional[str] = None
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AdminSettingsOut(BaseModel):
    username: str
    email_configured: bool
    email_enabled: bool
    business_email: str
    push_configured: bool
    active_push_subscriptions_count: int
    db_connected: bool
    app_version: str = "v2.4.0"
    environment: str



