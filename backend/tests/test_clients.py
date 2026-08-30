import pytest

LEAD_PAYLOAD = {
    "name": "Sarah Jenkins",
    "business_name": "Nexus Logistics",
    "email": "sarah@nexuslogistics.com",
    "phone": "+91 98765 43210",
    "business_type": "Logistics & Supply Chain",
    "service_interest": "Custom software",
    "problem": "We need a real-time dispatch management system with fleet tracking.",
    "budget": "$25,000 - $50,000",
    "source": "Website",
    "priority": "HIGH",
    "estimated_value": 35000.0,
    "consent": True
}

def create_won_lead(client, admin_headers):
    """Helper to create and advance a lead to WON stage."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"]
    client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "WON"},
        headers=admin_headers
    )
    return lead_id

def test_convert_won_lead_into_client(client, admin_headers):
    """Verify converting a WON lead creates a client, generates code, and seeds 10 onboarding items."""
    lead_id = create_won_lead(client, admin_headers)

    res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert res.status_code == 201
    data = res.json()

    assert data["lead_id"] == lead_id
    assert data["business_name"] == "Nexus Logistics"
    assert data["name"] == "Sarah Jenkins"
    assert data["email"] == "sarah@nexuslogistics.com"
    assert data["status"] == "ACTIVE"
    assert data["onboarding_status"] == "NOT_STARTED"
    assert "client_code" in data
    assert data["client_code"].startswith("SC-")
    assert data["onboarding_progress"] == 0

    # Verify 10 checklist items seeded
    client_id = data["id"]
    ob_res = client.get(f"/api/clients/{client_id}/onboarding", headers=admin_headers)
    assert ob_res.status_code == 200
    ob_data = ob_res.json()
    assert ob_data["total_items"] == 10
    assert ob_data["completed_items"] == 0
    assert ob_data["progress_percentage"] == 0
    assert len(ob_data["items"]) == 10

def test_reject_conversion_of_non_won_lead(client, admin_headers):
    """Verify conversion is rejected if lead is not in WON status."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"] # Lead is in NEW status

    conv_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert conv_res.status_code == 400
    assert "Only leads with status 'WON' can be converted" in conv_res.json()["detail"]

def test_prevent_duplicate_conversion(client, admin_headers):
    """Verify converting an already-converted lead fails."""
    lead_id = create_won_lead(client, admin_headers)

    # First conversion
    r1 = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert r1.status_code == 201

    # Second conversion attempt
    r2 = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert r2.status_code == 400
    assert "already been converted" in r2.json()["detail"]

def test_retrieve_and_filter_clients(client, admin_headers):
    """Verify listing clients with search, status filters, and sorting."""
    # Client 1
    l1 = create_won_lead(client, admin_headers)
    c1 = client.post(f"/api/clients/from-lead/{l1}", headers=admin_headers).json()

    # Client 2
    r2 = client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "David Miller",
        "business_name": "Apex Fintech",
        "email": "david@apexfintech.io"
    })
    l2 = r2.json()["id"]
    client.patch(f"/api/leads/{l2}", json={"status": "WON"}, headers=admin_headers)
    c2 = client.post(f"/api/clients/from-lead/{l2}", headers=admin_headers).json()

    # Update C2 status to ON_HOLD
    client.patch(f"/api/clients/{c2['id']}", json={"status": "ON_HOLD"}, headers=admin_headers)

    # Filter status=ON_HOLD
    res_hold = client.get("/api/clients?status=ON_HOLD", headers=admin_headers)
    assert res_hold.status_code == 200
    hold_clients = res_hold.json()
    assert len(hold_clients) == 1
    assert hold_clients[0]["business_name"] == "Apex Fintech"

    # Search for "Nexus"
    res_search = client.get("/api/clients?search=Nexus", headers=admin_headers)
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert res_search.json()[0]["business_name"] == "Nexus Logistics"

