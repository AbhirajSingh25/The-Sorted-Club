import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from models import (
    Lead,
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
    Project,
    ProjectStatus,
    ProjectHealth,
    ProjectApproval,
    ApprovalStatus,
    Notification,
    EmailLog
)
from services.notification_service import generate_customer_email_html, send_customer_email

def test_admin_command_center_metrics(client: TestClient, admin_headers: dict, db_session: Session):
    """Verify GET /api/admin/command-center returns accurate metrics and attention items."""
    now = datetime.now(timezone.utc)
    yesterday = now - timedelta(days=2)
    tomorrow = now + timedelta(days=1)

    # 1. Seed Leads
    lead_new = Lead(
        name="Alice Founder",
        business_name="Nexus Innovations",
        email="alice@nexus.test",
        phone="9876543210",
        business_type="SaaS",
        service_interest="BUILD",
        problem="Need high-converting sales engine",
        budget="INR 40,000",
        status="NEW",
        created_at=now
    )
    lead_overdue = Lead(
        name="Bob Overdue",
        business_name="Retro Retail",
        email="bob@retro.test",
        phone="9876543211",
        business_type="Retail",
        service_interest="GROW",
        problem="SEO revamp",
        budget="INR 25,000",
        status="CONTACTED",
        next_follow_up_at=yesterday
    )
    lead_today = Lead(
        name="Carol Today",
        business_name="Carol Health",
        email="carol@health.test",
        phone="9876543212",
        business_type="Healthcare",
        service_interest="AUTOMATE",
        problem="CRM automation",
        budget="INR 30,000",
        status="QUALIFIED",
        next_follow_up_at=now
    )
    db_session.add_all([lead_new, lead_overdue, lead_today])
    db_session.commit()

    # 2. Seed Client, Proposal & Invoice
    client_obj = Client(
        lead_id=lead_new.id,
        client_code="TSC-NEX-01",
        name="Alice Founder",
        business_name="Nexus Innovations",
        email="alice@nexus.test",
        phone="9876543210",
        business_type="SaaS"
    )
    db_session.add(client_obj)
    db_session.commit()

    proposal = Proposal(
        client_id=client_obj.id,
        proposal_number="PROP-2026-NEX",
        title="BUILD Sales Engine",
        status=ProposalStatus.SENT.value,
        subtotal=39999.0,
        total=39999.0,
        currency="INR",
        secure_token="prop_tok_nex_123"
    )
    db_session.add(proposal)

    invoice = Invoice(
        client_id=client_obj.id,
        invoice_number="INV-2026-NEX",
        status=InvoiceStatus.SENT.value,
        subtotal=39999.0,
        total=39999.0,
        amount_paid=0.0,
        amount_due=39999.0,
        currency="INR",
        secure_token="inv_tok_nex_123"
    )
    db_session.add(invoice)
    db_session.commit()

    # 3. Seed Payment Confirmation awaiting verification
    pay_conf = PaymentConfirmation(
        invoice_id=invoice.id,
        client_id=client_obj.id,
        amount=19999.50,
        payment_method="UPI",
        reference="UPI98765432100",
        payer_name="Alice Founder",
        payer_email="alice@nexus.test",
        status=PaymentConfirmationStatus.PENDING_VERIFICATION.value
    )
    db_session.add(pay_conf)

    # 4. Seed Project with At Risk health
    project = Project(
        client_id=client_obj.id,
        invoice_id=invoice.id,
        project_code="TSC-PRJ-NEX01",
        public_token="nexus_pub_tok_123",
        name="Nexus Sales Platform",
        service_type="BUILD",
        status=ProjectStatus.WAITING_FOR_CLIENT.value,
        health=ProjectHealth.AT_RISK.value,
        waiting_for="Brand assets and domain credentials"
    )
    db_session.add(project)
    db_session.commit()

    # 5. Query Command Center
    resp = client.get("/api/admin/command-center", headers=admin_headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["new_leads_count"] >= 1
    assert data["followups_overdue_count"] >= 1
    assert data["followups_due_today_count"] >= 1
    assert data["proposals_awaiting_count"] >= 1
    assert data["payments_awaiting_verification_count"] >= 1
    assert data["outstanding_invoice_amount"] >= 39999.0
    assert data["active_projects_count"] >= 1
    assert data["projects_at_risk_count"] >= 1

    # Check attention queue
    att_types = [item["type"] for item in data["attention_items"]]
    assert "PENDING_PAYMENT" in att_types
    assert "OVERDUE_FOLLOWUP" in att_types
    assert "BLOCKED_PROJECT" in att_types

def test_lead_qualification_and_followup_completion(client: TestClient, admin_headers: dict, db_session: Session):
    """Verify lead discovery fields (decision maker, budget fit, timeline) and 1-click follow-up completion."""
    now = datetime.now(timezone.utc)
    create_resp = client.post("/api/leads", json={
        "name": "Devin Founder",
        "business_name": "CloudNova",
        "email": "devin@cloudnova.test",
        "phone": "+91 98765 43299",
        "business_type": "Tech",
        "service_interest": "BUILD",
        "problem": "Complete revamp of customer checkout and landing pages",
        "budget": "INR 39,999",
        "consent": True
    })
    assert create_resp.status_code == 201, create_resp.text
    lead_id = create_resp.json()["id"]

    # Patch with qualification fields
    patch_resp = client.patch(f"/api/leads/{lead_id}", json={
        "decision_maker": "Devin (Sole Founder & CEO)",
        "budget_fit": "EXCELLENT",
        "timeline": "ASAP / 2 Weeks",
        "next_follow_up_at": (now - timedelta(hours=5)).isoformat()
    }, headers=admin_headers)
    assert patch_resp.status_code == 200
    p_data = patch_resp.json()
    assert p_data["decision_maker"] == "Devin (Sole Founder & CEO)"
    assert p_data["budget_fit"] == "EXCELLENT"
    assert p_data["timeline"] == "ASAP / 2 Weeks"

    # Complete follow-up action
    next_time = now + timedelta(days=3)
    comp_resp = client.post(f"/api/leads/{lead_id}/complete-follow-up", json={
        "notes": "Discussed scope via WhatsApp, customer agreed to 50/50 payment terms.",
        "next_follow_up_at": next_time.isoformat()
    }, headers=admin_headers)
    assert comp_resp.status_code == 200, comp_resp.text
    c_data = comp_resp.json()
    assert c_data["last_contacted_at"] is not None

def test_invoice_installments_and_preset_generation(client: TestClient, admin_headers: dict, db_session: Session):
    """Verify BUILD 50/50 installment generation and synchronization when payment is recorded."""
    lead_sarah = Lead(
        name="Sarah Connor",
        business_name="CyberTech Systems",
        email="sarah@cybertech.test",
        phone="9876543219",
        business_type="Tech",
        service_interest="BUILD",
        problem="AI defenses",
        budget="INR 14,999",
        status="QUALIFIED"
    )
    db_session.add(lead_sarah)
    db_session.commit()

    client_obj = Client(
        lead_id=lead_sarah.id,
        client_code="TSC-BLD-01",
        name="Sarah Connor",
        business_name="CyberTech Systems",
        email="sarah@cybertech.test",
        phone="9876543219",
        business_type="Tech"
    )
    db_session.add(client_obj)
    db_session.commit()

    # Create BUILD START invoice (₹14,999) with preset BUILD_50_50
    inv_resp = client.post("/api/invoices", json={
        "client_id": client_obj.id,
        "currency": "INR",
        "payment_terms_preset": "START_50_50",
        "items": [
            {
                "name": "The Sorted Club BUILD — Start Package",
                "description": "5-page conversion website & operating baseline",
                "quantity": 1,
                "unit_price": 14999.0
            }
        ]
    }, headers=admin_headers)
    assert inv_resp.status_code == 201, inv_resp.text
    inv_data = inv_resp.json()
    invoice_id = inv_data["id"]
    token = inv_data["secure_token"]

    installments = inv_data.get("installments", [])
    assert len(installments) == 2
    assert installments[0]["amount"] == 7499.50
    assert installments[0]["status"] == "PENDING"
    assert installments[1]["amount"] == 7499.50
    assert installments[1]["status"] == "PENDING"

    # Public invoice view must include installments
    pub_resp = client.get(f"/api/public/invoice/{token}")
    assert pub_resp.status_code == 200
    pub_data = pub_resp.json()
    assert len(pub_data["installments"]) == 2
    assert pub_data["installments"][0]["amount"] == 7499.50

    # Record advance payment of ₹7,499.50
    pay_resp = client.post(f"/api/invoices/{invoice_id}/payments", json={
        "amount": 7499.50,
        "payment_method": "BANK_TRANSFER",
        "reference": "UTR5544332211",
        "notes": "50% Advance received"
    }, headers=admin_headers)
    assert pay_resp.status_code == 201, pay_resp.text
    updated_inv = pay_resp.json()
    assert updated_inv["amount_paid"] == 7499.50
    assert updated_inv["amount_due"] == 7499.50
    assert updated_inv["status"] == "PARTIALLY_PAID"

    # Installment #1 should now be PAID
    inst_1 = updated_inv["installments"][0]
    inst_2 = updated_inv["installments"][1]
    assert inst_1["status"] == "PAID"
    assert inst_1["paid_at"] is not None
    assert inst_2["status"] == "PENDING"

def test_project_activation_guard_with_unpaid_invoice(client: TestClient, admin_headers: dict, db_session: Session):
    """Verify that a project linked to an unpaid invoice CANNOT transition to IN_PROGRESS until verified."""
    lead_gordon = Lead(
        name="Gordon Freeman",
        business_name="Black Mesa Research",
        email="gordon@blackmesa.test",
        phone="9876543218",
        business_type="Research",
        service_interest="BUILD",
        problem="Research portal",
        budget="INR 39,999",
        status="QUALIFIED"
    )
    db_session.add(lead_gordon)
    db_session.commit()

    client_obj = Client(
        lead_id=lead_gordon.id,
        client_code="TSC-GRD-01",
        name="Gordon Freeman",
        business_name="Black Mesa Research",
        email="gordon@blackmesa.test",
        phone="9876543218",
        business_type="Research"
    )
    db_session.add(client_obj)
    db_session.commit()

    # Create Invoice (unpaid)
    invoice = Invoice(
        client_id=client_obj.id,
        invoice_number="INV-2026-BM",
        status=InvoiceStatus.SENT.value,
        subtotal=39999.0,
        total=39999.0,
        amount_paid=0.0,
        amount_due=39999.0,
        currency="INR",
        secure_token="inv_tok_bm_123"
    )
    db_session.add(invoice)
    db_session.commit()

    # Create Project in PLANNED
    proj_resp = client.post("/api/projects", json={
        "client_id": client_obj.id,
        "invoice_id": invoice.id,
        "name": "Black Mesa Portal",
        "service_type": "WEBSITE"
    }, headers=admin_headers)
    assert proj_resp.status_code == 201, proj_resp.text
    project_id = proj_resp.json()["id"]

    # Try to activate to IN_PROGRESS before payment -> should fail with 400
    fail_activate = client.patch(f"/api/projects/{project_id}", json={
        "status": "IN_PROGRESS"
    }, headers=admin_headers)
    assert fail_activate.status_code == 400
    assert "Initial advance payment has not been verified" in fail_activate.json()["detail"]

    # Record advance payment
    invoice.amount_paid = 19999.50
    invoice.amount_due = 19999.50
    invoice.status = InvoiceStatus.PARTIALLY_PAID.value
    db_session.commit()

    # Now activate to IN_PROGRESS -> should succeed
    succ_activate = client.patch(f"/api/projects/{project_id}", json={
        "status": "IN_PROGRESS"
    }, headers=admin_headers)
    assert succ_activate.status_code == 200, succ_activate.text
    assert succ_activate.json()["status"] == "IN_PROGRESS"

def test_customer_email_content_sanitization_and_isolation(db_session: Session):
    """Verify customer emails do not leak internal diagnostic notes, admin usernames, or staff URLs."""
    html = generate_customer_email_html(
        title="Your Project is Kickstarted",
        message="We have commenced your sprint.",
        data={
            "id": 999,
            "admin_user": "superadmin_secret",
            "internal_notes": "Client was difficult on call",
            "Project Code": "TSC-PRJ-01",
            "Sprint Duration": "2 Weeks"
        },
        cta_text="OPEN PROJECT HUB →",
        cta_url="/project/sample_token_123"
    )

    # Must contain customer information
    assert "Your Project is Kickstarted" in html
    assert "TSC-PRJ-01" in html
    assert "2 Weeks" in html
    assert "OPEN PROJECT HUB →" in html
    assert "/project/sample_token_123" in html
    assert "thesortedclub@gmail.com" in html

    # Must NOT contain internal leakages
    assert "superadmin_secret" not in html
    assert "Client was difficult on call" not in html
    assert "OPEN IN ADMIN DASHBOARD" not in html

    # Verify sending in test environment is safely skipped without SMTP network sockets
    status_result, error = send_customer_email(
        db=db_session,
        recipient="customer@example.com",
        event_type="TEST_EVENT",
        subject="Test Customer Notification",
        title="Test Notification",
        message="Hello World"
    )
    assert status_result == "SKIPPED"

    # Verify EmailLog was recorded
    log = db_session.query(EmailLog).filter(EmailLog.recipient == "customer@example.com").first()
    assert log is not None
    assert log.event_type == "CUSTOMER_TEST_EVENT"
    assert log.status == "SKIPPED"
