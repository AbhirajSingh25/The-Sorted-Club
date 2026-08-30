import os
import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from database import get_db
from models import (
    Client,
    Proposal,
    ProposalItem,
    Invoice,
    InvoiceItem,
    InvoiceStatus,
    Payment,
    PaymentMethod,
    PaymentConfirmation,
    PaymentConfirmationStatus,
    ClientOnboardingItem,
    LeadActivity,
    ActivityType
)
from schemas import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceOut,
    InvoiceItemCreate,
    InvoiceItemOut,
    PaymentCreate,
    PaymentOut,
    PaymentInstructionsOut,
    PublicPaymentOut,
    PublicInvoiceOut,
    PublicPaymentConfirmationCreate,
    PublicPaymentConfirmationOut
)
from auth import get_current_admin

router = APIRouter(tags=["Invoices & Payments"])

def get_payment_instructions() -> PaymentInstructionsOut:
    """Retrieve official banking and UPI payment instructions from server environment configuration."""
    return PaymentInstructionsOut(
        upi_id=os.getenv("PAYMENT_UPI_ID", "thesortedclub@upi"),
        account_name=os.getenv("PAYMENT_BANK_ACCOUNT_NAME", "The Sorted Club Private Limited"),
        bank_name=os.getenv("PAYMENT_BANK_NAME", "HDFC Bank"),
        account_number=os.getenv("PAYMENT_BANK_ACCOUNT_NUMBER", "50200012345678"),
        ifsc=os.getenv("PAYMENT_BANK_IFSC", "HDFC0001234"),
        branch=os.getenv("PAYMENT_BANK_BRANCH", "Indiranagar, Bangalore")
    )

def generate_invoice_number(db: Session) -> str:
    """Generate human readable format SC-INV-YYYY-0001"""
    current_year = datetime.now(timezone.utc).year
    prefix = f"SC-INV-{current_year}-"
    latest = db.query(Invoice).filter(Invoice.invoice_number.like(f"{prefix}%")).order_by(desc(Invoice.id)).first()
    if latest and latest.invoice_number:
        try:
            seq = int(latest.invoice_number.split("-")[-1]) + 1
        except Exception:
            seq = db.query(func.count(Invoice.id)).scalar() + 1
    else:
        seq = db.query(func.count(Invoice.id)).scalar() + 1
    return f"{prefix}{seq:04d}"

def calculate_invoice_totals(items_data: list, discount: float = 0.0, tax: float = 0.0):
    """Compute subtotal, discount, tax, and grand total safely on the server."""
    subtotal = sum(float(item.get("quantity", 1.0)) * float(item.get("unit_price", 0.0)) for item in items_data)
    clean_discount = max(0.0, float(discount or 0.0))
    clean_tax = max(0.0, float(tax or 0.0))
    total = max(0.0, subtotal - clean_discount + clean_tax)
    return round(subtotal, 2), round(clean_discount, 2), round(clean_tax, 2), round(total, 2)

def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def enrich_invoice_out(invoice: Invoice, db: Session) -> InvoiceOut:
    client = db.query(Client).filter(Client.id == invoice.client_id).first()
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).order_by(asc(InvoiceItem.order_index)).all()
    payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).order_by(desc(Payment.paid_at)).all()

    now = datetime.now(timezone.utc)
    due_utc = ensure_utc(invoice.due_date)
    is_overdue = bool(due_utc and due_utc < now and invoice.status not in [InvoiceStatus.PAID.value, InvoiceStatus.CANCELLED.value])

    out_dict = {
        "id": invoice.id,
        "client_id": invoice.client_id,
        "proposal_id": invoice.proposal_id,
        "invoice_number": invoice.invoice_number,
        "status": invoice.status,
        "subtotal": invoice.subtotal,
        "discount": invoice.discount,
        "tax": invoice.tax,
        "total": invoice.total,
        "amount_paid": invoice.amount_paid,
        "amount_due": invoice.amount_due,
        "currency": invoice.currency,
        "issue_date": invoice.issue_date,
        "due_date": invoice.due_date,
        "notes": invoice.notes,
        "secure_token": invoice.secure_token,
        "paid_at": invoice.paid_at,
        "created_at": invoice.created_at,
        "updated_at": invoice.updated_at,
        "items": items,
        "payments": payments,
        "client_name": client.name if client else None,
        "client_business_name": client.business_name if client else None,
        "client_code": client.client_code if client else None,
        "is_overdue": is_overdue
    }
    return InvoiceOut(**out_dict)

