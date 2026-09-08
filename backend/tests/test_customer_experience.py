from datetime import datetime, timedelta, timezone
import pytest

LEAD_PAYLOAD = {
    "name": "Sarah Connor",
    "business_name": "Cyberdyne Systems Corp",
    "email": "sarah@cyberdyne.com",
    "phone": "+91 91234 56789",
    "business_type": "Robotics & Defense",
    "service_interest": "Custom software",
    "problem": "We need our core infrastructure rebuilt.",
    "budget": "$25,000 - $50,000",
    "source": "Website",
    "priority": "HIGH",
    "estimated_value": 30000.0,
    "consent": True
}

def create_test_client(client, admin_headers):
    """Helper to create a lead, win it, and convert to an official client."""
    lead_res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = lead_res.json()["id"]
    client.patch(f"/api/leads/{lead_id}", json={"status": "WON"}, headers=admin_headers)
    client_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    return client_res.json()

# ==============================================================================
# 1. PUBLIC PROPOSAL TESTS
# ==============================================================================

def test_public_proposal_view_and_state_transition(client, admin_headers):
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    # Create Proposal
    prop_res = client.post("/api/proposals", json={
        "client_id": client_id,
        "title": "Platform Modernization",
        "description": "Full stack web application modernization",
        "currency": "USD",
        "discount": 500.0,
        "tax": 0.0,
        "notes": "50% upfront deposit",
        "items": [
            {"name": "Architecture Design", "quantity": 1, "unit_price": 5000.0},
            {"name": "Frontend Development", "quantity": 1, "unit_price": 10000.0}
        ]
    }, headers=admin_headers)
    assert prop_res.status_code == 201
    prop = prop_res.json()
    token = prop["secure_token"]
    assert token is not None

    # Mark proposal as SENT
    send_res = client.post(f"/api/proposals/{prop['id']}/send", headers=admin_headers)
    assert send_res.json()["status"] == "SENT"

    # Public View Proposal (No auth)
    pub_res = client.get(f"/api/public/proposal/{token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["title"] == "Platform Modernization"
    assert pub_data["total"] == 14500.0  # (15000 - 500)
    assert pub_data["status"] == "VIEWED"  # Automatically transitions SENT -> VIEWED
    assert "lead_id" not in pub_data  # No internal CRM data leaked

def test_public_proposal_acceptance(client, admin_headers):
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    prop_res = client.post("/api/proposals", json={
        "client_id": client_id,
        "title": "Automation Engine",
        "items": [{"name": "AI Workflow", "quantity": 1, "unit_price": 6000.0}]
    }, headers=admin_headers)
    token = prop_res.json()["secure_token"]

    # Accept proposal via public endpoint
    accept_res = client.post(f"/api/public/proposal/{token}/accept", json={
        "accepted_by_name": "Sarah Connor",
        "accepted_by_email": "sarah@cyberdyne.com"
    })
    assert accept_res.status_code == 200
    acc_data = accept_res.json()
    assert acc_data["status"] == "ACCEPTED"
    assert acc_data["accepted_by_name"] == "Sarah Connor"
    assert acc_data["accepted_by_email"] == "sarah@cyberdyne.com"
    assert acc_data["accepted_at"] is not None

def test_public_proposal_rejection(client, admin_headers):
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    prop_res = client.post("/api/proposals", json={
        "client_id": client_id,
        "title": "Ad Campaign",
        "items": [{"name": "Content package", "quantity": 1, "unit_price": 2000.0}]
    }, headers=admin_headers)
    token = prop_res.json()["secure_token"]

    # Reject proposal via public endpoint
    rej_res = client.post(f"/api/public/proposal/{token}/reject", json={
        "reason": "Scope needs to be shifted to Q3"
    })
    assert rej_res.status_code == 200
    rej_data = rej_res.json()
    assert rej_data["status"] == "REJECTED"

# ==============================================================================
# 2. PUBLIC CONTRACT TESTS
# ==============================================================================

def test_public_contract_view_and_acceptance(client, admin_headers):
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    # 1. Create Proposal and accept it
    prop_res = client.post("/api/proposals", json={
        "client_id": client_id,
        "title": "Software Delivery",
        "items": [{"name": "Web Suite", "quantity": 1, "unit_price": 8000.0}]
    }, headers=admin_headers)
    prop = prop_res.json()
    prop_id = prop["id"]
    prop_token = prop["secure_token"]

    client.post(f"/api/public/proposal/{prop_token}/accept", json={
        "accepted_by_name": "Sarah Connor",
        "accepted_by_email": "sarah@cyberdyne.com"
    })

    # 2. Generate Contract from Accepted Proposal
    contract_res = client.post(f"/api/contracts/from-proposal/{prop_id}", headers=admin_headers)
    assert contract_res.status_code == 201
    contract = contract_res.json()
    token = contract["secure_token"]
    assert token is not None

    # 3. Public Contract View
    pub_res = client.get(f"/api/public/contract/{token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["contract_number"] == contract["contract_number"]
    assert pub_data["client_business_name"] == "Cyberdyne Systems Corp"
    assert pub_data["status"] == "DRAFT"

    # 4. Public Contract Acceptance / Acknowledgement
    acc_res = client.post(f"/api/public/contract/{token}/accept", json={
        "accepted_by_name": "Sarah Connor",
        "accepted_by_email": "sarah@cyberdyne.com"
    })
    assert acc_res.status_code == 200
    acc_data = acc_res.json()
    assert acc_data["status"] == "ACCEPTED"
    assert acc_data["accepted_by_name"] == "Sarah Connor"
    assert acc_data["accepted_at"] is not None

# ==============================================================================
# 3. PUBLIC INVOICE & PAYMENT INSTRUCTIONS TESTS
# ==============================================================================

def test_public_invoice_view_and_instructions(client, admin_headers, monkeypatch):
    monkeypatch.setenv("UPI_ID", "thesortedclub@okaxis")
    monkeypatch.setenv("BANK_ACCOUNT_NAME", "The Sorted Club Private Limited")
    monkeypatch.setenv("BANK_NAME", "HDFC Bank")
    monkeypatch.setenv("BANK_ACCOUNT_NUMBER", "50200012345678")
    monkeypatch.setenv("BANK_IFSC", "HDFC0001234")
    monkeypatch.setenv("BANK_BRANCH", "Indiranagar, Bangalore")

    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    # Create Invoice
    inv_res = client.post("/api/invoices", json={
        "client_id": client_id,
        "currency": "USD",
        "discount": 0.0,
        "tax": 0.0,
        "notes": "Net 15 payment terms",
        "items": [
            {"name": "Milestone 1 Kickoff", "quantity": 1, "unit_price": 5000.0}
        ]
    }, headers=admin_headers)
    assert inv_res.status_code == 201
    invoice = inv_res.json()
    token = invoice["secure_token"]
    assert token is not None

    # Public Invoice View (No auth)
    pub_res = client.get(f"/api/public/invoice/{token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["invoice_number"] == invoice["invoice_number"]
    assert pub_data["total"] == 5000.0
    assert pub_data["amount_due"] == 5000.0
    assert pub_data["status"] == "DRAFT"
    assert pub_data["has_pending_confirmation"] == False

    # Check Payment Instructions from env
    pi = pub_data["payment_instructions"]
    assert pi["upi_id"] == "thesortedclub@okaxis"
    assert pi["bank_name"] == "HDFC Bank"
    assert pi["account_number"] == "50200012345678"
    assert pi["ifsc"] == "HDFC0001234"

# ==============================================================================
# 4. PAYMENT CONFIRMATION & ADMIN VERIFICATION FLOW
# ==============================================================================

def test_payment_confirmation_and_admin_verification_flow(client, admin_headers):
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    # 1. Create Invoice
    inv_res = client.post("/api/invoices", json={
        "client_id": client_id,
        "currency": "USD",
        "items": [{"name": "Sprint 1", "quantity": 1, "unit_price": 4000.0}]
    }, headers=admin_headers)
    invoice = inv_res.json()
    token = invoice["secure_token"]

    # 2. Customer submits "I've made the payment" verification claim
    confirm_payload = {
        "payer_name": "Sarah Connor",
        "payer_email": "sarah@cyberdyne.com",
        "amount": 4000.0,
        "payment_method": "BANK_TRANSFER",
        "reference": "HDFC-UTR-891023812",
        "notes": "Transferred via NEFT"
    }
    claim_res = client.post(f"/api/public/invoice/{token}/confirm-payment", json=confirm_payload)
    assert claim_res.status_code == 201
    claim_data = claim_res.json()
    assert claim_data["status"] == "PENDING_VERIFICATION"
    assert claim_data["reference"] == "HDFC-UTR-891023812"

    # 3. Check that invoice is NOT yet marked as paid
    pub_res = client.get(f"/api/public/invoice/{token}")
    assert pub_res.json()["status"] == "DRAFT"
    assert pub_res.json()["amount_due"] == 4000.0
    assert pub_res.json()["has_pending_confirmation"] == True

    # 4. Admin lists payment confirmations
    list_res = client.get("/api/finance/payment-confirmations", headers=admin_headers)
    assert list_res.status_code == 200
    confirmations = list_res.json()
    assert len(confirmations) >= 1
    target_conf = next(conf for conf in confirmations if conf["reference"] == "HDFC-UTR-891023812")
    assert target_conf["status"] == "PENDING_VERIFICATION"
    assert target_conf["amount"] == 4000.0
    assert target_conf["client_business_name"] == "Cyberdyne Systems Corp"

    # 5. Admin CONFIRMS the payment verification
    conf_id = target_conf["id"]
    verify_res = client.post(f"/api/finance/payment-confirmations/{conf_id}/confirm", headers=admin_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "CONFIRMED"

    # 6. Verify invoice status has been updated to PAID and amount_due is 0
    inv_check = client.get(f"/api/invoices/{invoice['id']}", headers=admin_headers)
    assert inv_check.json()["status"] == "PAID"
    assert inv_check.json()["amount_paid"] == 4000.0
    assert inv_check.json()["amount_due"] == 0.0

    # 7. Verify Client Onboarding Checklist item is marked complete
    client_check = client.get(f"/api/clients/{client_id}", headers=admin_headers)
    checklist = client_check.json().get("onboarding_items", [])
    pay_item = next((it for it in checklist if it["item_key"] == "initial_payment"), None)
    if pay_item:
        assert pay_item["completed"] == True

def test_payment_confirmation_rejection(client, admin_headers):
    c = create_test_client(client, admin_headers)
    client_id = c["id"]

    # 1. Create Invoice
    inv_res = client.post("/api/invoices", json={
        "client_id": client_id,
        "items": [{"name": "Ad Spend Deposit", "quantity": 1, "unit_price": 3000.0}]
    }, headers=admin_headers)
    invoice = inv_res.json()
    token = invoice["secure_token"]

    # 2. Customer submits claim
    client.post(f"/api/public/invoice/{token}/confirm-payment", json={
        "payer_name": "Sarah Connor",
        "payer_email": "sarah@cyberdyne.com",
        "amount": 3000.0,
        "payment_method": "UPI",
        "reference": "UPI-INVALID-REF-999"
    })

    # 3. Admin rejects claim with reason
    confs = client.get("/api/finance/payment-confirmations?status=PENDING_VERIFICATION", headers=admin_headers).json()
    target_conf = confs[0]
    rej_res = client.post(f"/api/finance/payment-confirmations/{target_conf['id']}/reject", json={
        "reason": "Transaction reference not found in bank account statement."
    }, headers=admin_headers)
    assert rej_res.status_code == 200
    rej_data = rej_res.json()
    assert rej_data["status"] == "REJECTED"
    assert rej_data["rejection_reason"] == "Transaction reference not found in bank account statement."

    # 4. Invoice remains unpaid
    inv_check = client.get(f"/api/invoices/{invoice['id']}", headers=admin_headers)
    assert inv_check.json()["status"] == "DRAFT"
    assert inv_check.json()["amount_paid"] == 0.0

# ==============================================================================
# 5. SECURITY & INVALID TOKEN TESTS
# ==============================================================================

def test_invalid_tokens_return_404(client):
    assert client.get("/api/public/proposal/invalid-token-12345").status_code == 404
    assert client.get("/api/public/contract/invalid-token-12345").status_code == 404
    assert client.get("/api/public/invoice/invalid-token-12345").status_code == 404

def test_unauthenticated_admin_finance_routes_blocked(client):
    assert client.get("/api/finance/payment-confirmations").status_code == 401
    assert client.post("/api/finance/payment-confirmations/1/confirm").status_code == 401
    assert client.post("/api/finance/payment-confirmations/1/reject", json={"reason": "test"}).status_code == 401
