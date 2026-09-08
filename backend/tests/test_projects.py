import pytest
from datetime import datetime, timezone, timedelta
import models

def create_sample_client(client, admin_headers, name="Apex Retail", email="apex@example.com"):
    """Helper to create a client by converting a WON lead."""
    lead_res = client.post(
        "/api/leads",
        json={
            "name": name,
            "email": email,
            "phone": "+91 98765 43210",
            "business_name": f"{name} Inc",
            "business_type": "E-Commerce",
            "service_interest": "Website / Build",
            "problem": "We need a complete online portal and digital workflow revamp.",
            "budget": "$25,000 - $50,000",
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

    res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert res.status_code == 201
    return res.json()



def test_create_project_with_templates(client, admin_headers):
    """Test project creation with automatic template task seeding."""
    c = create_sample_client(client, admin_headers)

    # 1. Website Template (12 tasks)
    res_web = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Apex Brand Redesign & Store",
            "service_type": "WEBSITE",
            "template_type": "WEBSITE",
            "priority": "HIGH"
        },
        headers=admin_headers
    )
    assert res_web.status_code == 201
    data_web = res_web.json()
    assert data_web["project_code"].startswith("SC-PROJ-")
    assert data_web["service_type"] == "WEBSITE"
    assert data_web["status"] == "PLANNED"
    assert data_web["total_tasks_count"] in [12, 36]
    assert data_web["completed_tasks_count"] == 0
    assert data_web["progress_percentage"] == 0
    assert len(data_web["tasks"]) in [12, 36]

    # 2. AI Automation Template (11 tasks)
    res_ai = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Customer Support AI Copilot",
            "service_type": "AI_AUTOMATION",
            "template_type": "AI_AUTOMATION"
        },
        headers=admin_headers
    )
    assert res_ai.status_code == 201
    data_ai = res_ai.json()
    assert data_ai["total_tasks_count"] == 11

    # 3. Marketing Template (8 tasks)
    res_mkt = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Q3 Growth Campaign",
            "service_type": "MARKETING",
            "template_type": "MARKETING"
        },
        headers=admin_headers
    )
    assert res_mkt.status_code == 201
    assert res_mkt.json()["total_tasks_count"] == 8

    # 4. Recruitment Template (9 tasks)
    res_rec = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Senior Full-Stack Hire",
            "service_type": "RECRUITMENT",
            "template_type": "RECRUITMENT"
        },
        headers=admin_headers
    )
    assert res_rec.status_code == 201
    assert res_rec.json()["total_tasks_count"] == 9

    # 5. Software Template (10 tasks)
    res_soft = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Inventory Microservice",
            "service_type": "SOFTWARE",
            "template_type": "SOFTWARE"
        },
        headers=admin_headers
    )
    assert res_soft.status_code == 201
    assert res_soft.json()["total_tasks_count"] == 10

    # 6. Blank project (0 tasks)
    res_blank = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Custom Advisory",
            "service_type": "CUSTOM",
            "template_type": None
        },
        headers=admin_headers
    )
    assert res_blank.status_code == 201
    assert res_blank.json()["total_tasks_count"] == 0