@router.post("/api/invoices", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Create a new invoice with line items."""
    client = db.query(Client).filter(Client.id == invoice_in.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {invoice_in.client_id} not found."
        )

    try:
        items_dict = [it.model_dump() for it in invoice_in.items]
        subtotal, discount, tax, total = calculate_invoice_totals(
            items_dict,
            discount=invoice_in.discount,
            tax=invoice_in.tax
        )

        invoice_number = generate_invoice_number(db)
        now = datetime.now(timezone.utc)
        secure_token = secrets.token_urlsafe(32)

        new_invoice = Invoice(
            client_id=invoice_in.client_id,
            proposal_id=invoice_in.proposal_id,
            invoice_number=invoice_number,
            status=InvoiceStatus.DRAFT.value,
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            total=total,
            amount_paid=0.0,
            amount_due=total,
            currency=invoice_in.currency or "USD",
            issue_date=invoice_in.issue_date or now,
            due_date=invoice_in.due_date,
            notes=invoice_in.notes,
            secure_token=secure_token
        )
        db.add(new_invoice)
        db.flush()

        for idx, it in enumerate(invoice_in.items):
            it_total = round(it.quantity * it.unit_price, 2)
            db_item = InvoiceItem(
                invoice_id=new_invoice.id,
                name=it.name.strip(),
                description=it.description.strip() if it.description else None,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total=it_total,
                order_index=it.order_index if it.order_index is not None else idx
            )
            db.add(db_item)

        db.add(LeadActivity(
            client_id=client.id,
            lead_id=client.lead_id,
            type=ActivityType.NOTE.value,
            text=f"Draft Invoice {invoice_number} created. Total: ${total:,.2f}.",
            created_by=admin_user
        ))

        db.commit()
        db.refresh(new_invoice)
        return enrich_invoice_out(new_invoice, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create invoice: {str(e)}"
        )

@router.post("/api/invoices/from-proposal/{proposal_id}", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice_from_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Generate a formal invoice directly from a proposal."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal with id {proposal_id} not found."
        )

    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found."
        )

    try:
        invoice_number = generate_invoice_number(db)
        now = datetime.now(timezone.utc)
        secure_token = secrets.token_urlsafe(32)

        new_invoice = Invoice(
            client_id=client.id,
            proposal_id=proposal.id,
            invoice_number=invoice_number,
            status=InvoiceStatus.DRAFT.value,
            subtotal=proposal.subtotal,
            discount=proposal.discount,
            tax=proposal.tax,
            total=proposal.total,
            amount_paid=0.0,
            amount_due=proposal.total,
            currency=proposal.currency,
            issue_date=now,
            due_date=proposal.valid_until,
            notes=proposal.notes,
            secure_token=secure_token
        )
        db.add(new_invoice)
        db.flush()

        prop_items = db.query(ProposalItem).filter(ProposalItem.proposal_id == proposal.id).all()
        for it in prop_items:
            db.add(InvoiceItem(
                invoice_id=new_invoice.id,
                name=it.name,
                description=it.description,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total=it.total,
                order_index=it.order_index
            ))

        db.add(LeadActivity(
            client_id=client.id,
            lead_id=client.lead_id,
            type=ActivityType.NOTE.value,
            text=f"Draft Invoice {invoice_number} created from Proposal {proposal.proposal_number}. Total: ${proposal.total:,.2f}.",
            created_by=admin_user
        ))

        db.commit()
        db.refresh(new_invoice)
        return enrich_invoice_out(new_invoice, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate invoice from proposal: {str(e)}"
        )

@router.get("/api/invoices", response_model=List[InvoiceOut])
def get_invoices(
    status_filter: Optional[str] = Query(None, alias="status"),
    client_id: Optional[int] = Query(None),
    is_overdue: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """List invoices with filters."""
    try:
        now = datetime.now(timezone.utc)
        query = db.query(Invoice)

        if status_filter and status_filter.upper() != "ALL":
            if status_filter.upper() == "OVERDUE":
                query = query.filter(
                    Invoice.due_date.isnot(None),
                    Invoice.due_date < now,
                    Invoice.status.notin_([InvoiceStatus.PAID.value, InvoiceStatus.CANCELLED.value])
                )
            else:
                query = query.filter(func.upper(Invoice.status) == status_filter.strip().upper())

        if client_id:
            query = query.filter(Invoice.client_id == client_id)

        if is_overdue is True:
            query = query.filter(
                Invoice.due_date.isnot(None),
                Invoice.due_date < now,
                Invoice.status.notin_([InvoiceStatus.PAID.value, InvoiceStatus.CANCELLED.value])
            )

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Invoice.invoice_number.ilike(term),
                    Invoice.notes.ilike(term)
                )
            )

        if sort_by == "value_desc":
            query = query.order_by(desc(Invoice.total))
        elif sort_by == "due_asc":
            query = query.order_by(asc(Invoice.due_date).nullslast())
        elif sort_by == "oldest":
            query = query.order_by(asc(Invoice.created_at))
        else:
            query = query.order_by(desc(Invoice.created_at))

        invoices = query.all()
        return [enrich_invoice_out(inv, db) for inv in invoices]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query invoices."
        )

@router.get("/api/invoices/{invoice_id}", response_model=InvoiceOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """Retrieve single invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found."
        )
    return enrich_invoice_out(invoice, db)

