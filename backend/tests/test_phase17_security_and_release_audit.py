import os
import pytest
from datetime import datetime, timezone
from models import (
    Lead,
    Client,
    Proposal,
    Project,
    ProjectActivity,
    ProjectTask
)
from auth import (
    create_access_token,
    verify_token,
    validate_production_auth_config
)
from main import validate_production_environment

# ==============================================================================
# 1. AUTHENTICATION & AUTHORIZATION AUDIT TESTS
# ==============================================================================

def test_unauthorized_admin_access_rejected(client):
    """Verify that all admin endpoints return 401 when accessed without valid auth token."""
    protected_urls = [
        "/api/admin/verify",
        "/api/admin/command-center",
        "/api/leads",
        "/api/leads/stats",
        "/api/leads/crm-stats",
        "/api/clients",
        "/api/clients/stats",
        "/api/proposals",
        "/api/contracts",
        "/api/invoices",
        "/api/finance/stats",
        "/api/finance/payment-confirmations",
        "/api/projects",
        "/api/projects/stats",
        "/api/notifications"
    ]
    for url in protected_urls:
        resp = client.get(url)
        assert resp.status_code == 401, f"Expected 401 for unauthorized access to {url}, got {resp.status_code}"
        assert "detail" in resp.json()

def test_forged_and_invalid_tokens_rejected(client):
    """Verify forged, malformed, or tampered tokens are rejected with 401."""
    # 1. Malformed token
    resp = client.get("/api/admin/verify", headers={"Authorization": "Bearer not-a-real-token"})
    assert resp.status_code == 401

    # 2. Tampered signature
    valid_token = create_access_token("testadmin")
    parts = valid_token.split(".")
    tampered_token = f"{parts[0]}.tampered_signature_12345"
    resp = client.get("/api/admin/verify", headers={"Authorization": f"Bearer {tampered_token}"})
    assert resp.status_code == 401