def test_project_progress_calculation(client, admin_headers):
    """Test server-side project progress calculation as tasks are checked off."""
    c = create_sample_client(client, admin_headers, name="BuildCorp", email="build@example.com")

    res = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Portal Development",
            "service_type": "CUSTOM"
        },
        headers=admin_headers
    )
    proj = res.json()
    proj_id = proj["id"]
    assert proj["progress_percentage"] == 0

    # Add 4 custom tasks
    task_ids = []
    for i in range(4):
        t_res = client.post(
            f"/api/projects/{proj_id}/tasks",
            json={"title": f"Phase {i+1} Task", "priority": "MEDIUM"},
            headers=admin_headers
        )
        assert t_res.status_code == 201
        task_ids.append(t_res.json()["id"])

    # Verify 0/4 = 0%
    p_get = client.get(f"/api/projects/{proj_id}", headers=admin_headers).json()
    assert p_get["completed_tasks_count"] == 0
    assert p_get["total_tasks_count"] == 4
    assert p_get["progress_percentage"] == 0

    # Mark task 1 as DONE -> 1/4 = 25%
    patch1 = client.patch(
        f"/api/projects/{proj_id}/tasks/{task_ids[0]}",
        json={"status": "DONE"},
        headers=admin_headers
    )
    assert patch1.status_code == 200
    assert patch1.json()["completed_at"] is not None

    p_get = client.get(f"/api/projects/{proj_id}", headers=admin_headers).json()
    assert p_get["completed_tasks_count"] == 1
    assert p_get["progress_percentage"] == 25

    # Mark task 2 as DONE -> 2/4 = 50%
    client.patch(
        f"/api/projects/{proj_id}/tasks/{task_ids[1]}",
        json={"status": "DONE"},
        headers=admin_headers
    )
    p_get = client.get(f"/api/projects/{proj_id}", headers=admin_headers).json()
    assert p_get["completed_tasks_count"] == 2
    assert p_get["progress_percentage"] == 50

    # Mark tasks 3 and 4 as DONE -> 4/4 = 100%
    client.patch(f"/api/projects/{proj_id}/tasks/{task_ids[2]}", json={"status": "DONE"}, headers=admin_headers)
    client.patch(f"/api/projects/{proj_id}/tasks/{task_ids[3]}", json={"status": "DONE"}, headers=admin_headers)
    p_get = client.get(f"/api/projects/{proj_id}", headers=admin_headers).json()
    assert p_get["completed_tasks_count"] == 4
    assert p_get["progress_percentage"] == 100

    # Reopen task 1 -> 3/4 = 75%, completed_at is cleared
    patch_reopen = client.patch(
        f"/api/projects/{proj_id}/tasks/{task_ids[0]}",
        json={"status": "IN_PROGRESS"},
        headers=admin_headers
    )
    assert patch_reopen.status_code == 200
    assert patch_reopen.json()["completed_at"] is None

    p_get = client.get(f"/api/projects/{proj_id}", headers=admin_headers).json()
    assert p_get["completed_tasks_count"] == 3
    assert p_get["progress_percentage"] == 75


def test_project_status_transitions_and_waiting_state(client, admin_headers):
    """Test project status updates, completed_at timestamp, and waiting state."""
    c = create_sample_client(client, admin_headers, name="FinTech Global", email="fintech@example.com")

    res = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Payment Gateway Integration",
            "service_type": "SOFTWARE"
        },
        headers=admin_headers
    )
    proj_id = res.json()["id"]

    # Transition to WAITING_FOR_CLIENT
    patch_waiting = client.patch(
        f"/api/projects/{proj_id}",
        json={
            "status": "WAITING_FOR_CLIENT",
            "waiting_for": "Awaiting Stripe API production credentials"
        },
        headers=admin_headers
    )
    assert patch_waiting.status_code == 200
    assert patch_waiting.json()["status"] == "WAITING_FOR_CLIENT"
    assert patch_waiting.json()["waiting_for"] == "Awaiting Stripe API production credentials"

    # Transition to COMPLETED
    patch_comp = client.patch(
        f"/api/projects/{proj_id}",
        json={
            "status": "COMPLETED"
        },
        headers=admin_headers
    )
    assert patch_comp.status_code == 200
    assert patch_comp.json()["status"] == "COMPLETED"
    assert patch_comp.json()["completed_at"] is not None


def test_project_activity_logging(client, admin_headers):
    """Test that activities and timeline entries are recorded."""
    c = create_sample_client(client, admin_headers, name="DesignLab", email="design@example.com")

    res = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Design System",
            "service_type": "WEBSITE"
        },
        headers=admin_headers
    )
    proj_id = res.json()["id"]

    # Check that initial creation activity was logged
    acts = client.get(f"/api/projects/{proj_id}/activities", headers=admin_headers).json()
    assert len(acts) >= 1
    assert acts[0]["type"] in ["NOTE", "STATUS_CHANGE", "MILESTONE"]

    # Manually log a client meeting note
    post_act = client.post(
        f"/api/projects/{proj_id}/activities",
        json={
            "type": "MEETING",
            "description": "Kickoff meeting held with lead designer and product manager.",
            "created_by": "Alex Morgan"
        },
        headers=admin_headers
    )
    assert post_act.status_code == 201
    assert post_act.json()["type"] == "MEETING"

    # Check activities list includes new meeting
    acts2 = client.get(f"/api/projects/{proj_id}/activities", headers=admin_headers).json()
    descriptions = [a["description"] for a in acts2]
    assert any("Kickoff meeting" in d for d in descriptions)