@router.patch("/api/invoices/{invoice_id}", response_model=InvoiceOut)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Update draft invoice details and recalculate totals."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found."
        )

    try:
        update_dict = invoice_update.model_dump(exclude_unset=True)

        if "items" in update_dict and update_dict["items"] is not None:
            db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).delete()
            for idx, it in enumerate(invoice_update.items):
                it_total = round(it.quantity * it.unit_price, 2)
                db_item = InvoiceItem(
                    invoice_id=invoice.id,
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
        curr_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
        items_raw = [{"quantity": it.quantity, "unit_price": it.unit_price} for it in curr_items]
        discount = update_dict.get("discount", invoice.discount)
        tax = update_dict.get("tax", invoice.tax)
        subtotal, discount, tax, total = calculate_invoice_totals(items_raw, discount, tax)

        invoice.subtotal = subtotal
        invoice.discount = discount
        invoice.tax = tax
        invoice.total = total
        invoice.amount_due = max(0.0, round(total - invoice.amount_paid, 2))

        for key, val in update_dict.items():
            if key != "items":
                setattr(invoice, key, val)

        invoice.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(invoice)
        return enrich_invoice_out(invoice, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update invoice: {str(e)}"
        )

@router.delete("/api/invoices/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Delete draft invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found."
        )
    db.delete(invoice)
    db.commit()
    return {"message": f"Invoice {invoice.invoice_number} deleted successfully."}

@router.post("/api/invoices/{invoice_id}/send", response_model=InvoiceOut)
def send_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Mark invoice as SENT."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found."
        )

    if invoice.status == InvoiceStatus.DRAFT.value:
        invoice.status = InvoiceStatus.SENT.value

    invoice.updated_at = datetime.now(timezone.utc)

    db.add(LeadActivity(
        client_id=invoice.client_id,
        type=ActivityType.EMAIL.value,
        text=f"Invoice {invoice.invoice_number} (${invoice.total:,.2f}) marked as SENT to client.",
        created_by=admin_user
    ))

    db.commit()
    db.refresh(invoice)
    return enrich_invoice_out(invoice, db)

