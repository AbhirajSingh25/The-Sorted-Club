import pytest
from datetime import datetime, timezone, timedelta
from models import (
    Lead, Client, Proposal, Contract, Invoice, Project,
    ProjectBrief, ProjectMilestone, ProjectApproval, ProjectUpdate,
    ProjectTask, ProjectHealth, MilestoneStatus, ApprovalStatus
)

def test_complete_first_customer_lifecycle(client, admin_headers):
    """
    Complete end-to-end commercial and build delivery lifecycle simulation
    for The Sorted Club's first paying customer.
    """
    # --------------------------------------------------------------------------
    # 1. VISITOR INQUIRY (BUILD / SORTED PRO PACKAGE)
    # --------------------------------------------------------------------------
    lead_payload = {
        "name": "Karan Malhotra",
        "email": "karan@auroraglobal.in",
        "phone": "+91 98112 34567",
        "business_name": "Aurora Global Logistics",
        "business_type": "Logistics & Supply Chain",
        "service_interest": "Website / Build",
        "problem": "We need a complete flagship corporate web platform with dynamic shipment tracking demo.",
        "budget": "₹39,999 (Sorted Pro)",
        "source": "Website",
        "consent": True
    }
    inquiry_res = client.post("/api/leads", json=lead_payload)
    assert inquiry_res.status_code == 201
    lead = inquiry_res.json()
    lead_id = lead["id"]
    assert lead["status"] == "NEW"

    # --------------------------------------------------------------------------
    # 2. CRM QUALIFICATION & WON CONVERSION
    # --------------------------------------------------------------------------
    client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "WON", "priority": "URGENT", "estimated_value": 39999.0},
        headers=admin_headers
    )

    conv_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert conv_res.status_code == 201
    client_account = conv_res.json()
    client_id = client_account["id"]
    assert client_account["client_code"].startswith("SC-")

    # --------------------------------------------------------------------------
    # 3. COMMERCIAL PROPOSAL & PUBLIC ONLINE ACCEPTANCE
    # --------------------------------------------------------------------------
    proposal_payload = {
        "client_id": client_id,
        "lead_id": lead_id,
        "title": "Sorted Pro — Aurora Global Web Platform",
        "description": "Full 36-task custom web platform, CMS, lead system, speed optimization, and production deployment.",
        "currency": "INR",
        "items": [
            {
                "name": "Sorted Pro Build Package",
                "description": "5-10 pages, responsive UI, headless CMS, forms & analytics tracking",
                "quantity": 1,
                "unit_price": 39999.0,
                "order_index": 0
            }
        ]
    }
    prop_res = client.post("/api/proposals", json=proposal_payload, headers=admin_headers)
    assert prop_res.status_code == 201
    proposal = prop_res.json()
    prop_id = proposal["id"]
    prop_token = proposal["secure_token"]

    # Customer accepts proposal online at /proposal/{token}
    accept_res = client.post(f"/api/public/proposal/{prop_token}/accept", json={
        "accepted_by_name": "Karan Malhotra",
        "accepted_by_email": "karan@auroraglobal.in"
    })
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "ACCEPTED"

    # --------------------------------------------------------------------------
    # 4. CONTRACT GENERATION & CUSTOMER SIGNING
    # --------------------------------------------------------------------------
    contract_res = client.post(f"/api/contracts/from-proposal/{prop_id}", headers=admin_headers)
    assert contract_res.status_code == 201
    contract = contract_res.json()
    contract_id = contract["id"]
    contract_token = contract["secure_token"]

    sign_res = client.post(f"/api/public/contract/{contract_token}/accept", json={
        "accepted_by_name": "Karan Malhotra",
        "accepted_by_email": "karan@auroraglobal.in"
    })
    assert sign_res.status_code == 200
    assert sign_res.json()["status"] == "ACCEPTED"

    # --------------------------------------------------------------------------
    # 5. INVOICE GENERATION, PAYMENT & ADMIN VERIFICATION
    # --------------------------------------------------------------------------
    inv_res = client.post(f"/api/invoices/from-proposal/{prop_id}", headers=admin_headers)
    assert inv_res.status_code == 201
    invoice = inv_res.json()
    inv_id = invoice["id"]
    inv_token = invoice["secure_token"]

    # Customer submits bank transfer confirmation
    pay_res = client.post(f"/api/public/invoice/{inv_token}/confirm-payment", json={
        "payment_method": "BANK_TRANSFER",
        "reference": "HDFC-UPI-998822",
        "payer_name": "Karan Malhotra",
        "payer_email": "karan@auroraglobal.in",
        "amount": 39999.0
    })
    assert pay_res.status_code == 201

    # Admin verifies payment confirmation
    list_res = client.get("/api/finance/payment-confirmations", headers=admin_headers)
    confirmations = list_res.json()
    target_conf = next(conf for conf in confirmations if conf["reference"] == "HDFC-UPI-998822")
    conf_id = target_conf["id"]

    verify_res = client.post(f"/api/finance/payment-confirmations/{conf_id}/confirm", headers=admin_headers)
    assert verify_res.status_code == 200
    inv_check = client.get(f"/api/invoices/{inv_id}", headers=admin_headers)
    assert inv_check.json()["status"] == "PAID"

    # --------------------------------------------------------------------------
    # 6. BUILD PROJECT INITIALIZATION (36 TASKS & 7 MILESTONES)
    # --------------------------------------------------------------------------
    project_payload = {
        "client_id": client_id,
        "name": "Aurora Global Corporate Web Platform",
        "description": "36-task phased corporate website with custom tracking sandbox",
        "service_type": "WEBSITE",
        "priority": "HIGH",
        "template_type": "WEBSITE",
        "proposal_id": prop_id,
        "contract_id": contract_id,
        "invoice_id": inv_id,
        "target_date": (datetime.now(timezone.utc) + timedelta(days=21)).isoformat()
    }
    proj_res = client.post("/api/projects", json=project_payload, headers=admin_headers)
    assert proj_res.status_code == 201
    project = proj_res.json()
    project_id = project["id"]
    project_token = project["public_token"]

    assert project["total_tasks_count"] == 36
    assert len(project["milestones"]) == 7
    assert len(project["handover_checklist"]) == 11

    # --------------------------------------------------------------------------
    # 7. BRIEF & DISCOVERY SPECIFICATIONS
    # --------------------------------------------------------------------------
    brief_data = client.get(f"/api/projects/{project_id}/brief", headers=admin_headers).json()
    d_list = brief_data["discovery_checklist"]
    for item in d_list:
        item["completed"] = True
        item["notes"] = "Verified with client team."

    client.put(f"/api/projects/{project_id}/brief", json={
        "business_name": "Aurora Global Logistics",
        "industry": "Supply Chain & Logistics",
        "target_audience": "Freight forwarders, shippers, enterprise supply chain directors",
        "website_domain": "auroraglobal.in",
        "primary_business_goal": "Scale high-value freight inquiries and brand authority",
        "cms_requirement": "Custom Fast CMS with dynamic quote engine",
        "discovery_checklist": d_list
    }, headers=admin_headers)

    # --------------------------------------------------------------------------
    # 8. DELIVERABLE APPROVAL (HOMEPAGE DESIGN SIGN-OFF)
    # --------------------------------------------------------------------------
    appr_res = client.post(f"/api/projects/{project_id}/approvals", json={
        "title": "Homepage & UI Visual Direction Signoff",
        "item_type": "DESIGN",
        "description": "Desktop, mobile, and tablet design mocks for Aurora Global.",
        "preview_url": "https://figma.com/@sorted/aurora-live"
    }, headers=admin_headers)
    approval = appr_res.json()
    approval_token = approval["public_token"]

    # Customer approves design sign-off at /project-review/{token}
    signoff_res = client.post(f"/api/public/approval/{approval_token}/decision", json={
        "decision": "APPROVE",
        "customer_name": "Karan Malhotra",
        "customer_email": "karan@auroraglobal.in",
        "comment": "Looks phenomenal! Approved to begin frontend build."
    })
    assert signoff_res.status_code == 200
    assert signoff_res.json()["status"] == "APPROVED"

    # --------------------------------------------------------------------------
    # 9. PUBLIC CUSTOMER PROJECT PORTAL VERIFICATION
    # --------------------------------------------------------------------------
    customer_portal_res = client.get(f"/api/public/project/{project_token}")
    assert customer_portal_res.status_code == 200
    portal_data = customer_portal_res.json()
    assert portal_data["name"] == "Aurora Global Corporate Web Platform"
    assert portal_data["client_business_name"] == "Aurora Global Logistics"
    assert portal_data["health"] == "ON_TRACK"

    # --------------------------------------------------------------------------
    # 10. TASK COMPLETION & HANDOVER PROTOCOL
    # --------------------------------------------------------------------------
    for t in project["tasks"]:
        client.patch(f"/api/projects/{project_id}/tasks/{t['id']}", json={"status": "DONE"}, headers=admin_headers)

    handover_checklist = project["handover_checklist"]
    for h in handover_checklist:
        h["completed"] = True
        h["notes"] = "Verified on production."

    client.patch(f"/api/projects/{project_id}/handover", json={
        "handover_checklist": handover_checklist,
        "handover_notes": "All production records, SSL, and analytics verified. Admin credentials transferred via secure password manager."
    }, headers=admin_headers)

    # --------------------------------------------------------------------------
    # 11. STRICT COMPLETION & DELIVERY SUCCESS
    # --------------------------------------------------------------------------
    final_res = client.post(f"/api/projects/{project_id}/complete", headers=admin_headers)
    assert final_res.status_code == 200
    delivered_project = final_res.json()
    assert delivered_project["status"] == "COMPLETED"
    assert delivered_project["completed_at"] is not None
    assert delivered_project["handover_completed_at"] is not None
    assert delivered_project["progress_percentage"] == 100
