import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base

class LeadStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    PROPOSAL = "PROPOSAL"
    NEGOTIATION = "NEGOTIATION"
    WON = "WON"
    LOST = "LOST"

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
    priority = Column(String(50), nullable=False, default=LeadPriority.MEDIUM.value, index=True)
    assigned_to = Column(String(100), nullable=True, index=True)
    estimated_value = Column(Float, nullable=True)
    next_follow_up_at = Column(DateTime(timezone=True), nullable=True, index=True)
    last_contacted_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    lost_reason = Column(Text, nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)

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
