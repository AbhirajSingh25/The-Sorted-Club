import time
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta
from models import (
    Lead,
    Notification,
    NotificationJob,
    NotificationJobStatus,
    NotificationChannel,
    EmailLog
)
from services.notification_worker import (
    NotificationWorker,
    get_notification_worker,
    is_permanent_email_error,
    is_config_error,
    is_historical_config_skipped,
    unblock_config_blocked_jobs,
    recover_historical_skipped_jobs
)
import services.notification_service as notif_svc


def test_missing_smtp_configuration_sets_config_blocked(client, admin_headers):
    """
    When SMTP_PASSWORD is not configured, email jobs must transition to CONFIG_BLOCKED
    without consuming transient retry attempts or spinning indefinitely.
    """
    res = client.post("/api/leads", json={
        "name": "Bruce Wayne",
        "business_name": "Wayne Enterprises",
        "email": "bruce@wayneenterprises.com",
        "phone": "+1 555 019 2834",
        "business_type": "Conglomerate",
        "service_interest": "Custom software",
        "problem": "Secure operational intelligence infrastructure.",
        "budget": "$100,000+",
        "consent": True
    })
    assert res.status_code == 201
    lead_id = res.json()["id"]

    # In test environment, when testing with mock enabled but SMTP_PASSWORD empty:
    with patch.dict("os.environ", {"EMAIL_NOTIFICATIONS_ENABLED": "true", "SMTP_PASSWORD": ""}), \
         patch.object(notif_svc, "_allow_test_smtp_mock", True):
        worker = get_notification_worker()
        worker.process_all_pending()

    jobs = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    email_jobs = [j for j in jobs if j["channel"] == "EMAIL"]
    assert len(email_jobs) == 2
    for ej in email_jobs:
        assert ej["status"] == NotificationJobStatus.CONFIG_BLOCKED.value
        assert "SMTP_PASSWORD" in (ej["last_error"] or "")
        # Transient retry budget must NOT be consumed
        assert ej["attempts"] == 0
        assert ej["next_retry_at"] is None


def test_disabled_notifications_sets_config_blocked(client, admin_headers):
    """
    When EMAIL_NOTIFICATIONS_ENABLED=false, email jobs must transition to CONFIG_BLOCKED.
    """
    res = client.post("/api/leads", json={
        "name": "Clark Kent",
        "business_name": "Daily Planet",
        "email": "clark@dailyplanet.com",
        "phone": "+1 555 432 1098",
        "business_type": "Publishing & Media",
        "service_interest": "Website / Build",
        "problem": "Investigative journalism archive CMS.",
        "budget": "$25,000 - $50,000",
        "consent": True
    })
    assert res.status_code == 201
    lead_id = res.json()["id"]

    with patch.dict("os.environ", {"EMAIL_NOTIFICATIONS_ENABLED": "false", "SMTP_PASSWORD": "valid_secret_pw"}), \
         patch.object(notif_svc, "_allow_test_smtp_mock", True):
        worker = get_notification_worker()
        worker.process_all_pending()

    jobs = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    email_jobs = [j for j in jobs if j["channel"] == "EMAIL"]
    assert len(email_jobs) == 2
    for ej in email_jobs:
        assert ej["status"] == NotificationJobStatus.CONFIG_BLOCKED.value
        assert "disabled" in (ej["last_error"] or "").lower()
        assert ej["attempts"] == 0


