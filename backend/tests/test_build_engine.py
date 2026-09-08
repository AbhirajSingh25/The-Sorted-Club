import pytest
from datetime import datetime, timezone, timedelta
from models import (
    Lead, Client, Proposal, Contract, Invoice, Project,
    ProjectBrief, ProjectMilestone, ProjectApproval, ProjectUpdate,
    ProjectTask, ProjectHealth, MilestoneStatus, ApprovalStatus
)

def create_sample_client(client, admin_headers, name="Elena Rostova", email="elena@nexustech.io"):
    """Create a client via the standard won-lead endpoint."""
    lead_res = client.post(
        "/api/leads",
        json={
            "name": name,
            "email": email,
            "phone": "+91 98765 43210",
            "business_name": "Nexus Technologies",
            "business_type": "SaaS & Tech",
            "service_interest": "Website / Build",
            "problem": "Need a flagship corporate website with custom dashboard integration.",
            "budget": "$15,000 - $50,000",
            "source": "Website",
            "consent": True
        }
    )
    assert lead_res.status_code == 201
    lead_id = lead_res.json()["id"]

    client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "WON"},
        headers=admin_headers
    )

    conv_res = client.post(
        f"/api/clients/from-lead/{lead_id}",
        headers=admin_headers
    )
    assert conv_res.status_code == 201
    return conv_res.json()