def check_and_update_client_onboarding(client_id: int, db: Session, reason: str = ""):
    """Helper to mark initial payment complete and complete onboarding if all items done."""
    now = datetime.now(timezone.utc)
    initial_pay_item = db.query(ClientOnboardingItem).filter(
        ClientOnboardingItem.client_id == client_id,
        or_(
            ClientOnboardingItem.item_key == "initial_payment",
            ClientOnboardingItem.title.ilike("%payment%"),
            ClientOnboardingItem.title.ilike("%initial payment received%")
        ),
        ClientOnboardingItem.completed == False
    ).first()

    if initial_pay_item:
        initial_pay_item.completed = True
        initial_pay_item.completed_at = now
        initial_pay_item.notes = reason or "Confirmed via official payment."

    # Check if all items complete
    all_items = db.query(ClientOnboardingItem).filter(ClientOnboardingItem.client_id == client_id).all()
    if all_items and all(item.completed for item in all_items):
        client = db.query(Client).filter(Client.id == client_id).first()
        if client and client.onboarding_status != "COMPLETED":
            client.onboarding_status = "COMPLETED"
            client.onboarding_completed_at = now
            db.add(LeadActivity(
                client_id=client.id,
                lead_id=client.lead_id,
                type=ActivityType.STATUS_CHANGE.value,
                text="All onboarding checklist items completed. Client onboarding status updated to COMPLETED.",
                created_by="System"
            ))

@router.post("/api/invoices/{invoice_id}/payments", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def record_payment(
    invoice_id: int,
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """Record manual payment (supports partial/full payments) and recalculate invoice status."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found."
        )

    try:
        now = datetime.now(timezone.utc)
        payment_method_str = payment_in.payment_method.value if isinstance(payment_in.payment_method, PaymentMethod) else str(payment_in.payment_method).upper()

        new_payment = Payment(
            invoice_id=invoice.id,
            amount=round(payment_in.amount, 2),
            payment_method=payment_method_str,
            reference=payment_in.reference.strip() if payment_in.reference else None,
            paid_at=payment_in.paid_at or now,
            notes=payment_in.notes
        )
        db.add(new_payment)
        db.flush()

        # Recalculate payment totals
        all_payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).all()
        total_paid = sum(p.amount for p in all_payments)
        invoice.amount_paid = round(total_paid, 2)
        invoice.amount_due = max(0.0, round(invoice.total - total_paid, 2))

        # Status transitions
        if invoice.amount_paid >= invoice.total:
            invoice.status = InvoiceStatus.PAID.value
            invoice.paid_at = now
        elif invoice.amount_paid > 0:
            invoice.status = InvoiceStatus.PARTIALLY_PAID.value

        invoice.updated_at = now

        # Log activity
        ref_txt = f" (Ref: {new_payment.reference})" if new_payment.reference else ""
        db.add(LeadActivity(
            client_id=invoice.client_id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Payment of ${new_payment.amount:,.2f} recorded for Invoice {invoice.invoice_number} via {new_payment.payment_method}{ref_txt}. Remaining balance: ${invoice.amount_due:,.2f}.",
            created_by=admin_user
        ))

        # Check and update onboarding
        check_and_update_client_onboarding(
            invoice.client_id,
            db,
            reason=f"Confirmed via Invoice {invoice.invoice_number} payment (${new_payment.amount:,.2f})."
        )

        db.commit()
        db.refresh(invoice)
        return enrich_invoice_out(invoice, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record payment: {str(e)}"
        )

@router.get("/api/invoices/{invoice_id}/payments", response_model=List[PaymentOut])
def get_invoice_payments(
    invoice_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """Retrieve payment transaction history for an invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {invoice_id} not found."
        )

    payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).order_by(desc(Payment.paid_at)).all()
    return payments

# ==============================================================================
# PUBLIC TOKENIZED INVOICE & PAYMENT CONFIRMATION ENDPOINTS (NO AUTH REQUIRED)
# ==============================================================================