def test_recovery_after_configuration_corrected(client, admin_headers):
    """
    After configuration is corrected, previously CONFIG_BLOCKED jobs must automatically
    become eligible for delivery and transition to COMPLETED upon processing.
    """
    res = client.post("/api/leads", json={
        "name": "Diana Prince",
        "business_name": "Themyscira Cultural Arts",
        "email": "diana@themyscira.org",
        "phone": "+1 555 888 7777",
        "business_type": "Arts & Culture",
        "service_interest": "Branding & Strategy",
        "problem": "International digital archive of classical artifacts.",
        "budget": "$50,000+",
        "consent": True
    })
    assert res.status_code == 201
    lead_id = res.json()["id"]

    # 1. First trigger failure due to missing credentials
    with patch.dict("os.environ", {"EMAIL_NOTIFICATIONS_ENABLED": "true", "SMTP_PASSWORD": ""}), \
         patch.object(notif_svc, "_allow_test_smtp_mock", True):
        worker = get_notification_worker()
        worker.process_all_pending()

    jobs_blocked = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    email_jobs = [j for j in jobs_blocked if j["channel"] == "EMAIL"]
    for ej in email_jobs:
        assert ej["status"] == NotificationJobStatus.CONFIG_BLOCKED.value

    # 2. Correct configuration: provide password and valid SMTP mock
    with patch("smtplib.SMTP") as mock_smtp, \
         patch.dict("os.environ", {"EMAIL_NOTIFICATIONS_ENABLED": "true", "SMTP_PASSWORD": "valid_mock_app_pw"}), \
         patch.object(notif_svc, "_allow_test_smtp_mock", True):
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        # Processing due jobs should auto-unblock and deliver
        worker = get_notification_worker()
        worker.process_all_pending()

    jobs_delivered = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    email_jobs_delivered = [j for j in jobs_delivered if j["channel"] == "EMAIL"]
    for ej in email_jobs_delivered:
        assert ej["status"] == NotificationJobStatus.COMPLETED.value
        assert ej["completed_at"] is not None
        assert ej["last_error"] is None


def test_historical_skipped_job_recovery_endpoint(client, admin_headers, db_session):
    """
    Historical jobs marked SKIPPED due to configuration issues can be safely recovered
    via the authenticated endpoint without touching push jobs or completed jobs.
    """
    # Create a historical lead
    lead = Lead(
        name="Arthur Curry",
        business_name="Atlantis Marine Tech",
        email="arthur@atlantis.org",
        phone="+1 555 999 0000",
        business_type="Marine Technology",
        service_interest="Custom software",
        problem="Oceanographic telemetry grid.",
        budget="$80,000+"
    )
    db_session.add(lead)
    db_session.commit()
    db_session.refresh(lead)

    # 1. Historical skipped customer ack job (due to missing SMTP password)
    ack_job = NotificationJob(
        idempotency_key=f"lead_{lead.id}_customer_ack",
        channel="EMAIL",
        event_type="INQUIRY_RECEIVED",
        lead_id=lead.id,
        recipient="arthur@atlantis.org",
        subject="We received your brief",
        payload={"title": "Thanks Arthur!"},
        status=NotificationJobStatus.SKIPPED.value,
        last_error="SMTP_PASSWORD is not set (requires Gmail 16-char App Password)"
    )
    # 2. Historical skipped owner email job (due to disabled notifications)
    owner_job = NotificationJob(
        idempotency_key=f"lead_{lead.id}_owner_email",
        channel="EMAIL",
        event_type="NEW_INQUIRY",
        lead_id=lead.id,
        recipient="thesortedclub@gmail.com",
        subject="New Inquiry",
        payload={"title": "New Inquiry: Atlantis Marine"},
        status=NotificationJobStatus.SKIPPED.value,
        last_error="EMAIL_NOTIFICATIONS_ENABLED is false"
    )
    # 3. Push job legitimately skipped because no push subscriptions exist
    push_job = NotificationJob(
        idempotency_key=f"lead_{lead.id}_web_push",
        channel="PUSH",
        event_type="NEW_INQUIRY",
        lead_id=lead.id,
        recipient="all_admin_devices",
        subject="New inquiry",
        payload={"title": "New website inquiry"},
        status=NotificationJobStatus.SKIPPED.value,
        last_error="No active push subscriptions registered."
    )
    db_session.add_all([ack_job, owner_job, push_job])
    db_session.commit()

    # Dry-run preview check
    preview_res = client.post(
        "/api/notifications/jobs/recover?dry_run=true",
        json={"lead_id": lead.id},
        headers=admin_headers
    )
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert preview_data["dry_run"] is True
    assert preview_data["recovered_count"] == 2
    recovered_ids = [j["job_id"] for j in preview_data["jobs"]]
    assert ack_job.id in recovered_ids
    assert owner_job.id in recovered_ids
    assert push_job.id not in recovered_ids

    # Actual recovery
    recover_res = client.post(
        "/api/notifications/jobs/recover",
        json={"lead_id": lead.id, "dry_run": False},
        headers=admin_headers
    )
    assert recover_res.status_code == 200
    rec_data = recover_res.json()
    assert rec_data["recovered_count"] == 2
    assert rec_data["audit"]["operator"] == "testadmin"

    # Verify database status
    db_session.expire_all()
    ack_refreshed = db_session.query(NotificationJob).filter_by(id=ack_job.id).first()
    owner_refreshed = db_session.query(NotificationJob).filter_by(id=owner_job.id).first()
    push_refreshed = db_session.query(NotificationJob).filter_by(id=push_job.id).first()

    assert ack_refreshed.status == NotificationJobStatus.PENDING.value
    assert owner_refreshed.status == NotificationJobStatus.PENDING.value
    # Push job must remain SKIPPED!
    assert push_refreshed.status == NotificationJobStatus.SKIPPED.value


