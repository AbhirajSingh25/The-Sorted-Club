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
    sanitize_error,
    BACKOFF_DELAYS
)

def test_lead_submission_is_non_blocking_and_enqueues_outbox(client, admin_headers):
    """
    Submitting a lead must execute swiftly without waiting for synchronous network SMTP,
    returning HTTP 201 with queued status and persisting outbox jobs.
    """
    start_time = time.perf_counter()
    res = client.post("/api/leads", json={
        "name": "David Thorne",
        "business_name": "Thorne Logistics",
        "email": "david@thornelogistics.com",
        "phone": "+1 555 123 4567",
        "business_type": "Logistics & Supply Chain",
        "service_interest": "Custom software",
        "problem": "We need an integrated order tracking and route dispatch system.",
        "budget": "$15,000 - $50,000",
        "consent": True
    })
    elapsed = time.perf_counter() - start_time

    assert res.status_code == 201
    # Response must be fast (well under 500ms even with SQLite in test)
    assert elapsed < 1.0, f"Submission took {elapsed:.3f}s; expected < 1s"
    
    data = res.json()
    assert data["name"] == "David Thorne"
    assert data["notification_status"] == "QUEUED"
    lead_id = data["id"]

    # Verify admin in-app notification exists
    notif_res = client.get("/api/notifications", headers=admin_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()["notifications"]
    inquiry_notif = next((n for n in notifs if f"#{lead_id}" in n["title"] or "Thorne Logistics" in n["title"]), None)
    assert inquiry_notif is not None

    # Verify durable outbox jobs were queued
    jobs_res = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers)
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs) == 3 # customer ack, owner email, web push
    
    channels = {j["channel"] for j in jobs}
    assert NotificationChannel.EMAIL.value in channels
    assert NotificationChannel.PUSH.value in channels

    # Run worker to process all pending jobs
    worker = get_notification_worker()
    processed_count = worker.process_all_pending()
    assert processed_count >= 3

    # Check that jobs transitioned to COMPLETED or SKIPPED (skipped in test mode without SMTP mock)
    jobs_after = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    for job in jobs_after:
        assert job["status"] in (NotificationJobStatus.COMPLETED.value, NotificationJobStatus.SKIPPED.value)


def test_idempotency_prevents_duplicate_jobs(client, admin_headers):
    """
    Retrying or re-enqueueing for the same lead must not create duplicate jobs.
    """
    lead_data = {
        "name": "Alice Springs",
        "business_name": "Springs Café",
        "email": "alice@springscafe.com",
        "phone": "+91 91234 56789",
        "business_type": "Restaurants and Cafés",
        "service_interest": "Website / Build",
        "problem": "Online ordering menu with QR code integration.",
        "budget": "INR 25,000 - 50,000",
        "consent": True
    }
    res = client.post("/api/leads", json=lead_data)
    assert res.status_code == 201
    lead_id = res.json()["id"]

    jobs1 = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    assert len(jobs1) == 3

    # Directly re-call enqueue_inquiry_notifications with the same lead object
    from services.notification_service import enqueue_inquiry_notifications
    from database import SessionLocal
    db = SessionLocal()
    try:
        lead_obj = db.query(Lead).filter_by(id=lead_id).first()
        res_dup = enqueue_inquiry_notifications(db, lead_obj)
        db.commit()
    finally:
        db.close()

    assert res_dup["status"] == "QUEUED"
    jobs2 = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    # Number of jobs must remain 3 due to idempotency keys
    assert len(jobs2) == 3


def test_transient_failure_backoff_and_retry(client, admin_headers):
    """
    Transient failures (e.g. connection timeout) must increment attempts, compute next_retry_at,
    and remain in RETRY/PENDING status without crashing.
    """
    res = client.post("/api/leads", json={
        "name": "Marcus Vance",
        "business_name": "Vance Corp",
        "email": "marcus@vancecorp.com",
        "phone": "+1 555 987 6543",
        "business_type": "Agency & Consulting",
        "service_interest": "Marketing / Growth",
        "problem": "B2B performance funnel and lead qualification.",
        "budget": "$10,000+",
        "consent": True
    })
    assert res.status_code == 201
    lead_id = res.json()["id"]

    # Mock SMTP to simulate a transient network timeout
    with patch("smtplib.SMTP") as mock_smtp, \
         patch("services.notification_service._allow_test_smtp_mock", True):
        mock_smtp.side_effect = TimeoutError("Connection to smtp.gmail.com timed out")
        
        # Enable email notifications in config temporarily
        with patch.dict("os.environ", {"EMAIL_NOTIFICATIONS_ENABLED": "true", "SMTP_PASSWORD": "app_password_mock"}):
            worker = get_notification_worker()
            # Process jobs - simulated failure
            worker.process_all_pending()

    jobs = client.get(f"/api/notifications/jobs?lead_id={lead_id}", headers=admin_headers).json()
    email_jobs = [j for j in jobs if j["channel"] == "EMAIL"]
    for ej in email_jobs:
        # Should have recorded attempt and scheduled next retry
        assert ej["attempts"] >= 1
        assert ej["status"] in (NotificationJobStatus.PENDING.value, NotificationJobStatus.FAILED.value)
        assert ej["last_error"] is not None
        assert ej["next_retry_at"] is not None


def test_permanent_error_detection():
    """
    Permanent errors such as invalid syntax or mailbox not found must not be retried endlessly.
    """
    assert is_permanent_email_error("550 5.1.1 User unknown") is True
    assert is_permanent_email_error("Invalid email address syntax") is True
    assert is_permanent_email_error("Recipient address rejected: Access denied") is True
    assert is_permanent_email_error("Connection timed out") is False
    assert is_permanent_email_error("Temporary server error 421") is False


def test_credential_sanitization():
    """
    Sensitive SMTP passwords must never appear in error strings or database records.
    """
    secret = "mypassword12345"
    err = f"SMTPAuthenticationError: (535, '5.7.8 Username and Password not accepted with password {secret}')"
    clean = sanitize_error(err, secret)
    assert secret not in clean
    assert "********" in clean


def test_admin_diagnostics_endpoint(client, admin_headers):
    """
    GET /api/notifications/diagnostics must return safe operational telemetry without leaking credentials.
    """
    res = client.get("/api/notifications/diagnostics", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "app_env" in data
    assert "smtp_host" in data
    assert "smtp_port" in data
    assert "smtp_password_configured" in data
    # Password itself must NEVER be exposed
    assert "password" not in data
    assert "smtp_password" not in data
    assert "queue_summary" in data