def test_expired_token_handling(client):
    """Verify expired tokens are rejected with 401."""
    expired_token = create_access_token("testadmin", expires_in_seconds=-10)
    with pytest.raises(Exception) as exc_info:
        verify_token(expired_token)
    assert "expired" in str(exc_info.value.detail).lower()

    resp = client.get("/api/admin/verify", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    assert "expired" in resp.json()["detail"].lower()

# ==============================================================================
# 2. IDOR & TOKEN ISOLATION AUDIT TESTS
# ==============================================================================

def test_idor_protection_on_public_documents(client, admin_headers, db_session):
    """Verify that public endpoints only resolve via unguessable cryptographic tokens and not IDs."""
    # Create client & proposal
    lead = Lead(
        name="Alice Walker",
        business_name="Alice Media",
        email="alice@media.com",
        phone="+91 98765 43210",
        business_type="Agency",
        service_interest="Website / Build",
        problem="Need modern corporate site",
        budget="$5,000 - $10,000",
        status="WON"
    )
    db_session.add(lead)
    db_session.commit()

    c_resp = client.post(f"/api/clients/from-lead/{lead.id}", headers=admin_headers)
    assert c_resp.status_code == 201
    client_id = c_resp.json()["id"]

    prop_resp = client.post("/api/proposals", json={
        "client_id": client_id,
        "title": "Corporate Web Development",
        "items": [{"name": "Core Website", "quantity": 1, "unit_price": 5000.0}]
    }, headers=admin_headers)
    assert prop_resp.status_code == 201
    proposal_token = prop_resp.json()["secure_token"]

    # 1. Public resolution with secure token succeeds
    pub_resp = client.get(f"/api/public/proposal/{proposal_token}")
    assert pub_resp.status_code == 200
    assert pub_resp.json()["title"] == "Corporate Web Development"

    # 2. Attempting to access by proposal ID or invalid token returns 404
    fake_token = "12345"
    pub_fail = client.get(f"/api/public/proposal/{fake_token}")
    assert pub_fail.status_code == 404

    # 3. Public response never leaks internal admin secrets or raw DB keys
    data = pub_resp.json()
    assert "password" not in data
    assert "ADMIN_SECRET_KEY" not in str(data)

# ==============================================================================
# 3. API SECURITY & ERROR SHIELDING AUDIT TESTS
# ==============================================================================

def test_security_headers_present(client):
    """Verify security headers are attached to all API responses."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "geolocation=()" in resp.headers.get("Permissions-Policy", "")

def test_request_size_limit(client, admin_headers):
    """Verify payload size limiter rejects oversized bodies."""
    huge_body = {"junk": "x" * (6 * 1024 * 1024)} # 6MB
    headers = {**admin_headers, "content-length": str(6 * 1024 * 1024)}
    resp = client.post("/api/admin/login", json=huge_body, headers=headers)
    assert resp.status_code == 413

# ==============================================================================
# 4. BUSINESS WORKFLOW & ACTIVITY LOGGING INTEGRITY
# ==============================================================================

def test_deliverable_approval_decision_logs_activity(client, admin_headers, db_session):
    """Verify that submit_approval_decision creates and persists a ProjectActivity audit record."""
    # Create client & project
    lead = Lead(
        name="Bob Smith",
        business_name="Smith Robotics",
        email="bob@smithrobotics.com",
        phone="+91 98765 11111",
        business_type="Robotics",
        service_interest="Website / Build",
        problem="Full commercial platform",
        budget="$10,000+",
        status="WON"
    )
    db_session.add(lead)
    db_session.commit()

    c_resp = client.post(f"/api/clients/from-lead/{lead.id}", headers=admin_headers)
    client_id = c_resp.json()["id"]

    p_resp = client.post("/api/projects", json={
        "client_id": client_id,
        "name": "Robotics Portal",
        "service_type": "WEBSITE",
        "priority": "HIGH"
    }, headers=admin_headers)
    project_id = p_resp.json()["id"]

    # Create approval deliverable
    appr_resp = client.post(f"/api/projects/{project_id}/approvals", json={
        "title": "Homepage UI Mockup",
        "item_type": "DESIGN",
        "description": "Figma layout for approval"
    }, headers=admin_headers)
    appr_token = appr_resp.json()["public_token"]

    # Customer submits approval decision
    dec_resp = client.post(f"/api/public/approval/{appr_token}/decision", json={
        "decision": "APPROVED",
        "customer_name": "Bob Smith",
        "customer_email": "bob@smithrobotics.com",
        "comment": "Looks phenomenal, let's proceed to code!"
    })
    assert dec_resp.status_code == 200
    assert dec_resp.json()["status"] == "APPROVED"

    # Verify ProjectActivity was successfully persisted in the database
    activities = db_session.query(ProjectActivity).filter(ProjectActivity.project_id == project_id).all()
    decision_acts = [a for a in activities if "submitted decision 'APPROVED'" in a.description]
    assert len(decision_acts) == 1, "Expected ProjectActivity for approval decision to be persisted in DB"
    assert decision_acts[0].created_by == "Customer"

def test_workflow_state_machine_guardrails(client, admin_headers, db_session):
    """Verify that workflow state transitions are guarded against illegal duplicate or out-of-order actions."""
    # 1. Cannot convert non-WON lead to client
    lead = Lead(
        name="Charlie",
        business_name="Charlie Corp",
        email="charlie@corp.com",
        phone="+91 99999 88888",
        business_type="B2B",
        service_interest="Marketing",
        problem="Growth systems",
        budget="$5,000",
        status="NEW" # Not WON
    )
    db_session.add(lead)
    db_session.commit()

    err_resp = client.post(f"/api/clients/from-lead/{lead.id}", headers=admin_headers)
    assert err_resp.status_code == 400
    assert "WON" in err_resp.json()["detail"]

    # 2. Convert to WON and convert to client
    lead.status = "WON"
    db_session.commit()

    conv_resp = client.post(f"/api/clients/from-lead/{lead.id}", headers=admin_headers)
    assert conv_resp.status_code == 201

    # 3. Duplicate conversion rejected
    dup_resp = client.post(f"/api/clients/from-lead/{lead.id}", headers=admin_headers)
    assert dup_resp.status_code == 400
    assert "already been converted" in dup_resp.json()["detail"]

# ==============================================================================
# 5. PRODUCTION ENVIRONMENT & SECRETS SAFETY TESTS
# ==============================================================================

def test_production_auth_validation_rules(monkeypatch):
    """Verify that validate_production_auth_config rejects default or insecure secrets in production."""
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_SECRET_KEY", "secret")
    monkeypatch.setenv("ADMIN_PASSWORD", "123456")

    with pytest.raises(ValueError) as exc:
        validate_production_auth_config()
    assert "CRITICAL SECURITY CONFIGURATION ERROR" in str(exc.value)

def test_production_environment_validation_rules(monkeypatch):
    """Verify that validate_production_environment rejects SQLite and wildcard CORS in production."""
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_SECRET_KEY", "a" * 32)
    monkeypatch.setenv("ADMIN_PASSWORD", "strong_password_1234")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./test.db")
    monkeypatch.setenv("CORS_ORIGINS", "*")

    with pytest.raises(ValueError) as exc:
        validate_production_environment()
    assert "PostgreSQL" in str(exc.value)
