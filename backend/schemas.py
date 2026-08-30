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
    PaymentMethod
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
    
    source: str = Field(default="Website", max_length=100)
    priority: str = Field(default=LeadPriority.MEDIUM.value, max_length=50)
    assigned_to: Optional[str] = Field(default=None, max_length=100)
    estimated_value: Optional[float] = Field(default=None, ge=0)
    next_follow_up_at: Optional[datetime] = None
    last_contacted_at: Optional[datetime] = None
    notes: Optional[str] = None
    lost_reason: Optional[str] = None
    converted_at: Optional[datetime] = None

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
    priority: Optional[LeadPriority] = None
    assigned_to: Optional[str] = None
    estimated_value: Optional[float] = None
    next_follow_up_at: Optional[datetime] = None
    last_contacted_at: Optional[datetime] = None
    notes: Optional[str] = None
    lost_reason: Optional[str] = None
    converted_at: Optional[datetime] = None

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
    secure_token: str
    client_name: str
    client_business_name: str
    client_email: str
    client_phone: str
    created_at: datetime
    sent_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    accepted_by_name: Optional[str] = None
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
