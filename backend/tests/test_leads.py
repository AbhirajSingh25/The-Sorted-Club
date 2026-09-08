import pytest

VALID_LEAD_PAYLOAD = {
    "name": "Aarav Sharma",
    "business_name": "Sharma Logistics Pvt Ltd",
    "email": "aarav@sharmalogistics.in",
    "phone": "+91 98765 43210",
    "website": "https://sharmalogistics.in",
    "business_type": "E-commerce & Retail",
    "service_interest": "Website / Build",
    "problem": "We need a complete modern customer portal with tracking and instant quoting features.",
    "budget": "$5,000 - $15,000",
    "consent": True
}

def test_create_valid_lead(client):
    """Verify creating a valid lead returns 201 and correct structure."""
    response = client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Aarav Sharma"
    assert data["business_name"] == "Sharma Logistics Pvt Ltd"
    assert data["email"] == "aarav@sharmalogistics.in"
    assert data["phone"] == "+91 98765 43210"
    assert data["status"] == "NEW"
    assert "created_at" in data
    assert "updated_at" in data

def test_create_lead_indian_phone_formats(client):
    """Verify different valid Indian phone number representations."""
    valid_numbers = [
        "9876543210",
        "+91 9876543210",
        "+91-98765-43210",
        "09876543210",
        "919876543210",
        "8765432109",
        "7654321098",
        "6543210987"
    ]
    for num in valid_numbers:
        payload = {**VALID_LEAD_PAYLOAD, "phone": num, "email": f"test_{num.replace('+', '').replace('-', '').replace(' ', '')}@example.com"}
        response = client.post("/api/leads", json=payload)
        assert response.status_code == 201, f"Failed for valid phone number: {num}"

def test_create_lead_international_phone(client):
    """Verify valid international phone number with country code."""
    payload = {**VALID_LEAD_PAYLOAD, "phone": "+1 555 019 2834", "email": "us_client@example.com"}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201

def test_reject_invalid_phone(client):
    """Verify rejection of invalid phone numbers."""
    invalid_numbers = [
        "123",                    # too short
        "abcdefghij",             # non-digits
        "1234567890",             # 10 digits starting with 1 (not a valid Indian mobile number)
        "5555555555",             # 10 digits starting with 5 (not a valid Indian mobile number)
        "+1234567890123456789"    # too long (> 15 digits)
    ]
    for num in invalid_numbers:
        payload = {**VALID_LEAD_PAYLOAD, "phone": num}
        response = client.post("/api/leads", json=payload)
        assert response.status_code == 422, f"Expected rejection for phone: {num}"

def test_reject_invalid_email(client):
    """Verify rejection of invalid email addresses."""
    invalid_emails = [
        "plainaddress",
        "@missingusername.com",
        "user@.com",
        "user@domain..com",
        "user@domain"
    ]
    for em in invalid_emails:
        payload = {**VALID_LEAD_PAYLOAD, "email": em}
        response = client.post("/api/leads", json=payload)
        assert response.status_code == 422, f"Expected rejection for email: {em}"

def test_reject_short_problem(client):
    """Verify rejection of problem briefs with fewer than 10 characters."""
    payload = {**VALID_LEAD_PAYLOAD, "problem": "Too short"}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 422

def test_reject_missing_consent(client):
    """Verify rejection when consent is false."""
    payload = {**VALID_LEAD_PAYLOAD, "consent": False}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 422

def test_get_leads_unauthorized(client):
    """Verify unauthorized request to GET /api/leads returns 401."""
    response = client.get("/api/leads")
    assert response.status_code == 401

def test_get_leads_authorized(client, admin_headers):
    """Verify authorized admin can retrieve leads list."""
    # Create 2 leads first
    client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    client.post("/api/leads", json={
        **VALID_LEAD_PAYLOAD,
        "name": "Priya Patel",
        "business_name": "Patel Designs",
        "email": "priya@pateldesigns.com",
        "service_interest": "Marketing / Growth"
    })

    response = client.get("/api/leads", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_filter_leads_by_status(client, admin_headers):
    """Verify filtering leads by status works correctly."""
    res1 = client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    lead_id = res1.json()["id"]

    # Update lead_id to CONTACTED
    client.patch(f"/api/leads/{lead_id}", json={"status": "CONTACTED"}, headers=admin_headers)

    # Add another NEW lead
    client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "name": "Second Lead", "email": "second@example.com"})

    # Filter by CONTACTED
    response = client.get("/api/leads?status=CONTACTED", headers=admin_headers)
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) == 1
    assert leads[0]["id"] == lead_id
    assert leads[0]["status"] == "CONTACTED"

    # Filter by ALL
    all_res = client.get("/api/leads?status=ALL", headers=admin_headers)
    assert len(all_res.json()) == 2

