from datetime import datetime, timezone, timedelta
import pytest

LEAD_PAYLOAD = {
    "name": "Marcus Vance",
    "business_name": "Vance Industrial Supply",
    "email": "marcus@vanceindustrial.com",
    "phone": "+91 91234 56789",
    "business_type": "Manufacturing & Distribution",
    "service_interest": "Custom software",
    "problem": "We need an integrated B2B procurement portal with ERP synchronization.",
    "budget": "$50,000 - $100,000",
    "source": "Website",
    "priority": "HIGH",
    "estimated_value": 60000.0,
    "consent": True
}

def create_test_client(client, admin_headers):
    """Helper to create a lead, win it, and convert to an official client."""
    lead_res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = lead_res.json()["id"]
    client.patch(f"/api/leads/{lead_id}", json={"status": "WON"}, headers=admin_headers)
    client_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    return client_res.json()

def test_create_proposal_and_calculate_totals(client, admin_headers):
    """Verify proposal creation, server-side line item calculations, and secure token generation."""
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    proposal_payload = {
        "client_id": client_id,
        "title": "B2B Procurement Platform Architecture",
        "description": "Comprehensive design, API backend, and web portal.",
        "discount": 500.0,
        "tax": 300.0,
        "currency": "USD",
        "valid_until": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "notes": "Includes 3 months of post-launch SLA support.",
        "items": [
            {"name": "Frontend Web Application", "quantity": 1, "unit_price": 5000.0},
            {"name": "Backend API & Database", "quantity": 1, "unit_price": 7000.0},
            {"name": "ERP Integration Module", "quantity": 2, "unit_price": 1500.0}
        ]
    }

    res = client.post("/api/proposals", json=proposal_payload, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()

    assert data["proposal_number"].startswith("SC-P-")
    assert data["status"] == "DRAFT"
    assert "secure_token" in data
    # Subtotal: 5000 + 7000 + 3000 = 15000
    assert data["subtotal"] == 15000.0
    assert data["discount"] == 500.0
    assert data["tax"] == 300.0
    # Total: 15000 - 500 + 300 = 14800
    assert data["total"] == 14800.0
    assert len(data["items"]) == 3

def test_send_and_duplicate_proposal(client, admin_headers):
    """Verify sending a proposal and duplicating it into a new draft."""
    c = create_test_client(client, admin_headers)
    p_res = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Original Scope Proposal",
        "items": [{"name": "Item 1", "quantity": 1, "unit_price": 2000.0}]
    }, headers=admin_headers)
    p_id = p_res.json()["id"]

    # Send proposal
    send_res = client.post(f"/api/proposals/{p_id}/send", headers=admin_headers)
    assert send_res.status_code == 200
    assert send_res.json()["status"] == "SENT"
    assert send_res.json()["sent_at"] is not None

    # Duplicate proposal
    dup_res = client.post(f"/api/proposals/{p_id}/duplicate", headers=admin_headers)
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["id"] != p_id
    assert dup_data["status"] == "DRAFT"
    assert "Copy of" in dup_data["title"]
    assert dup_data["total"] == 2000.0

def test_public_proposal_view_and_online_acceptance(client, admin_headers):
    """Verify public proposal view by secure token (no auth) and online acceptance."""
    c = create_test_client(client, admin_headers)
    p_res = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Growth Infrastructure Package",
        "items": [{"name": "Growth System", "quantity": 1, "unit_price": 8000.0}]
    }, headers=admin_headers)
    p_data = p_res.json()
    token = p_data["secure_token"]

    # Public View (no auth header)
    pub_res = client.get(f"/api/public/proposal/{token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["title"] == "Growth Infrastructure Package"
    assert pub_data["total"] == 8000.0
    assert pub_data["client_business_name"] == "Vance Industrial Supply"
    assert pub_data["is_expired"] is False

    # Public Acceptance
    accept_res = client.post(
        f"/api/public/proposal/{token}/accept",
        json={"accepted_by_name": "Marcus Vance", "accepted_by_email": "marcus@vanceindustrial.com"}
    )
    assert accept_res.status_code == 200
    acc_data = accept_res.json()
    assert acc_data["status"] == "ACCEPTED"
    assert acc_data["accepted_by_name"] == "Marcus Vance"
    assert acc_data["accepted_at"] is not None

def test_public_proposal_rejection(client, admin_headers):
    """Verify declining a proposal online."""
    c = create_test_client(client, admin_headers)
    p_res = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Custom Mobile App",
        "items": [{"name": "App build", "quantity": 1, "unit_price": 12000.0}]
    }, headers=admin_headers)
    token = p_res.json()["secure_token"]

    rej_res = client.post(
        f"/api/public/proposal/{token}/reject",
        json={"reason": "Project budget postponed to Q4."}
    )
    assert rej_res.status_code == 200
    assert rej_res.json()["status"] == "REJECTED"