def test_create_build_project_with_36_tasks_and_milestones(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    payload = {
        "client_id": c["id"],
        "name": "Nexus Flagship Web Platform",
        "description": "36-task phased corporate website with custom portals",
        "service_type": "WEBSITE",
        "priority": "HIGH",
        "template_type": "WEBSITE",
        "target_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    }

    res = client.post("/api/projects", json=payload, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()

    assert data["project_code"].startswith("SC-PROJ-")
    assert data["name"] == "Nexus Flagship Web Platform"
    assert data["service_type"] == "WEBSITE"
    assert data["health"] == "ON_TRACK"
    assert "public_token" in data and len(data["public_token"]) > 10
    assert data["total_tasks_count"] == 36
    assert data["completed_tasks_count"] == 0
    assert data["progress_percentage"] == 0

    # Verify 7 default milestones exist
    assert len(data["milestones"]) == 7
    milestone_titles = [m["title"] for m in data["milestones"]]
    assert "Discovery" in milestone_titles
    assert "Design" in milestone_titles
    assert "Development" in milestone_titles
    assert "QA & Testing" in milestone_titles
    assert "Client Review" in milestone_titles
    assert "Launch & Deployment" in milestone_titles
    assert "Handover & Completion" in milestone_titles

    # Verify 11-point handover checklist initialized
    assert len(data["handover_checklist"]) == 11

def test_project_brief_and_discovery_checklist_flow(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    create_res = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "E-Commerce Replatforming",
        "service_type": "ECOMMERCE",
        "template_type": "ECOMMERCE"
    }, headers=admin_headers)
    project_id = create_res.json()["id"]

    # 1. Retrieve initial brief
    brief_res = client.get(f"/api/projects/{project_id}/brief", headers=admin_headers)
    assert brief_res.status_code == 200
    brief_data = brief_res.json()
    assert brief_data["business_name"] == "Nexus Technologies"
    assert len(brief_data["discovery_checklist"]) == 12

    # 2. Update brief with comprehensive specifications
    checklist = brief_data["discovery_checklist"]
    checklist[0]["completed"] = True
    checklist[0]["notes"] = "Confirmed 30% conversion uplift goal."

    update_payload = {
        "industry": "Enterprise SaaS",
        "target_audience": "VP of Engineering and Operations Heads",
        "website_domain": "nexustech.io",
        "primary_business_goal": "Scale inbound enterprise demos",
        "website_goal": "Product architecture storytelling and instant interactive sandbox",
        "logo_received": True,
        "colors": "#0F172A, #38BDF8, #10B981",
        "cms_requirement": "Custom Headless CMS",
        "integrations_needed": "HubSpot CRM, Stripe Billing, Segment Analytics",
        "discovery_checklist": checklist
    }

    put_res = client.put(f"/api/projects/{project_id}/brief", json=update_payload, headers=admin_headers)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["industry"] == "Enterprise SaaS"
    assert updated["logo_received"] is True
    assert updated["discovery_checklist"][0]["completed"] is True
    assert updated["discovery_checklist"][0]["notes"] == "Confirmed 30% conversion uplift goal."

def test_project_milestones_crud(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    create_res = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "Web App Platform",
        "service_type": "WEB_APP"
    }, headers=admin_headers)
    project_id = create_res.json()["id"]

    # Add custom milestone
    m_res = client.post(f"/api/projects/{project_id}/milestones", json={
        "title": "Security & SOC2 Audit",
        "description": "Third-party penetration testing",
        "order_index": 7
    }, headers=admin_headers)
    assert m_res.status_code == 201
    m_id = m_res.json()["id"]

    # Update milestone to COMPLETED
    patch_res = client.patch(f"/api/projects/{project_id}/milestones/{m_id}", json={
        "status": "COMPLETED"
    }, headers=admin_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "COMPLETED"
    assert patch_res.json()["completed_at"] is not None

def test_client_approvals_workflow_and_public_decision(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    proj = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "Design & Brand Sprint",
        "service_type": "WEBSITE"
    }, headers=admin_headers).json()
    project_id = proj["id"]

    # 1. Admin creates approval request
    appr_res = client.post(f"/api/projects/{project_id}/approvals", json={
        "title": "Homepage & Nav Design Signoff",
        "item_type": "DESIGN",
        "description": "Figma layout for desktop and mobile homepage.",
        "preview_url": "https://figma.com/@sorted/preview-nexus",
        "asset_urls": ["https://figma.com/@sorted/preview-nexus"]
    }, headers=admin_headers)
    assert appr_res.status_code == 201
    approval = appr_res.json()
    token = approval["public_token"]
    assert approval["status"] == "PENDING"

    # 2. Public review endpoint works
    pub_res = client.get(f"/api/public/approval/{token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["title"] == "Homepage & Nav Design Signoff"
    assert pub_data["client_business_name"] == "Nexus Technologies"

    # 3. Request Changes requires comment validation
    bad_decision = client.post(f"/api/public/approval/{token}/decision", json={
        "decision": "REQUEST_CHANGES",
        "customer_name": "Elena Rostova",
        "customer_email": "elena@nexustech.io",
        "comment": ""
    })
    assert bad_decision.status_code == 400
    assert "feedback" in bad_decision.json()["detail"].lower()

    # 4. Customer successfully approves
    good_decision = client.post(f"/api/public/approval/{token}/decision", json={
        "decision": "APPROVE",
        "customer_name": "Elena Rostova",
        "customer_email": "elena@nexustech.io",
        "comment": "Looks incredible! Ready for frontend dev."
    })
    assert good_decision.status_code == 200
    res_data = good_decision.json()
    assert res_data["status"] == "APPROVED"
    assert res_data["decision_name"] == "Elena Rostova"
    assert res_data["decision_at"] is not None

def test_customer_project_view_and_update_filtering(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    proj = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "Customer Portal View Test",
        "service_type": "WEBSITE"
    }, headers=admin_headers).json()
    project_id = proj["id"]
    token = proj["public_token"]

    # Admin creates 1 public update and 1 internal update
    client.post(f"/api/projects/{project_id}/updates", json={
        "title": "Wireframes Completed",
        "message": "Design phase is ahead of schedule.",
        "category": "PROGRESS",
        "customer_visible": True
    }, headers=admin_headers)

    client.post(f"/api/projects/{project_id}/updates", json={
        "title": "Internal QA Sync",
        "message": "Discussed database index tuning.",
        "category": "PROGRESS",
        "customer_visible": False
    }, headers=admin_headers)

    # Customer fetches project via public token
    pub_res = client.get(f"/api/public/project/{token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()

    assert pub_data["name"] == "Customer Portal View Test"
    assert pub_data["client_business_name"] == "Nexus Technologies"
    assert len(pub_data["updates"]) == 1
    assert pub_data["updates"][0]["title"] == "Wireframes Completed"
    # Ensure internal activities / staff notes are not exposed
    assert "activities" not in pub_data

def test_handover_and_strict_project_completion_enforcement(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    proj = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "Strict Completion Test Project",
        "service_type": "WEBSITE",
        "template_type": "WEBSITE"
    }, headers=admin_headers).json()
    project_id = proj["id"]

    # 1. Attempting to complete project when tasks are pending fails
    fail_res1 = client.post(f"/api/projects/{project_id}/complete", headers=admin_headers)
    assert fail_res1.status_code == 400
    assert "pending" in fail_res1.json()["detail"]

    # 2. Mark all tasks DONE
    tasks = proj["tasks"]
    for t in tasks:
        client.patch(f"/api/projects/{project_id}/tasks/{t['id']}", json={"status": "DONE"}, headers=admin_headers)

    # 3. Attempting to complete with unverified handover checklist fails
    fail_res2 = client.post(f"/api/projects/{project_id}/complete", headers=admin_headers)
    assert fail_res2.status_code == 400
    assert "handover checklist" in fail_res2.json()["detail"].lower()

    # 4. Check all 11 handover items
    checklist = proj["handover_checklist"]
    for item in checklist:
        item["completed"] = True

    client.patch(f"/api/projects/{project_id}/handover", json={
        "handover_checklist": checklist,
        "handover_notes": "Live on production with SSL and Google Tag Manager."
    }, headers=admin_headers)

    # 5. Completion now succeeds
    comp_res = client.post(f"/api/projects/{project_id}/complete", headers=admin_headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["status"] == "COMPLETED"
    assert comp_data["completed_at"] is not None
    assert comp_data["handover_completed_at"] is not None

def test_project_health_calculation(client, admin_headers):
    c = create_sample_client(client, admin_headers)

    # 1. On track project
    p1 = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "On Track Project",
        "target_date": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    }, headers=admin_headers).json()
    assert p1["health"] == "ON_TRACK"

    # 2. Blocked project
    client.patch(f"/api/projects/{p1['id']}", json={"status": "BLOCKED"}, headers=admin_headers)
    p1_blocked = client.get(f"/api/projects/{p1['id']}", headers=admin_headers).json()
    assert p1_blocked["health"] == "BLOCKED"

    # 3. Overdue project
    p2 = client.post("/api/projects", json={
        "client_id": c["id"],
        "name": "Overdue Project",
        "target_date": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    }, headers=admin_headers).json()
    assert p2["health"] == "OVERDUE"

def test_security_and_invalid_tokens(client, admin_headers):
    # 1. Invalid public project token returns 404
    assert client.get("/api/public/project/invalid_token_123").status_code == 404

    # 2. Invalid public approval token returns 404
    assert client.get("/api/public/approval/invalid_token_123").status_code == 404

    # 3. Unauthorized admin project access returns 401
    assert client.get("/api/projects").status_code == 401
    assert client.post("/api/projects", json={"client_id": 1, "name": "Hack"}).status_code == 401