def test_filter_leads_by_service_and_search(client, admin_headers):
    """Verify searching and service interest filtering."""
    client.post("/api/leads", json={
        **VALID_LEAD_PAYLOAD,
        "name": "Rohan Gupta",
        "business_name": "Gupta AI Solutions",
        "email": "rohan@gupta-ai.com",
        "service_interest": "AI / Automation",
        "problem": "Automate invoice parsing and WhatsApp notifications for clients."
    })
    client.post("/api/leads", json={
        **VALID_LEAD_PAYLOAD,
        "name": "Sneha Roy",
        "business_name": "Roy Fashion Hub",
        "email": "sneha@royfashion.in",
        "service_interest": "Marketing / Growth",
        "problem": "Performance marketing and influencer management campaigns."
    })

    # Search by keyword
    search_res = client.get("/api/leads?search=invoice", headers=admin_headers)
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) == 1
    assert results[0]["name"] == "Rohan Gupta"

    # Search by service
    service_res = client.get("/api/leads?service_interest=Marketing", headers=admin_headers)
    assert service_res.status_code == 200
    assert len(service_res.json()) == 1
    assert service_res.json()[0]["name"] == "Sneha Roy"

def test_update_lead_status(client, admin_headers):
    """Verify updating lead status and fields."""
    res = client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    update_res = client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "QUALIFIED", "budget": "$15,000 - $50,000"},
        headers=admin_headers
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["status"] == "QUALIFIED"
    assert updated["budget"] == "$15,000 - $50,000"

def test_delete_lead(client, admin_headers):
    """Verify deleting a lead."""
    res = client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    del_res = client.delete(f"/api/leads/{lead_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Verify lead no longer exists
    get_res = client.get(f"/api/leads/{lead_id}", headers=admin_headers)
    assert get_res.status_code == 404

def test_get_lead_stats(client, admin_headers):
    """Verify lead statistics aggregations."""
    # Create leads with different statuses
    r1 = client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    r2 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "lead2@example.com"})
    r3 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "lead3@example.com"})

    client.patch(f"/api/leads/{r1.json()['id']}", json={"status": "CONTACTED"}, headers=admin_headers)
    client.patch(f"/api/leads/{r2.json()['id']}", json={"status": "WON"}, headers=admin_headers)

    stats_res = client.get("/api/leads/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total"] == 3
    assert stats["new"] == 1
    assert stats["contacted"] == 1
    assert stats["won"] == 1
    assert stats["qualified"] == 0

def test_get_leads_empty_database(client, admin_headers):
    """Regression test: GET /api/leads?sort_by=newest with an empty database returns 200 OK and empty list."""
    response = client.get("/api/leads?sort_by=newest", headers=admin_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_get_leads_newest_sorting(client, admin_headers):
    """Regression test: GET /api/leads?sort_by=newest returns leads sorted descending by created_at."""
    res1 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "first@example.com", "name": "Lead One"})
    res2 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "second@example.com", "name": "Lead Two"})
    res3 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "third@example.com", "name": "Lead Three"})

    response = client.get("/api/leads?sort_by=newest", headers=admin_headers)
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) == 3
    # Newest created lead should be first
    assert leads[0]["id"] == res3.json()["id"]
    assert leads[1]["id"] == res2.json()["id"]
    assert leads[2]["id"] == res1.json()["id"]

def test_get_leads_invalid_sort_by(client, admin_headers):
    """Regression test: Invalid sort_by parameter falls back to default newest sorting without crashing."""
    client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    response = client.get("/api/leads?sort_by=invalid_random_sort", headers=admin_headers)
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) == 1

def test_get_leads_value_and_followup_sorting(client, admin_headers):
    """Regression test: sort_by=value_desc and sort_by=follow_up_asc function correctly."""
    l1 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "val1@example.com"}).json()["id"]
    l2 = client.post("/api/leads", json={**VALID_LEAD_PAYLOAD, "email": "val2@example.com"}).json()["id"]
    
    client.patch(f"/api/leads/{l1}", json={"estimated_value": 1000.0}, headers=admin_headers)
    client.patch(f"/api/leads/{l2}", json={"estimated_value": 50000.0}, headers=admin_headers)

    response = client.get("/api/leads?sort_by=value_desc", headers=admin_headers)
    assert response.status_code == 200
    leads = response.json()
    assert leads[0]["id"] == l2
    assert leads[0]["estimated_value"] == 50000.0

def test_get_leads_frontend_contract_structure(client, admin_headers):
    """Regression test: Lead response structure exactly matches frontend expectations."""
    client.post("/api/leads", json=VALID_LEAD_PAYLOAD)
    response = client.get("/api/leads?sort_by=newest", headers=admin_headers)
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) == 1
    lead = leads[0]

    # Required fields for AdminDashboard and CRMView
    expected_fields = [
        "id", "name", "business_name", "email", "phone", "website",
        "business_type", "service_interest", "problem", "budget",
        "status", "source", "priority", "created_at", "updated_at",
        "is_converted", "client_id", "client_code"
    ]
    for field in expected_fields:
        assert field in lead, f"Missing expected field '{field}' in lead response"