def test_public_proposal_invalid_and_expired_token(client, admin_headers):
    """Verify error handling for invalid tokens and expired proposals."""
    # Invalid token
    inv_res = client.get("/api/public/proposal/non_existent_token_12345")
    assert inv_res.status_code == 404

    # Expired proposal
    c = create_test_client(client, admin_headers)
    expired_date = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    exp_res = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Expired Proposal",
        "valid_until": expired_date,
        "items": [{"name": "Service", "quantity": 1, "unit_price": 1000.0}]
    }, headers=admin_headers)
    exp_token = exp_res.json()["secure_token"]

    pub_exp = client.get(f"/api/public/proposal/{exp_token}")
    assert pub_exp.status_code == 200
    assert pub_exp.json()["is_expired"] is True

    # Attempt to accept expired proposal
    acc_exp = client.post(
        f"/api/public/proposal/{exp_token}/accept",
        json={"accepted_by_name": "Marcus", "accepted_by_email": "marcus@vanceindustrial.com"}
    )
    assert acc_exp.status_code == 400
    assert "expired" in acc_exp.json()["detail"].lower()

def test_generate_contract_from_accepted_proposal(client, admin_headers):
    """Verify generating a formal contract from an ACCEPTED proposal."""
    c = create_test_client(client, admin_headers)
    p_res = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Enterprise Cloud Setup",
        "items": [{"name": "Cloud Infra", "quantity": 1, "unit_price": 20000.0}]
    }, headers=admin_headers)
    p_id = p_res.json()["id"]

    # Mark proposal ACCEPTED
    client.post(f"/api/proposals/{p_id}/accept", headers=admin_headers)

    # Generate contract
    contract_res = client.post(f"/api/contracts/from-proposal/{p_id}", headers=admin_headers)
    assert contract_res.status_code == 201
    contract_data = contract_res.json()

    assert contract_data["contract_number"].startswith("SC-C-")
    assert contract_data["status"] == "DRAFT"
    assert "Enterprise Cloud Setup" in contract_data["title"]
    assert "MASTER SERVICES AGREEMENT" in contract_data["content"]
    assert "DISCLAIMER" in contract_data["content"]

def test_reject_contract_generation_from_non_accepted_proposal(client, admin_headers):
    """Verify generating a contract from a DRAFT or non-accepted proposal fails."""
    c = create_test_client(client, admin_headers)
    p_res = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Draft Only Proposal",
        "items": [{"name": "Service", "quantity": 1, "unit_price": 5000.0}]
    }, headers=admin_headers)
    p_id = p_res.json()["id"]

    # Attempt contract creation while proposal is in DRAFT
    contract_res = client.post(f"/api/contracts/from-proposal/{p_id}", headers=admin_headers)
    assert contract_res.status_code == 400
    assert "ACCEPTED" in contract_res.json()["detail"]

def test_create_invoice_and_proposal_conversion(client, admin_headers):
    """Verify invoice creation directly and from proposal."""
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    # Direct invoice creation
    inv_payload = {
        "client_id": client_id,
        "discount": 200.0,
        "tax": 100.0,
        "currency": "USD",
        "due_date": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
        "notes": "Net 15 payment terms.",
        "items": [
            {"name": "Sprint 1 Development", "quantity": 1, "unit_price": 6000.0}
        ]
    }
    inv_res = client.post("/api/invoices", json=inv_payload, headers=admin_headers)
    assert inv_res.status_code == 201
    inv_data = inv_res.json()
    assert inv_data["invoice_number"].startswith("SC-INV-")
    assert inv_data["status"] == "DRAFT"
    # Subtotal 6000 - 200 + 100 = 5900
    assert inv_data["total"] == 5900.0
    assert inv_data["amount_paid"] == 0.0
    assert inv_data["amount_due"] == 5900.0

