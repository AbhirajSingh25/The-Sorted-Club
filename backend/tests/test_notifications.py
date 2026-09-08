import os
import smtplib
import pytest
from unittest.mock import patch, MagicMock
from models import (
    Lead,
    Client,
    Proposal,
    ProposalStatus,
    Invoice,
    InvoiceStatus,
    Project,
    ProjectStatus,
    ProjectMilestone,
    ProjectTask,
    TaskStatus,
    ProjectApproval,
    ApprovalStatus,
    ApprovalItemType,
    Notification,
    EmailLog
)
from services.notification_service import send_business_notification, test_smtp_delivery as check_smtp_delivery, get_email_config

def test_new_inquiry_triggers_notification(client, admin_headers):
    """Submitting a new inquiry from the website should trigger a NEW_INQUIRY notification."""
    res = client.post("/api/leads", json={
        "name": "Sarah Miller",
        "business_name": "Apex Design Studio",
        "email": "sarah@apexdesign.com",
        "phone": "+91 98765 43210",
        "business_type": "Agency",
        "service_interest": "Website / Build",
        "problem": "Need modern agency website built quickly with productized delivery.",
        "budget": "INR 39,999 (Sorted Pro)",
        "consent": True
    })
    assert res.status_code == 201

    # Check notification via admin endpoint
    notif_res = client.get("/api/notifications", headers=admin_headers)
    assert notif_res.status_code == 200
    data = notif_res.json()
    assert data["unread_count"] >= 1

    inquiry_notif = next((n for n in data["notifications"] if n["type"] == "NEW_INQUIRY"), None)
    assert inquiry_notif is not None
    assert "Apex Design Studio" in inquiry_notif["title"]
    assert "Sarah Miller" in inquiry_notif["message"]
    assert "Website / Build" in inquiry_notif["message"]
    assert inquiry_notif["is_read"] is False

    # Check email logs
    logs_res = client.get("/api/notifications/email-logs", headers=admin_headers)
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 1
    assert logs[0]["event_type"] == "NEW_INQUIRY"


