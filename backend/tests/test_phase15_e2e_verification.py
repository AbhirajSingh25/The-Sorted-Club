import pytest
from datetime import datetime, timezone

def test_phase15_complete_end_to_end_business_flow(client, admin_headers, monkeypatch):
    """
    Phase 15 Comprehensive Local End-to-End Business Flow Test:
    1. Website inquiry submission (POST /api/leads)
    2. Inquiry email notification & admin notification recording
    3. Lead appearing in original clean Inquiry Dashboard
    4. Lead qualification and status updates (QUALIFIED -> WON)
    5. Proposal creation and sending
    6. Customer online proposal approval (tokenized public route)
    7. Invoice creation with 50/50 installment schedule from approved proposal
    8. Customer payment claim submission (tokenized public route)
    9. Admin payment verification
    10. Project activation guard & lifecycle flow (IN_PROGRESS with 36 tasks and 7 milestones)
    11. Verification of customer transactional emails & business notifications
    """
    # 1. Website Inquiry Submission
    inquiry_payload = {
        "name": "Ananya Sharma",
        "business_name": "Sharma Retail & Brands",
        "email": "ananya@sharmaretail.test",
        "phone": "+91 91234 56789",
        "website": "https://sharmaretail.test",
        "business_type": "E-Commerce & Retail",
        "service_interest": "Website / Build",
        "problem": "Replatforming legacy store to high-performance headless architecture.",
        "budget": "INR 5L - 10L",
        "consent": True,
        "source": "Website",
        "utm_source": "google_search",
        "utm_campaign": "brand_direct"
    }
    create_res = client.post("/api/leads", json=inquiry_payload)
    assert create_res.status_code == 201
    lead = create_res.json()
    lead_id = lead["id"]
    assert lead["status"] == "NEW"
    assert lead["business_name"] == "Sharma Retail & Brands"

    # 2. Inquiry Notifications & Email Logs
    notifs_res = client.get("/api/notifications", headers=admin_headers)
    assert notifs_res.status_code == 200
    notif_list = notifs_res.json()["notifications"]
    assert any(n["type"] == "NEW_INQUIRY" and n["entity_id"] == lead_id for n in notif_list)

    email_logs_res = client.get("/api/notifications/email-logs", headers=admin_headers)
    assert email_logs_res.status_code == 200
    email_logs = email_logs_res.json()
    assert any(log["event_type"] in ("NEW_INQUIRY", "CUSTOMER_INQUIRY_RECEIVED") for log in email_logs)

    # 3. Lead appearing in Inquiry Dashboard
    inquiries_res = client.get("/api/leads?status=ALL", headers=admin_headers)
    assert inquiries_res.status_code == 200
    leads_list = inquiries_res.json()
    assert any(l["id"] == lead_id for l in leads_list)

    stats_res = client.get("/api/leads/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total"] >= 1

    # 4. Lead Qualification and Status Updates
    qual_res = client.patch(f"/api/leads/{lead_id}", json={
        "status": "QUALIFIED",
        "priority": "HIGH",
        "estimated_value": 600000.0,
        "decision_maker": "Yes - Founder",
        "budget_fit": "Strong",
        "timeline": "3-4 Weeks",
        "qualification_notes": "Immediate project start desired."
    }, headers=admin_headers)
    assert qual_res.status_code == 200
    assert qual_res.json()["status"] == "QUALIFIED"
    assert qual_res.json()["estimated_value"] == 600000.0

    won_res = client.patch(f"/api/leads/{lead_id}", json={
        "status": "WON",
        "notes": "Contract agreement reached."
    }, headers=admin_headers)
    assert won_res.status_code == 200
    assert won_res.json()["status"] == "WON"

    # 5. Convert to Client & Create/Send Proposal
    convert_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert convert_res.status_code == 201
    client_obj = convert_res.json()
    client_id = client_obj["id"]

    proposal_payload = {
        "client_id": client_id,
        "lead_id": lead_id,
        "title": "Headless E-Commerce Platform Build",
        "description": "Custom Next.js & FastAPI headless retail store.",
        "currency": "INR",
        "discount": 0.0,
        "tax": 0.0,
        "items": [
            {
                "name": "Design & UI Architecture",
                "description": "Design system & prototyping",
                "quantity": 1,
                "unit_price": 200000.0,
                "order_index": 0
            },
            {
                "name": "Engineering & Integrations",
                "description": "Storefront, payments, and inventory sync",
                "quantity": 1,
                "unit_price": 400000.0,
                "order_index": 1
            }
        ],
        "notes": "50% upfront deposit, 50% upon final acceptance.",
        "terms": "The Sorted Club standard engagement terms."
    }
    prop_res = client.post("/api/proposals", json=proposal_payload, headers=admin_headers)
    assert prop_res.status_code == 201
    prop = prop_res.json()
    proposal_id = prop["id"]
    prop_token = prop["secure_token"]
    assert prop["total"] == 600000.0

    send_prop_res = client.post(f"/api/proposals/{proposal_id}/send", headers=admin_headers)
    assert send_prop_res.status_code == 200

    # 6. Customer Proposal Approval Online
    view_prop_res = client.get(f"/api/public/proposal/{prop_token}")
    assert view_prop_res.status_code == 200

    accept_prop_res = client.post(f"/api/public/proposal/{prop_token}/accept", json={
        "accepted_by_name": "Ananya Sharma",
        "accepted_by_email": "ananya@sharmaretail.test"
    })
    assert accept_prop_res.status_code == 200
    assert accept_prop_res.json()["status"] == "ACCEPTED"

    # 7. Invoice Creation with 50/50 Installment Schedule
    inv_res = client.post(f"/api/invoices/from-proposal/{proposal_id}", headers=admin_headers)
    assert inv_res.status_code == 201
    invoice = inv_res.json()
    invoice_id = invoice["id"]
    invoice_token = invoice["secure_token"]
    assert len(invoice["installments"]) == 2
    assert invoice["installments"][0]["amount"] == 300000.0
    assert invoice["installments"][1]["amount"] == 300000.0

    send_inv_res = client.post(f"/api/invoices/{invoice_id}/send", headers=admin_headers)
    assert send_inv_res.status_code == 200

    # 8. Customer Payment Claim Submission
    pub_inv_res = client.get(f"/api/public/invoice/{invoice_token}")
    assert pub_inv_res.status_code == 200

    claim_res = client.post(f"/api/public/invoice/{invoice_token}/confirm-payment", json={
        "amount": 300000.0,
        "payment_method": "BANK_TRANSFER",
        "reference": "ICICI-IMPS-88776655",
        "payer_name": "Ananya Sharma",
        "payer_email": "ananya@sharmaretail.test",
        "notes": "50% advance payment transferred via IMPS."
    })
    assert claim_res.status_code == 201
    claim = claim_res.json()
    assert claim["status"] == "PENDING_VERIFICATION"

    # 9. Admin Payment Verification
    verifs_res = client.get("/api/finance/payment-confirmations?status=PENDING_VERIFICATION", headers=admin_headers)
    assert verifs_res.status_code == 200
    confirmations = verifs_res.json()
    matching_conf = next(c for c in confirmations if c["invoice_id"] == invoice_id)

    verify_res = client.post(f"/api/finance/payment-confirmations/{matching_conf['id']}/confirm", headers=admin_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "CONFIRMED"

    updated_inv = client.get(f"/api/invoices/{invoice_id}", headers=admin_headers).json()
    assert updated_inv["status"] == "PARTIALLY_PAID"
    assert updated_inv["amount_paid"] == 300000.0
    assert updated_inv["amount_due"] == 300000.0
    assert updated_inv["installments"][0]["status"] == "PAID"
    assert updated_inv["installments"][1]["status"] == "PENDING"

    # 10. Project Activation after Payment
    proj_res = client.post("/api/projects", json={
        "client_id": client_id,
        "name": "Sharma Retail Platform Build",
        "description": "Headless e-commerce build",
        "service_type": "WEBSITE",
        "priority": "HIGH",
        "template_type": "WEBSITE",
        "invoice_id": invoice_id,
        "proposal_id": proposal_id
    }, headers=admin_headers)
    assert proj_res.status_code == 201
    project = proj_res.json()
    project_id = project["id"]
    assert project["total_tasks_count"] == 36
    assert len(project["milestones"]) == 7

    act_res = client.patch(f"/api/projects/{project_id}", json={"status": "IN_PROGRESS"}, headers=admin_headers)
    assert act_res.status_code == 200
    assert act_res.json()["status"] == "IN_PROGRESS"

    # 11. Customer Transactional Emails & Event Logs
    logs_res = client.get("/api/notifications/email-logs", headers=admin_headers)
    assert logs_res.status_code == 200
    event_types = {log["event_type"] for log in logs_res.json()}

    expected_events = {
        "NEW_INQUIRY",
        "CUSTOMER_INQUIRY_RECEIVED",
        "CUSTOMER_PROPOSAL_READY",
        "PROPOSAL_ACCEPTED",
        "CUSTOMER_PAYMENT_INSTRUCTIONS",
        "PAYMENT_CONFIRMATION_SUBMITTED",
        "PAYMENT_VERIFIED",
        "CUSTOMER_PAYMENT_VERIFIED"
    }
    for expected in expected_events:
        assert expected in event_types, f"Event {expected} missing from email logs"
