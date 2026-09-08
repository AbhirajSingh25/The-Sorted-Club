import pytest
from datetime import datetime, timezone, timedelta
from models import (
    Lead, Client, Proposal, Contract, Invoice, Project,
    ProjectBrief, ProjectMilestone, ProjectApproval, ProjectUpdate,
    ProjectTask, ProjectHealth, MilestoneStatus, ApprovalStatus
)

def test_public_security_and_data_masking_audit(client, admin_headers):
    """
    Audit 1: Verify that public customer endpoints do NOT leak internal notes,
    activity audit logs, internal task assignee comments, or database IDs.
    """
    # 1. Create client & project
    lead_res = client.post("/api/leads", json={
        "name": "Audit Customer",
        "email": "audit@acme.org",
        "phone": "+91 98765 43210",
        "business_name": "Acme Global Audit",
        "business_type": "Healthcare & Wellness",
        "service_interest": "Website / Build",
        "problem": "Comprehensive security and quality production audit inquiry.",
        "budget": "$15,000 - $50,000",
        "consent": True
    })
    assert lead_res.status_code == 201
    lead_id = lead_res.json()["id"]

    client.patch(f"/api/leads/{lead_id}", json={"status": "WON"}, headers=admin_headers)
    c_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    client_id = c_res.json()["id"]

    proj_res = client.post("/api/projects", json={
        "client_id": client_id,
        "name": "Acme Production Audit Portal",
        "service_type": "WEBSITE",
        "priority": "HIGH"
    }, headers=admin_headers)
    proj = proj_res.json()
    proj_id = proj["id"]
    proj_token = proj["public_token"]

    # 2. Add an internal-only update and a customer-visible update
    client.post(f"/api/projects/{proj_id}/updates", json={
        "title": "Private Internal Dev Standup",
        "message": "Internal team notes: DB migration finished. Internal secret key abc123.",
        "category": "PROGRESS",
        "customer_visible": False
    }, headers=admin_headers)

    client.post(f"/api/projects/{proj_id}/updates", json={
        "title": "Public Milestone Achieved",
        "message": "Discovery specifications validated and wireframes initialized.",
        "category": "MILESTONE",
        "customer_visible": True
    }, headers=admin_headers)

    # 3. Add an internal activity log
    client.post(f"/api/projects/{proj_id}/activities", json={
        "type": "NOTE",
        "text": "Internal PM note: Client requested expedited staging delivery by Friday.",
        "created_by": "Senior PM"
    }, headers=admin_headers)

    # 4. Fetch public customer project view
    pub_res = client.get(f"/api/public/project/{proj_token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()

    # Verify customer sees public updates but NOT internal-only updates
    update_titles = [u["title"] for u in pub_data.get("updates", [])]
    assert "Public Milestone Achieved" in update_titles
    assert "Private Internal Dev Standup" not in update_titles

    # Verify no internal activity log is exposed in public response
    assert "activities" not in pub_data or len(pub_data["activities"]) == 0
    assert "internal_notes" not in pub_data

def test_error_handling_sanitization_audit(client):
    """
    Audit 2: Ensure error responses return clean JSON messages and never expose
    unhandled tracebacks, SQL statements, or internal path structures.
    """
    # 1. Invalid non-existent token
    res = client.get("/api/public/project/INVALID_RANDOM_TOKEN_XYZ_123")
    assert res.status_code == 404
    err_json = res.json()
    assert "detail" in err_json
    assert "Traceback" not in str(err_json)
    assert "sqlite3" not in str(err_json).lower()
    assert "SELECT " not in str(err_json)

    # 2. Invalid proposal token
    res_prop = client.get("/api/public/proposal/FAKE_TOKEN_404")
    assert res_prop.status_code == 404
    assert "Traceback" not in str(res_prop.json())

    # 3. Invalid contract token
    res_cont = client.get("/api/public/contract/FAKE_TOKEN_404")
    assert res_cont.status_code == 404
    assert "Traceback" not in str(res_cont.json())

    # 4. Invalid invoice token
    res_inv = client.get("/api/public/invoice/FAKE_TOKEN_404")
    assert res_inv.status_code == 404
    assert "Traceback" not in str(res_inv.json())

def test_approval_request_changes_mandatory_comment_audit(client, admin_headers):
    """
    Audit 3: Verify that requesting changes on deliverable reviews strictly
    requires an actionable explanation comment (minimum 5 chars).
    """
    # 1. Create client and project with an approval item
    lead_res = client.post("/api/leads", json={
        "name": "Elena Rostova",
        "email": "elena@vanguard.io",
        "phone": "+91 91234 56789",
        "business_name": "Vanguard Tech",
        "business_type": "SaaS & Tech",
        "service_interest": "Website / Build",
        "problem": "Building new SaaS web presence and marketing portal.",
        "budget": "$5,000 - $15,000",
        "consent": True
    })
    lead_id = lead_res.json()["id"]
    client.patch(f"/api/leads/{lead_id}", json={"status": "WON"}, headers=admin_headers)
    c_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    client_id = c_res.json()["id"]

    p_res = client.post("/api/projects", json={
        "client_id": client_id,
        "name": "Vanguard Web Platform",
        "service_type": "WEBSITE"
    }, headers=admin_headers)
    proj_id = p_res.json()["id"]

    appr_res = client.post(f"/api/projects/{proj_id}/approvals", json={
        "title": "Homepage UI Design",
        "item_type": "DESIGN"
    }, headers=admin_headers)
    appr_token = appr_res.json()["public_token"]

    # 2. Reject request without comment -> Must fail 422/400
    bad_req = client.post(f"/api/public/approval/{appr_token}/decision", json={
        "decision": "REQUEST_CHANGES",
        "customer_name": "Elena Rostova",
        "customer_email": "elena@vanguard.io",
        "comment": ""
    })
    assert bad_req.status_code in [400, 422]

    # 3. Request changes with valid comment -> Succeeds
    good_req = client.post(f"/api/public/approval/{appr_token}/decision", json={
        "decision": "REQUEST_CHANGES",
        "customer_name": "Elena Rostova",
        "customer_email": "elena@vanguard.io",
        "comment": "Please adjust hero typography size on mobile devices."
    })
    assert good_req.status_code == 200
    assert good_req.json()["status"] == "CHANGES_REQUESTED"