def test_independent_delivery_and_no_unrelated_resend(client, admin_headers, db_session):
    """
    Never retry a successfully completed email merely because an unrelated notification failed.
    """
    lead = Lead(
        name="Barry Allen",
        business_name="Central City Labs",
        email="barry@cclabs.com",
        phone="+1 555 777 8888",
        business_type="Research",
        service_interest="Software",
        problem="Particle tracking data pipeline.",
        budget="$30,000+"
    )
    db_session.add(lead)
    db_session.commit()
    db_session.refresh(lead)

    # Customer ack already completed successfully
    ack_job = NotificationJob(
        idempotency_key=f"lead_{lead.id}_customer_ack",
        channel="EMAIL",
        event_type="INQUIRY_RECEIVED",
        lead_id=lead.id,
        recipient="barry@cclabs.com",
        subject="Brief received",
        payload={"title": "Thanks Barry"},
        status=NotificationJobStatus.COMPLETED.value,
        completed_at=datetime.now(timezone.utc)
    )
    # Owner email was config blocked
    owner_job = NotificationJob(
        idempotency_key=f"lead_{lead.id}_owner_email",
        channel="EMAIL",
        event_type="NEW_INQUIRY",
        lead_id=lead.id,
        recipient="thesortedclub@gmail.com",
        subject="New Inquiry",
        payload={"title": "New Lead"},
        status=NotificationJobStatus.CONFIG_BLOCKED.value,
        last_error="SMTP_PASSWORD is not set"
    )
    db_session.add_all([ack_job, owner_job])
    db_session.commit()

    # Recover jobs for this lead
    res = client.post("/api/notifications/jobs/recover", json={"lead_id": lead.id}, headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["recovered_count"] == 1
    assert data["jobs"][0]["job_id"] == owner_job.id

    db_session.expire_all()
    ack_check = db_session.query(NotificationJob).filter_by(id=ack_job.id).first()
    assert ack_check.status == NotificationJobStatus.COMPLETED.value


def test_diagnostics_reports_config_blocked_jobs(client, admin_headers, db_session):
    """
    GET /api/notifications/diagnostics must include config_blocked count in queue_summary.
    """
    job = NotificationJob(
        idempotency_key="diag_test_blocked_job",
        channel="EMAIL",
        event_type="NEW_INQUIRY",
        recipient="thesortedclub@gmail.com",
        subject="Blocked diag test",
        payload={},
        status=NotificationJobStatus.CONFIG_BLOCKED.value,
        last_error="SMTP_PASSWORD is not set"
    )
    db_session.add(job)
    db_session.commit()

    res = client.get("/api/notifications/diagnostics", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "config_blocked" in data["queue_summary"]
    assert data["queue_summary"]["config_blocked"] >= 1