@router.get("/api/public/invoice/{token}", response_model=PublicInvoiceOut)
def get_public_invoice(token: str, db: Session = Depends(get_db)):
    """Fetch sanitized invoice document and payment instructions by secure token."""
    invoice = db.query(Invoice).filter(Invoice.secure_token == token).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent invoice link."
        )

    client = db.query(Client).filter(Client.id == invoice.client_id).first()
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).order_by(asc(InvoiceItem.order_index)).all()
    payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).order_by(desc(Payment.paid_at)).all()

    now = datetime.now(timezone.utc)
    due_utc = ensure_utc(invoice.due_date)
    is_overdue = bool(due_utc and due_utc < now and invoice.status not in [InvoiceStatus.PAID.value, InvoiceStatus.CANCELLED.value])

    # Check if there is a pending confirmation
    has_pending = db.query(PaymentConfirmation).filter(
        PaymentConfirmation.invoice_id == invoice.id,
        PaymentConfirmation.status == PaymentConfirmationStatus.PENDING_VERIFICATION.value
    ).first() is not None

    pub_payments = [
        PublicPaymentOut(
            amount=p.amount,
            payment_method=p.payment_method,
            reference=p.reference,
            paid_at=p.paid_at
        ) for p in payments
    ]

    return PublicInvoiceOut(
        invoice_number=invoice.invoice_number,
        status=invoice.status,
        subtotal=invoice.subtotal,
        discount=invoice.discount,
        tax=invoice.tax,
        total=invoice.total,
        amount_paid=invoice.amount_paid,
        amount_due=invoice.amount_due,
        currency=invoice.currency,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        notes=invoice.notes,
        paid_at=invoice.paid_at,
        created_at=invoice.created_at,
        secure_token=invoice.secure_token,
        client_name=client.name if client else "Client",
        client_business_name=client.business_name if client else "Client Company",
        client_email=client.email if client else "",
        client_phone=client.phone if client else "",
        items=items,
        payments=pub_payments,
        payment_instructions=get_payment_instructions(),
        is_overdue=is_overdue,
        has_pending_confirmation=has_pending
    )

@router.post("/api/public/invoice/{token}/confirm-payment", response_model=PublicPaymentConfirmationOut, status_code=status.HTTP_201_CREATED)
def submit_payment_confirmation(
    token: str,
    confirm_in: PublicPaymentConfirmationCreate,
    db: Session = Depends(get_db)
):
    """Customer submits an 'I've made the payment' verification claim."""
    invoice = db.query(Invoice).filter(Invoice.secure_token == token).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or non-existent invoice link."
        )

    now = datetime.now(timezone.utc)
    payment_method_str = confirm_in.payment_method.value if isinstance(confirm_in.payment_method, PaymentMethod) else str(confirm_in.payment_method).upper()
    payment_date = confirm_in.payment_date or now

    try:
        new_confirm = PaymentConfirmation(
            invoice_id=invoice.id,
            client_id=invoice.client_id,
            amount=round(confirm_in.amount, 2),
            payment_method=payment_method_str,
            reference=confirm_in.reference.strip(),
            payer_name=confirm_in.payer_name.strip(),
            payer_email=confirm_in.payer_email.strip(),
            payment_date=payment_date,
            notes=confirm_in.notes.strip() if confirm_in.notes else None,
            status=PaymentConfirmationStatus.PENDING_VERIFICATION.value
        )
        db.add(new_confirm)
        db.flush()

        db.add(LeadActivity(
            client_id=invoice.client_id,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Payment claim of ${new_confirm.amount:,.2f} via {new_confirm.payment_method} (Ref: {new_confirm.reference}) submitted online by {new_confirm.payer_name} ({new_confirm.payer_email}) for Invoice {invoice.invoice_number}. Awaiting finance confirmation.",
            created_by="Client Payment Portal"
        ))

        db.commit()
        db.refresh(new_confirm)

        return PublicPaymentConfirmationOut(
            message="Payment confirmation received. Our team will verify and record your payment shortly.",
            status=new_confirm.status,
            reference=new_confirm.reference,
            amount=new_confirm.amount,
            created_at=new_confirm.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit payment confirmation: {str(e)}"
        )