def test_update_client_details(client, admin_headers):
    """Verify updating client assignment, notes, and status."""
    lead_id = create_won_lead(client, admin_headers)
    c = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers).json()
    client_id = c["id"]

    patch_res = client.patch(
        f"/api/clients/{client_id}",
        json={
            "assigned_to": "Jordan Lee",
            "notes": "Kickoff scheduled for next Monday at 10 AM EST."
        },
        headers=admin_headers
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["assigned_to"] == "Jordan Lee"
    assert updated["notes"] == "Kickoff scheduled for next Monday at 10 AM EST."

def test_onboarding_checklist_progression(client, admin_headers):
    """Verify toggling checklist items updates progress percentage and auto-advances onboarding status."""
    lead_id = create_won_lead(client, admin_headers)
    c = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers).json()
    client_id = c["id"]

    # 1. Fetch items
    ob_res = client.get(f"/api/clients/{client_id}/onboarding", headers=admin_headers)
    items = ob_res.json()["items"]
    assert len(items) == 10

    # 2. Complete 3 items
    items_to_update = [
        {"item_id": items[0]["id"], "completed": True, "notes": "Signed via DocuSign."},
        {"item_id": items[1]["id"], "completed": True, "notes": "50% advance wire received."},
        {"item_id": items[2]["id"], "completed": True, "notes": "Form submitted by client."}
    ]

    patch_ob = client.patch(
        f"/api/clients/{client_id}/onboarding",
        json={"items": items_to_update},
        headers=admin_headers
    )
    assert patch_ob.status_code == 200
    ob_data = patch_ob.json()
    assert ob_data["completed_items"] == 3
    assert ob_data["progress_percentage"] == 30
    assert ob_data["onboarding_status"] == "IN_PROGRESS"

    # 3. Complete all remaining 7 items
    all_completed = [{"item_id": it["id"], "completed": True} for it in items]
    final_patch = client.patch(
        f"/api/clients/{client_id}/onboarding",
        json={"items": all_completed},
        headers=admin_headers
    )
    assert final_patch.status_code == 200
    final_ob = final_patch.json()
    assert final_ob["completed_items"] == 10
    assert final_ob["progress_percentage"] == 100
    assert final_ob["onboarding_status"] == "COMPLETED"
    assert final_ob["onboarding_completed_at"] is not None

def test_client_activity_logging(client, admin_headers):
    """Verify logging and retrieving activities for a client."""
    lead_id = create_won_lead(client, admin_headers)
    c = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers).json()
    client_id = c["id"]

    # Add Call activity
    act_res = client.post(
        f"/api/clients/{client_id}/activities",
        json={"type": "CALL", "text": "Conducted onboarding alignment call with client team."},
        headers=admin_headers
    )
    assert act_res.status_code == 201
    assert act_res.json()["client_id"] == client_id

    # Retrieve activities
    acts_list = client.get(f"/api/clients/{client_id}/activities", headers=admin_headers)
    assert acts_list.status_code == 200
    assert len(acts_list.json()) >= 2 # Includes conversion activity + new call

def test_client_stats_metrics(client, admin_headers):
    """Verify /api/clients/stats aggregate calculations."""
    lead_id = create_won_lead(client, admin_headers)
    client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)

    stats_res = client.get("/api/clients/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_clients"] >= 1
    assert stats["active_clients"] >= 1

def test_unauthorized_client_endpoints(client):
    """Verify all client endpoints reject requests without admin token."""
    endpoints = [
        ("POST", "/api/clients/from-lead/1"),
        ("GET", "/api/clients"),
        ("GET", "/api/clients/stats"),
        ("GET", "/api/clients/1"),
        ("PATCH", "/api/clients/1"),
        ("GET", "/api/clients/1/onboarding"),
        ("PATCH", "/api/clients/1/onboarding"),
        ("GET", "/api/clients/1/activities"),
        ("POST", "/api/clients/1/activities")
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={})
        elif method == "PATCH":
            res = client.patch(path, json={})
        assert res.status_code == 401, f"{method} {path} should return 401"