def test_record_partial_and_full_payment(client, admin_headers):
    """Verify recording partial payments and auto-transition to PAID status."""
    c = create_test_client(client, admin_headers)
    inv_res = client.post("/api/invoices", json={
        "client_id": c["id"],
        "items": [{"name": "Milestone Deliverable", "quantity": 1, "unit_price": 10000.0}]
    }, headers=admin_headers)
    inv_id = inv_res.json()["id"]

    # 1. Partial Payment of $4,000
    pay1_res = client.post(
        f"/api/invoices/{inv_id}/payments",
        json={"amount": 4000.0, "payment_method": "BANK_TRANSFER", "reference": "WIRE-00124"},
        headers=admin_headers
    )
    assert pay1_res.status_code == 201
    inv_after_pay1 = pay1_res.json()
    assert inv_after_pay1["amount_paid"] == 4000.0
    assert inv_after_pay1["amount_due"] == 6000.0
    assert inv_after_pay1["status"] == "PARTIALLY_PAID"

    # 2. Final Payment of $6,000
    pay2_res = client.post(
        f"/api/invoices/{inv_id}/payments",
        json={"amount": 6000.0, "payment_method": "UPI", "reference": "UPI-987654"},
        headers=admin_headers
    )
    assert pay2_res.status_code == 201
    inv_after_pay2 = pay2_res.json()
    assert inv_after_pay2["amount_paid"] == 10000.0
    assert inv_after_pay2["amount_due"] == 0.0
    assert inv_after_pay2["status"] == "PAID"
    assert inv_after_pay2["paid_at"] is not None

def test_overdue_invoice_filtering(client, admin_headers):
    """Verify identifying overdue invoices based on past due dates."""
    c = create_test_client(client, admin_headers)
    past_due = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()

    client.post("/api/invoices", json={
        "client_id": c["id"],
        "due_date": past_due,
        "items": [{"name": "Overdue Task", "quantity": 1, "unit_price": 3000.0}]
    }, headers=admin_headers)

    overdue_res = client.get("/api/invoices?status=OVERDUE", headers=admin_headers)
    assert overdue_res.status_code == 200
    overdue_list = overdue_res.json()
    assert len(overdue_list) >= 1
    assert any(inv["is_overdue"] is True for inv in overdue_list)

def test_finance_stats_calculation(client, admin_headers):
    """Verify aggregate commercial metrics calculation in /api/finance/stats."""
    c = create_test_client(client, admin_headers)

    # 1. Invoice with payment
    inv = client.post("/api/invoices", json={
        "client_id": c["id"],
        "items": [{"name": "Consulting", "quantity": 1, "unit_price": 5000.0}]
    }, headers=admin_headers).json()

    client.post(
        f"/api/invoices/{inv['id']}/payments",
        json={"amount": 2000.0, "payment_method": "CARD"},
        headers=admin_headers
    )

    # 2. Accepted Proposal
    prop = client.post("/api/proposals", json={
        "client_id": c["id"],
        "title": "Accepted Package",
        "items": [{"name": "Package", "quantity": 1, "unit_price": 10000.0}]
    }, headers=admin_headers).json()
    client.post(f"/api/proposals/{prop['id']}/accept", headers=admin_headers)

    stats_res = client.get("/api/finance/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()

    assert stats["total_invoiced"] >= 5000.0
    assert stats["total_paid"] >= 2000.0
    assert stats["total_outstanding"] >= 3000.0
    assert stats["proposals_accepted_count"] >= 1

def test_unauthorized_commercial_endpoints(client):
    """Verify all protected commercial endpoints reject requests without admin token."""
    endpoints = [
        ("POST", "/api/proposals"),
        ("GET", "/api/proposals"),
        ("GET", "/api/proposals/1"),
        ("POST", "/api/contracts/from-proposal/1"),
        ("GET", "/api/contracts"),
        ("POST", "/api/invoices"),
        ("GET", "/api/invoices"),
        ("POST", "/api/invoices/1/payments"),
        ("GET", "/api/finance/stats")
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={})
        assert res.status_code == 401, f"{method} {path} should return 401"
