from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from database import get_db
from models import (
    Client,
    Proposal,
    ProposalStatus,
    Invoice,
    InvoiceStatus,
    InvoiceInstallment,
    InstallmentStatus,
    Payment,
    PaymentConfirmation,
    PaymentConfirmationStatus,
    ClientOnboardingItem,
    LeadActivity,
    ActivityType
)
from schemas import (
    FinanceStats,
    PaymentConfirmationOut,
    PaymentConfirmationReview
)
from auth import get_current_admin
from routes.invoices import check_and_update_client_onboarding, sync_invoice_installments_on_payment
from services.notification_service import send_business_notification, send_customer_email

router = APIRouter(prefix="/api/finance", tags=["Commercial & Finance"])

def enrich_confirmation_out(c: PaymentConfirmation, db: Session) -> PaymentConfirmationOut:
    invoice = db.query(Invoice).filter(Invoice.id == c.invoice_id).first()
    client = db.query(Client).filter(Client.id == c.client_id).first()
    return PaymentConfirmationOut(
        id=c.id,
        invoice_id=c.invoice_id,
        client_id=c.client_id,
        amount=c.amount,
        payment_method=c.payment_method,
        reference=c.reference,
        payer_name=c.payer_name,
        payer_email=c.payer_email,
        payment_date=c.payment_date,
        notes=c.notes,
        status=c.status,
        reviewed_by=c.reviewed_by,
        reviewed_at=c.reviewed_at,
        rejection_reason=c.rejection_reason,
        created_at=c.created_at,
        updated_at=c.updated_at,
        invoice_number=invoice.invoice_number if invoice else None,
        client_name=client.name if client else None,
        client_business_name=client.business_name if client else None,
        client_code=client.client_code if client else None
    )

@router.get("/stats", response_model=FinanceStats)
def get_finance_stats(
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Return aggregate commercial & financial performance metrics.
    """
    try:
        now = datetime.now(timezone.utc)

        # Invoices metrics
        invoices = db.query(Invoice).filter(Invoice.status != InvoiceStatus.CANCELLED.value).all()
        total_invoiced = sum(inv.total for inv in invoices)
        total_paid = sum(inv.amount_paid for inv in invoices)
        total_outstanding = max(0.0, round(total_invoiced - total_paid, 2))

        def ensure_utc(dt):
            if dt is None:
                return None
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)

        overdue_invoices = [
            inv for inv in invoices
            if inv.due_date and ensure_utc(inv.due_date) < now and inv.status != InvoiceStatus.PAID.value
        ]
        total_overdue = sum(inv.amount_due for inv in overdue_invoices)

        # Proposals metrics
        proposals = db.query(Proposal).all()
        proposals_pending = [
            p for p in proposals
            if p.status in [ProposalStatus.DRAFT.value, ProposalStatus.SENT.value, ProposalStatus.VIEWED.value]
        ]
        proposals_accepted = [p for p in proposals if p.status == ProposalStatus.ACCEPTED.value]
        proposals_rejected = [p for p in proposals if p.status == ProposalStatus.REJECTED.value]

        proposals_total_value = sum(p.total for p in proposals_pending + proposals_accepted)
        
        closed_proposals = len(proposals_accepted) + len(proposals_rejected)
        conversion_rate = round((len(proposals_accepted) / closed_proposals * 100), 1) if closed_proposals > 0 else 0.0

        return FinanceStats(
            total_invoiced=round(total_invoiced, 2),
            total_paid=round(total_paid, 2),
            total_outstanding=round(total_outstanding, 2),
            total_overdue=round(total_overdue, 2),
            proposals_pending_count=len(proposals_pending),
            proposals_accepted_count=len(proposals_accepted),
            proposals_total_value=round(proposals_total_value, 2),
            conversion_rate_percentage=conversion_rate
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve finance statistics."
        )

@router.get("/payment-confirmations", response_model=List[PaymentConfirmationOut])
def get_payment_confirmations(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: List customer payment verification requests.
    """
    try:
        query = db.query(PaymentConfirmation)
        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(func.upper(PaymentConfirmation.status) == status_filter.strip().upper())
        
        confirmations = query.order_by(desc(PaymentConfirmation.created_at)).all()
        return [enrich_confirmation_out(c, db) for c in confirmations]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query payment confirmations."
        )