def test_proposal_and_payment_notification_flow(client, admin_headers, db_session):
    """Proposal acceptance and payment claims trigger notifications."""
    # 1. Create lead & client
    lead = Lead(
        name="John Doe",
        business_name="Acme Global",
        email="john@acmeglobal.com",
        phone="+91 91234 56789",
        business_type="Technology",
        service_interest="Website / Build",
        problem="Need high conversion website",
        budget="INR 39,999",
        status="WON"
    )
    db_session.add(lead)
    db_session.commit()
    db_session.refresh(lead)

    client_obj = Client(
        lead_id=lead.id,
        client_code="SC-CLI-NOTIF",
        name="John Doe",
        business_name="Acme Global",
        email="john@acmeglobal.com",
        phone="+91 91234 56789",
        business_type="Technology",
        status="ACTIVE"
    )
    db_session.add(client_obj)
    db_session.commit()
    db_session.refresh(client_obj)

    proposal = Proposal(
        client_id=client_obj.id,
        proposal_number="PROP-NOTIF-01",
        title="Acme Global Website Build",
        status=ProposalStatus.SENT.value,
        total=39999.0,
        currency="INR",
        secure_token="token-prop-notif-123"
    )
    db_session.add(proposal)
    db_session.commit()
    db_session.refresh(proposal)

    # 2. Accept proposal publicly -> triggers PROPOSAL_ACCEPTED
    accept_res = client.post(f"/api/public/proposal/{proposal.secure_token}/accept", json={
        "accepted_by_name": "John Doe",
        "accepted_by_email": "john@acmeglobal.com"
    })
    assert accept_res.status_code == 200

    notif_res = client.get("/api/notifications", headers=admin_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()["notifications"]
    prop_notif = next((n for n in notifs if n["type"] == "PROPOSAL_ACCEPTED"), None)
    assert prop_notif is not None
    assert "PROP-NOTIF-01" in prop_notif["title"]
    assert "Acme Global" in prop_notif["message"]

    # 3. Create invoice for client
    inv = Invoice(
        client_id=client_obj.id,
        proposal_id=proposal.id,
        invoice_number="INV-NOTIF-01",
        status=InvoiceStatus.SENT.value,
        subtotal=15999.60,
        total=15999.60,
        amount_paid=0.0,
        amount_due=15999.60,
        currency="INR",
        secure_token="token-inv-notif-123"
    )
    db_session.add(inv)
    db_session.commit()
    db_session.refresh(inv)

    # 4. Customer submits payment confirmation -> triggers PAYMENT_CONFIRMATION_SUBMITTED
    claim_res = client.post(f"/api/public/invoice/{inv.secure_token}/confirm-payment", json={
        "amount": 15999.60,
        "payment_method": "UPI",
        "reference": "UPI987654321098",
        "payer_name": "John Doe",
        "payer_email": "john@acmeglobal.com",
        "notes": "Transferred via GPay UPI"
    })
    assert claim_res.status_code == 201

    notif_res = client.get("/api/notifications", headers=admin_headers)
    notifs = notif_res.json()["notifications"]
    claim_notif = next((n for n in notifs if n["type"] == "PAYMENT_CONFIRMATION_SUBMITTED"), None)
    assert claim_notif is not None
    assert "INV-NOTIF-01" in claim_notif["title"]

    # 5. Admin verifies and confirms payment -> triggers PAYMENT_VERIFIED
    conf_id = claim_notif["entity_id"]
    confirm_res = client.post(f"/api/finance/payment-confirmations/{conf_id}/confirm", headers=admin_headers)
    assert confirm_res.status_code == 200

    notif_res = client.get("/api/notifications", headers=admin_headers)
    notifs = notif_res.json()["notifications"]
    verified_notif = next((n for n in notifs if n["type"] == "PAYMENT_VERIFIED"), None)
    assert verified_notif is not None
    assert "Acme Global" in verified_notif["message"] or "INV-NOTIF-01" in verified_notif["title"]


def test_customer_approval_and_project_lifecycle_notifications(client, admin_headers, db_session):
    """Approvals, changes requested, blockers, and completions trigger notifications."""
    lead = Lead(
        name="Emma Stone",
        business_name="Stone Studios",
        email="emma@stonestudios.com",
        phone="+91 98765 12345",
        business_type="Design Agency",
        service_interest="Website / Build",
        problem="Full portfolio overhaul",
        budget="INR 39,999",
        status="WON"
    )
    db_session.add(lead)
    db_session.commit()
    db_session.refresh(lead)

    client_obj = Client(
        lead_id=lead.id,
        client_code="SC-CLI-PROJNOTIF",
        name="Emma Stone",
        business_name="Stone Studios",
        email="emma@stonestudios.com",
        phone="+91 98765 12345",
        business_type="Design Agency",
        status="ACTIVE"
    )
    db_session.add(client_obj)
    db_session.commit()
    db_session.refresh(client_obj)

    project = Project(
        client_id=client_obj.id,
        project_code="SC-PROJ-TESTNOTIF",
        name="Stone Studios Brand Portal",
        service_type="WEBSITE",
        status=ProjectStatus.IN_PROGRESS.value,
        priority="HIGH",
        public_token="token-proj-notif-123",
        handover_checklist=[]
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    # 1. Create Approval Request
    approval = ProjectApproval(
        project_id=project.id,
        title="Homepage Wireframes & Art Direction",
        item_type=ApprovalItemType.DESIGN.value,
        description="Figma layout review",
        status=ApprovalStatus.PENDING.value,
        public_token="token-appr-notif-123"
    )
    db_session.add(approval)
    db_session.commit()
    db_session.refresh(approval)

    # 2. Customer requests changes -> triggers CUSTOMER_REQUESTED_CHANGES
    decide_res = client.post(f"/api/public/approval/{approval.public_token}/decision", json={
        "decision": "CHANGES_REQUESTED",
        "customer_name": "Emma Stone",
        "customer_email": "emma@stonestudios.com",
        "comment": "Please use darker slate background for the hero section."
    })
    assert decide_res.status_code == 200

    notifs = client.get("/api/notifications", headers=admin_headers).json()["notifications"]
    req_notif = next((n for n in notifs if n["type"] == "CUSTOMER_REQUESTED_CHANGES"), None)
    assert req_notif is not None
    assert "Changes Requested" in req_notif["title"]
    assert "Homepage Wireframes" in req_notif["title"] or "Homepage Wireframes" in req_notif["message"]

    # 3. Create second Approval Request to test approval
    approval2 = ProjectApproval(
        project_id=project.id,
        title="Final UI Polish & Copywriting",
        item_type=ApprovalItemType.DESIGN.value,
        description="Review final pages",
        status=ApprovalStatus.PENDING.value,
        public_token="token-appr-notif-456"
    )
    db_session.add(approval2)
    db_session.commit()
    db_session.refresh(approval2)

    # Customer approves deliverable -> triggers CUSTOMER_APPROVAL_RECEIVED
    approve_res = client.post(f"/api/public/approval/{approval2.public_token}/decision", json={
        "decision": "APPROVED",
        "customer_name": "Emma Stone",
        "customer_email": "emma@stonestudios.com",
        "comment": "Looks perfect, proceed to development!"
    })
    assert approve_res.status_code == 200

    notifs = client.get("/api/notifications", headers=admin_headers).json()["notifications"]
    appr_notif = next((n for n in notifs if n["type"] == "CUSTOMER_APPROVAL_RECEIVED"), None)
    assert appr_notif is not None
    assert "Approved" in appr_notif["title"]

    # 4. Project status set to BLOCKED -> triggers PROJECT_BLOCKED
    block_res = client.patch(f"/api/projects/{project.id}", headers=admin_headers, json={
        "status": "BLOCKED",
        "waiting_for": "Waiting on client DNS credentials"
    })
    assert block_res.status_code == 200

    notifs = client.get("/api/notifications", headers=admin_headers).json()["notifications"]
    block_notif = next((n for n in notifs if n["type"] == "PROJECT_BLOCKED"), None)
    assert block_notif is not None
    assert "Blocked" in block_notif["title"]
    assert "DNS credentials" in block_notif["message"]

    # 5. Complete project -> triggers PROJECT_COMPLETED
    complete_res = client.patch(f"/api/projects/{project.id}", headers=admin_headers, json={
        "status": "COMPLETED"
    })
    assert complete_res.status_code == 200

    notifs = client.get("/api/notifications", headers=admin_headers).json()["notifications"]
    comp_notif = next((n for n in notifs if n["type"] == "PROJECT_COMPLETED"), None)
    assert comp_notif is not None
    assert "Stone Studios Brand Portal" in comp_notif["title"]


def test_notification_endpoints_crud_and_security(client, admin_headers, db_session):
    """Notification management endpoints require auth and allow marking read/deleting."""
    # Unauthorized access rejected
    unauth_res = client.get("/api/notifications")
    assert unauth_res.status_code == 401

    # Create dummy notification
    notif = Notification(
        type="FOLLOW_UP_DUE",
        title="Follow-up due for Acme Corp",
        message="Follow up call scheduled today",
        is_read=False
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    # Get notifications
    res = client.get("/api/notifications?unread_only=true", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["unread_count"] >= 1

    # Mark single notification as read
    read_res = client.patch(f"/api/notifications/{notif.id}/read", headers=admin_headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Mark all read
    mark_all_res = client.post("/api/notifications/mark-all-read", headers=admin_headers)
    assert mark_all_res.status_code == 200

    # Verify unread count becomes 0
    ref_res = client.get("/api/notifications", headers=admin_headers)
    assert ref_res.status_code == 200
    assert ref_res.json()["unread_count"] == 0

    # Delete notification
    del_res = client.delete(f"/api/notifications/{notif.id}", headers=admin_headers)
    assert del_res.status_code in [200, 204]


def test_notification_failure_does_not_break_business_flow(client, admin_headers):
    """If email or notification fails internally, lead creation still succeeds."""
    with patch("services.notification_service.send_business_notification") as mock_send:
        mock_send.side_effect = Exception("Simulated unexpected SMTP / socket failure")

        # Business action should still succeed without rolling back
        res = client.post("/api/leads", json={
            "name": "Resilient Customer",
            "business_name": "Resilient Co",
            "email": "resilient@example.com",
            "phone": "+91 99999 88888",
            "business_type": "Retail",
            "service_interest": "Website / Build",
            "problem": "Testing transaction isolation under SMTP failure.",
            "budget": "INR 14,999 (Sorted Start)",
            "consent": True
        })
        assert res.status_code == 201
        assert "id" in res.json()


def test_mocked_smtp_email_send_success(db_session, monkeypatch):
    """When EMAIL_NOTIFICATIONS_ENABLED=True and SMTP is configured, SMTP send succeeds through mock transport."""
    monkeypatch.setattr("services.notification_service._allow_test_smtp_mock", True)
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setenv("SMTP_PORT", "587")
    monkeypatch.setenv("SMTP_USERNAME", "thesortedclub@gmail.com")
    monkeypatch.setenv("SMTP_PASSWORD", "mockedapppassword16")
    monkeypatch.setenv("SMTP_FROM_EMAIL", "thesortedclub@gmail.com")
    monkeypatch.setenv("BUSINESS_NOTIFICATION_EMAIL", "thesortedclub@gmail.com")

    with patch("smtplib.SMTP") as mock_smtp_cls:
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        notif = send_business_notification(
            db=db_session,
            event_type="NEW_INQUIRY",
            subject="🔔 New Inquiry: Test Client",
            title="New High-Intent Inquiry",
            message="Test Client submitted an inquiry for BUILD.",
            data={"business_name": "Test Client", "budget": "INR 39,999"},
            action_url="/admin/crm?selectedLead=99"
        )

        assert notif is not None
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("thesortedclub@gmail.com", "mockedapppassword16")
        mock_server.sendmail.assert_called_once()

        # Check EmailLog
        latest_log = db_session.query(EmailLog).order_by(EmailLog.id.desc()).first()
        assert latest_log is not None
        assert latest_log.status == "SENT"
        assert latest_log.recipient == "thesortedclub@gmail.com"


def test_smtp_failure_records_failed_log_and_sanitizes_errors(db_session, monkeypatch):
    """When SMTP raises a connection exception, EmailLog records FAILED with sanitized error."""
    monkeypatch.setattr("services.notification_service._allow_test_smtp_mock", True)
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setenv("SMTP_PASSWORD", "supersecret123456")

    with patch("smtplib.SMTP") as mock_smtp_cls:
        mock_smtp_cls.side_effect = smtplib.SMTPConnectError(421, b"Connection refused with supersecret123456")

        notif = send_business_notification(
            db=db_session,
            event_type="PAYMENT_VERIFIED",
            subject="💳 Payment Verified",
            title="Payment Verified for Project",
            message="Initial 50% deposit verified."
        )

        assert notif is not None
        latest_log = db_session.query(EmailLog).order_by(EmailLog.id.desc()).first()
        assert latest_log is not None
        assert latest_log.status == "FAILED"
        assert "supersecret123456" not in latest_log.error_message
        assert "********" in latest_log.error_message or "Connection refused" in latest_log.error_message


def test_diagnostic_test_email_endpoint(client, admin_headers, monkeypatch):
    """Admin endpoint /api/notifications/test-email executes diagnostic test."""
    # When password is missing:
    monkeypatch.setenv("SMTP_PASSWORD", "")
    res = client.post("/api/notifications/test-email", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "missing_password"
    assert "App Password" in data["error"]

    # When password is provided and mock succeeds:
    monkeypatch.setattr("services.notification_service._allow_test_smtp_mock", True)
    monkeypatch.setenv("SMTP_PASSWORD", "validapppassword16")
    with patch("smtplib.SMTP") as mock_smtp_cls:
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        res2 = client.post("/api/notifications/test-email?recipient=thesortedclub@gmail.com", headers=admin_headers)
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["status"] == "success"
        assert "delivered" in data2["message"]


def test_unauthorized_diagnostic_endpoint(client):
    """Unauthenticated call to /api/notifications/test-email returns 401."""
    res = client.post("/api/notifications/test-email")
    assert res.status_code == 401
    assert "Admin authentication required" in res.json()["detail"]


def test_notifications_disabled_records_skipped_log(db_session, monkeypatch):
    """When EMAIL_NOTIFICATIONS_ENABLED=false, dispatch records SKIPPED in EmailLog."""
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "false")
    notif = send_business_notification(
        db=db_session,
        event_type="NEW_INQUIRY",
        subject="🔔 Test Inquiry",
        title="Test Inquiry",
        message="Inquiry submitted with email disabled."
    )
    assert notif is not None
    latest_log = db_session.query(EmailLog).order_by(EmailLog.id.desc()).first()
    assert latest_log is not None
    assert latest_log.status == "SKIPPED"
    assert "disabled" in latest_log.error_message.lower() or "false" in latest_log.error_message.lower()


def test_smtp_authentication_failure_records_failed_log(db_session, monkeypatch):
    """When SMTP authentication fails (e.g. 535 BadCredentials), EmailLog records FAILED."""
    monkeypatch.setattr("services.notification_service._allow_test_smtp_mock", True)
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setenv("SMTP_PASSWORD", "invalid_password")

    with patch("smtplib.SMTP") as mock_smtp_cls:
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"5.7.8 BadCredentials")
        mock_smtp_cls.return_value.__enter__.return_value = mock_server

        notif = send_business_notification(
            db=db_session,
            event_type="CONTRACT_SIGNED",
            subject="📜 Contract Signed",
            title="Contract Signed",
            message="Client signed contract."
        )

        assert notif is not None
        latest_log = db_session.query(EmailLog).order_by(EmailLog.id.desc()).first()
        assert latest_log is not None
        assert latest_log.status == "FAILED"
        assert "BadCredentials" in latest_log.error_message


def test_pytest_environment_strictly_blocks_real_smtp_dispatch(db_session, monkeypatch):
    """
    CRITICAL SAFETY REGRESSION:
    Even if SMTP credentials exist and EMAIL_NOTIFICATIONS_ENABLED=true in the environment,
    when APP_ENV=test, send_business_notification NEVER contacts real SMTP.
    """
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setenv("SMTP_PASSWORD", "real_or_fake_secret_password")
    monkeypatch.setattr("services.notification_service._allow_test_smtp_mock", False)

    # Calling send_business_notification in test mode without mock flag
    notif = send_business_notification(
        db=db_session,
        event_type="NEW_INQUIRY",
        subject="🔔 Test Real Lead Event",
        title="Test Real Lead Event",
        message="Vance Industrial Supply submitted an inquiry."
    )

    # 1. DB Notification must be recorded
    assert notif is not None
    assert notif.type == "NEW_INQUIRY"

    # 2. EmailLog must record SKIPPED with test environment reason
    latest_log = db_session.query(EmailLog).order_by(EmailLog.id.desc()).first()
    assert latest_log is not None
    assert latest_log.status == "SKIPPED"
    assert "APP_ENV=test" in latest_log.error_message or "disabled in test environment" in latest_log.error_message


def test_conftest_guard_blocks_unmocked_real_network_connections():
    """
    FAIL-SAFE SOCKET INTERCEPTOR REGRESSION:
    If any unmocked test attempts to invoke smtplib.SMTP.connect or smtplib.SMTP_SSL.connect,
    conftest.py raises RuntimeError immediately.
    """
    client_smtp = smtplib.SMTP()
    with pytest.raises(RuntimeError) as excinfo:
        client_smtp.connect("smtp.gmail.com", 587)
    assert "CRITICAL SECURITY VIOLATION" in str(excinfo.value)
    assert "smtp.gmail.com:587" in str(excinfo.value)


def test_app_env_modes_configuration_matrix(monkeypatch):
    """Verifies get_email_config delivery rules across test, development, and production modes."""
    # 1. Test Mode (Always disabled)
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    cfg_test = get_email_config()
    assert cfg_test["app_env"] == "test"
    assert cfg_test["enabled"] is False
    assert cfg_test["is_live_allowed"] is False

    # 2. Development Mode (Enabled when EMAIL_NOTIFICATIONS_ENABLED=true)
    monkeypatch.setenv("APP_ENV", "development")
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    cfg_dev = get_email_config()
    assert cfg_dev["app_env"] == "development"
    assert cfg_dev["enabled"] is True
    assert cfg_dev["is_live_allowed"] is True

    # 3. Development Mode with notifications disabled
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "false")
    cfg_dev_disabled = get_email_config()
    assert cfg_dev_disabled["enabled"] is False

    # 4. Production Mode
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("EMAIL_NOTIFICATIONS_ENABLED", "true")
    cfg_prod = get_email_config()
    assert cfg_prod["app_env"] == "production"
    assert cfg_prod["enabled"] is True
    assert cfg_prod["is_live_allowed"] is True


def test_startup_and_schema_upgrades_do_not_send_emails(db_session):
    """Application startup, migrations, and health checks never generate notifications or email logs."""
    from database import upgrade_schema
    initial_log_count = db_session.query(EmailLog).count()
    initial_notif_count = db_session.query(Notification).count()

    # Run upgrade schema
    upgrade_schema(db_session.bind)

    assert db_session.query(EmailLog).count() == initial_log_count
    assert db_session.query(Notification).count() == initial_notif_count


def test_phase13_official_email_identity_defaults(monkeypatch):
    """
    PHASE 13 REGRESSION:
    The official business email must strictly be thesortedclub@gmail.com across all defaults.
    thesortedclub1@gmail.com must NEVER appear in active runtime configuration.
    """
    monkeypatch.delenv("SMTP_USERNAME", raising=False)
    monkeypatch.delenv("SMTP_FROM_EMAIL", raising=False)
    monkeypatch.delenv("BUSINESS_NOTIFICATION_EMAIL", raising=False)

    config = get_email_config()
    assert config["username"] == "thesortedclub@gmail.com"
    assert config["from_email"] == "thesortedclub@gmail.com"
    assert config["business_email"] == "thesortedclub@gmail.com"
    assert "thesortedclub1@gmail.com" not in str(config.values())


def test_phase13_diagnostic_endpoint_reports_new_email(client, admin_headers, monkeypatch):
    """
    PHASE 13 REGRESSION:
    Diagnostic test endpoint returns thesortedclub@gmail.com as username and from_email.
    """
    res = client.post("/api/notifications/test-email", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "thesortedclub@gmail.com"
    assert data["from_email"] == "thesortedclub@gmail.com"
    assert "thesortedclub1@gmail.com" not in str(data)



