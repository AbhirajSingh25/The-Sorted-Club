import pytest
from unittest.mock import patch, MagicMock
from models import AdminUser, AdminPushSubscription, PushLog, Lead
from auth import hash_password, verify_password

def test_password_hashing():
    raw = "SuperSecretPassword123"
    hashed = hash_password(raw)
    assert hashed.startswith("pbkdf2_sha256$100000$")
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_admin_settings_endpoint(client, admin_headers):
    resp = client.get("/api/admin/settings", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "username" in data
    assert "db_connected" in data
    assert "push_configured" in data
    assert "active_push_subscriptions_count" in data
    assert "email_configured" in data
    # Ensure no secrets leaked
    assert "vapid_private_key" not in data
    assert "password" not in data
    assert "password_hash" not in data

def test_change_username_and_password_flow(client, admin_headers):
    # Change username with wrong password
    bad_resp = client.post("/api/admin/change-username", json={
        "new_username": "newadmin",
        "current_password": "wrongpassword"
    }, headers=admin_headers)
    assert bad_resp.status_code == 401

    # Change username with correct password (conftest uses testadmin / testpassword123)
    good_resp = client.post("/api/admin/change-username", json={
        "new_username": "newadmin",
        "current_password": "testpassword123"
    }, headers=admin_headers)
    assert good_resp.status_code == 200
    assert good_resp.json()["username"] == "newadmin"

    # Verify we can login with new username
    login_resp2 = client.post("/api/admin/login", json={"username": "newadmin", "password": "testpassword123"})
    assert login_resp2.status_code == 200
    token2 = login_resp2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Change password
    pwd_resp = client.post("/api/admin/change-password", json={
        "current_password": "testpassword123",
        "new_password": "BrandNewSecurePassword456!",
        "confirm_password": "BrandNewSecurePassword456!"
    }, headers=headers2)
    assert pwd_resp.status_code == 200

    # Old password fails
    fail_resp = client.post("/api/admin/login", json={"username": "newadmin", "password": "testpassword123"})
    assert fail_resp.status_code == 401

    # New password succeeds
    success_resp = client.post("/api/admin/login", json={"username": "newadmin", "password": "BrandNewSecurePassword456!"})
    assert success_resp.status_code == 200

def test_vapid_public_key(client, admin_headers):
    resp = client.get("/api/notifications/vapid-public-key", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "public_key" in data
    assert "configured" in data

def test_push_subscription_crud_and_test_dispatch(client, admin_headers):
    # Register push subscription
    sub_data = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/test-endpoint-12345",
        "keys": {
            "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A4If_ZqPPn59ksOXsdYwCPEE18LNSTwP0vW0448hdKE=",
            "auth": "tBHItJI5svbpez7KI4CCXg=="
        },
        "device_label": "Safari on iPhone"
    }

    sub_resp = client.post("/api/notifications/push-subscriptions", json=sub_data, headers=admin_headers)
    assert sub_resp.status_code == 201
    assert sub_resp.json()["status"] == "subscribed"

    # Test push trigger with mocked send_web_push in routes.notifications
    with patch("routes.notifications.send_web_push") as mock_push:
        mock_push.return_value = {
            "sent_count": 1,
            "failed_count": 0,
            "deactivated_count": 0,
            "status": "DELIVERED",
            "error": None
        }

        test_resp = client.post("/api/notifications/test-push", headers=admin_headers)
        assert test_resp.status_code == 200
        assert test_resp.json()["status"] == "DELIVERED"
        assert mock_push.called

    # Unsubscribe / Delete
    del_resp = client.delete(f"/api/notifications/push-subscriptions?endpoint={sub_data['endpoint']}", headers=admin_headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "unsubscribed"

def test_lead_creation_triggers_push_notification(client):
    with patch("services.push_service.send_web_push") as mock_push:
        mock_push.return_value = {
            "sent_count": 1,
            "failed_count": 0,
            "deactivated_count": 0,
            "status": "DELIVERED",
            "error": None
        }

        lead_data = {
            "name": "Jane Austen",
            "business_name": "Pemberley Media",
            "email": "jane@pemberleymedia.com",
            "phone": "+91 98765 43210",
            "website": "https://pemberleymedia.com",
            "business_type": "Digital Studio",
            "service_interest": "Website / Build",
            "problem": "We would like to redesign our digital identity and bespoke client portal.",
            "budget": "$10,000 - $25,000",
            "consent": True
        }

        resp = client.post("/api/leads", json=lead_data)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Jane Austen"
        assert mock_push.called
        call_kwargs = mock_push.call_args.kwargs
        assert call_kwargs["title"] == "New website inquiry"
        assert call_kwargs["body"] == "Jane Austen · Website / Build"
        assert "The Sorted Club" not in call_kwargs["title"]
        assert "The Sorted Club" not in call_kwargs["body"]
        assert call_kwargs["url"] == f"/admin/crm?selectedLead={data['id']}"