@router.post("/payment-confirmations/{confirmation_id}/confirm", response_model=PaymentConfirmationOut)
def confirm_payment_verification(
    confirmation_id: int,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Admin verifies and accepts payment confirmation.
    Creates official Payment record, updates invoice balance and status,
    and advances client onboarding checklist.
    """
    conf = db.query(PaymentConfirmation).filter(PaymentConfirmation.id == confirmation_id).first()
    if not conf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment confirmation with id {confirmation_id} not found."
        )

    if conf.status == PaymentConfirmationStatus.CONFIRMED.value:
        return enrich_confirmation_out(conf, db)

    invoice = db.query(Invoice).filter(Invoice.id == conf.invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice associated with confirmation not found."
        )

    try:
        now = datetime.now(timezone.utc)

        # 1. Create official Payment record
        new_payment = Payment(
            invoice_id=invoice.id,
            amount=conf.amount,
            payment_method=conf.payment_method,
            reference=conf.reference,
            paid_at=conf.payment_date or now,
            notes=f"Confirmed from customer verification submitted by {conf.payer_name} ({conf.payer_email})." + (f" Note: {conf.notes}" if conf.notes else "")
        )
        db.add(new_payment)
        db.flush()

        # 2. Recalculate invoice payments
        all_payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).all()
        total_paid = sum(p.amount for p in all_payments)
        invoice.amount_paid = round(total_paid, 2)
        invoice.amount_due = max(0.0, round(invoice.total - total_paid, 2))

        if invoice.amount_paid >= invoice.total:
            invoice.status = InvoiceStatus.PAID.value
            invoice.paid_at = now
        elif invoice.amount_paid > 0:
            invoice.status = InvoiceStatus.PARTIALLY_PAID.value

        invoice.updated_at = now

        # 3. Update confirmation status
        conf.status = PaymentConfirmationStatus.CONFIRMED.value
        conf.reviewed_by = admin_user
        conf.reviewed_at = now
        conf.updated_at = now

        # 4. Log client activity
        client = db.query(Client).filter(Client.id == invoice.client_id).first()
        db.add(LeadActivity(
            client_id=invoice.client_id,
            lead_id=client.lead_id if client else None,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Payment of ${conf.amount:,.2f} (Ref: {conf.reference}) for Invoice {invoice.invoice_number} was VERIFIED & CONFIRMED by {admin_user}. Balance due: ${invoice.amount_due:,.2f}.",
            created_by=admin_user
        ))

        # 5. Check and complete client onboarding checklist item
        check_and_update_client_onboarding(
            invoice.client_id,
            db,
            reason=f"Auto-completed via verified payment (${conf.amount:,.2f}) for Invoice {invoice.invoice_number}."
        )

        # 6. Sync invoice installments
        sync_invoice_installments_on_payment(invoice, new_payment, db)

        db.commit()
        db.refresh(conf)

        # Trigger admin notification & email
        client = db.query(Client).filter(Client.id == invoice.client_id).first()
        biz_name = client.business_name if client else conf.payer_name
        send_business_notification(
            db=db,
            event_type="PAYMENT_VERIFIED",
            subject=f"[The Sorted Club] Payment Verified — {biz_name}",
            title=f"Payment Verified: Invoice {invoice.invoice_number}",
            message=f"Payment of {invoice.currency} {conf.amount:,.2f} for {biz_name} verified by {admin_user}. Balance due: {invoice.currency} {invoice.amount_due:,.2f}.",
            data={
                "Invoice": invoice.invoice_number,
                "Business": biz_name,
                "Amount Verified": f"{invoice.currency} {conf.amount:,.2f}",
                "Remaining Due": f"{invoice.currency} {invoice.amount_due:,.2f}",
                "Invoice Status": invoice.status,
                "Verified By": admin_user
            },
            entity_type="payment_confirmation",
            entity_id=conf.id,
            action_url=f"/admin/finance?tab=invoices"
        )

        # Customer receipt email
        if client and client.email:
            send_customer_email(
                db=db,
                recipient=client.email,
                event_type="PAYMENT_VERIFIED",
                subject=f"Payment Receipt: {invoice.invoice_number} Confirmed — The Sorted Club",
                title="Payment Confirmed!",
                message=f"Your payment of {invoice.currency} {conf.amount:,.2f} for Invoice {invoice.invoice_number} has been verified and recorded. Thank you for your partnership!",
                cta_text="VIEW UPDATED INVOICE →",
                cta_url=f"/invoice/{invoice.secure_token}",
                data={
                    "Invoice Number": invoice.invoice_number,
                    "Amount Confirmed": f"{invoice.currency} {conf.amount:,.2f}",
                    "Remaining Balance": f"{invoice.currency} {invoice.amount_due:,.2f}",
                    "Reference / UTR": conf.reference,
                    "Payment Method": conf.payment_method
                }
            )

        return enrich_confirmation_out(conf, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm payment verification: {str(e)}"
        )

@router.post("/payment-confirmations/{confirmation_id}/reject", response_model=PaymentConfirmationOut)
def reject_payment_verification(
    confirmation_id: int,
    review_in: PaymentConfirmationReview,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Admin rejects payment verification claim.
    Does NOT create official payment or change invoice balance.
    """
    conf = db.query(PaymentConfirmation).filter(PaymentConfirmation.id == confirmation_id).first()
    if not conf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment confirmation with id {confirmation_id} not found."
        )

    now = datetime.now(timezone.utc)
    conf.status = PaymentConfirmationStatus.REJECTED.value
    conf.reviewed_by = admin_user
    conf.reviewed_at = now
    conf.rejection_reason = review_in.reason.strip() if review_in.reason else None
    conf.updated_at = now

    invoice = db.query(Invoice).filter(Invoice.id == conf.invoice_id).first()
    reason_text = f" Reason: '{conf.rejection_reason}'." if conf.rejection_reason else ""

    if invoice:
        # Revert any VERIFICATION_PENDING installment back to PENDING
        verif_inst = db.query(InvoiceInstallment).filter(
            InvoiceInstallment.invoice_id == invoice.id,
            InvoiceInstallment.status == InstallmentStatus.VERIFICATION_PENDING.value
        ).first()
        if verif_inst:
            verif_inst.status = InstallmentStatus.PENDING.value

        client = db.query(Client).filter(Client.id == conf.client_id).first()
        db.add(LeadActivity(
            client_id=invoice.client_id,
            lead_id=client.lead_id if client else None,
            type=ActivityType.STATUS_CHANGE.value,
            text=f"Payment verification claim of ${conf.amount:,.2f} (Ref: {conf.reference}) for Invoice {invoice.invoice_number} was REJECTED by {admin_user}.{reason_text}",
            created_by=admin_user
        ))

    db.commit()
    db.refresh(conf)

    # Trigger admin notification & email
    client = db.query(Client).filter(Client.id == conf.client_id).first()
    biz_name = client.business_name if client else conf.payer_name
    send_business_notification(
        db=db,
        event_type="PAYMENT_REJECTED",
        subject=f"[The Sorted Club] Payment Verification Rejected — {biz_name}",
        title=f"Payment Verification Rejected: Invoice {invoice.invoice_number if invoice else ''}",
        message=f"Payment confirmation of {invoice.currency if invoice else 'USD'} {conf.amount:,.2f} for {biz_name} was rejected by {admin_user}. Reason: {conf.rejection_reason or 'Verification check failed'}",
        data={
            "Invoice": invoice.invoice_number if invoice else "—",
            "Business": biz_name,
            "Amount": f"{invoice.currency if invoice else 'USD'} {conf.amount:,.2f}",
            "Rejection Reason": conf.rejection_reason or "Verification check failed",
            "Reviewed By": admin_user
        },
        entity_type="payment_confirmation",
        entity_id=conf.id,
        action_url=f"/admin/finance?tab=verifications"
    )

    return enrich_confirmation_out(conf, db)