def test_project_resources_crud_and_validation(client, admin_headers):
    """Test project resource links creation, URL validation, and deletion."""
    c = create_sample_client(client, admin_headers, name="CloudApp", email="cloud@example.com")

    res = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Cloud Migration",
            "service_type": "SOFTWARE"
        },
        headers=admin_headers
    )
    proj_id = res.json()["id"]

    # 1. Add valid resources
    res_doc = client.post(
        f"/api/projects/{proj_id}/resources",
        json={
            "title": "Architecture Blueprint",
            "url": "https://docs.google.com/document/d/123456",
            "resource_type": "DOCUMENT",
            "notes": "System architecture and cloud components."
        },
        headers=admin_headers
    )
    assert res_doc.status_code == 201
    doc_id = res_doc.json()["id"]
    assert res_doc.json()["resource_type"] == "DOCUMENT"

    res_repo = client.post(
        f"/api/projects/{proj_id}/resources",
        json={
            "title": "GitHub Repo",
            "url": "https://github.com/sorted-club/cloud-core",
            "resource_type": "REPOSITORY"
        },
        headers=admin_headers
    )
    assert res_repo.status_code == 201

    # 2. Reject invalid URL
    bad_url_res = client.post(
        f"/api/projects/{proj_id}/resources",
        json={
            "title": "Bad Link",
            "url": "invalid-url-without-scheme",
            "resource_type": "OTHER"
        },
        headers=admin_headers
    )
    assert bad_url_res.status_code == 422

    # 3. List resources
    all_res = client.get(f"/api/projects/{proj_id}/resources", headers=admin_headers).json()
    assert len(all_res) == 2

    # 4. Delete resource
    del_res = client.delete(f"/api/projects/{proj_id}/resources/{doc_id}", headers=admin_headers)
    assert del_res.status_code == 204

    all_res2 = client.get(f"/api/projects/{proj_id}/resources", headers=admin_headers).json()
    assert len(all_res2) == 1


def test_multiple_projects_and_overdue_detection(client, admin_headers):
    """Test client multiple projects and overdue calculation."""
    c = create_sample_client(client, admin_headers, name="OmniCorp", email="omni@example.com")

    yesterday = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    future = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

    # Create an overdue project
    res_overdue = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Overdue Project",
            "service_type": "WEBSITE",
            "priority": "URGENT",
            "target_date": yesterday
        },
        headers=admin_headers
    )
    assert res_overdue.status_code == 201
    assert res_overdue.json()["is_overdue"] is True

    # Create an on-track future project
    res_future = client.post(
        "/api/projects",
        json={
            "client_id": c["id"],
            "name": "Future Deliverable",
            "service_type": "MARKETING",
            "priority": "LOW",
            "target_date": future
        },
        headers=admin_headers
    )
    assert res_future.status_code == 201
    assert res_future.json()["is_overdue"] is False

    # Check stats
    stats = client.get("/api/projects/stats", headers=admin_headers).json()
    assert stats["overdue"] >= 1
    assert stats["total_projects"] >= 2


def test_unauthenticated_projects_access(client):
    """Ensure all project delivery endpoints require admin authentication."""
    assert client.get("/api/projects").status_code == 401
    assert client.get("/api/projects/stats").status_code == 401
    assert client.post("/api/projects", json={"name": "Hacked", "client_id": 1}).status_code == 401
    assert client.get("/api/projects/1").status_code == 401
    assert client.patch("/api/projects/1", json={"name": "Hacked"}).status_code == 401
    assert client.delete("/api/projects/1").status_code == 401
