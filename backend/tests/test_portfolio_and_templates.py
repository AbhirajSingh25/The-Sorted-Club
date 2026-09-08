import pytest
from fastapi.testclient import TestClient
from models import Lead, LeadStatus, LeadPriority


def test_template_inquiry_submission_flows_to_crm(client: TestClient, admin_headers: dict):
    """
    Verify that an inquiry initiated from a portfolio template (e.g. Saffron & Sage Bistro)
    submits cleanly through POST /api/leads and reaches the CRM with complete blueprint context.
    """
    payload = {
        "name": "Chef Marco Rossi",
        "business_name": "Saffron & Sage Fine Dining",
        "email": "marco@saffronsage.com",
        "phone": "+91 98765 43210",
        "website": "https://saffronsage.com",
        "business_type": "Restaurants and Cafés",
        "service_interest": "Website / Build",
        "problem": "I would like to build a website based on the Saffron & Sage Bistro demo concept (Restaurants and Cafés). Required features: Interactive filterable seasonal menu, instant table reservations, private dining inquiry funnel.",
        "budget": "$2,500 - $5,000",
        "source": "Website - Template: Saffron & Sage Bistro (Demo Concept)",
        "consent": True
    }

    # Public submission
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Chef Marco Rossi"
    assert data["business_name"] == "Saffron & Sage Fine Dining"
    assert data["business_type"] == "Restaurants and Cafés"
    assert data["service_interest"] == "Website / Build"
    assert data["source"] == "Website - Template: Saffron & Sage Bistro (Demo Concept)"
    assert data["status"] == LeadStatus.NEW.value

    lead_id = data["id"]

    # Verify that authenticated Admin CRM sees this lead with full context
    crm_res = client.get(f"/api/leads/{lead_id}", headers=admin_headers)
    assert crm_res.status_code == 200
    crm_data = crm_res.json()
    assert crm_data["id"] == lead_id
    assert "Saffron & Sage Bistro" in crm_data["source"]
    assert "Restaurants and Cafés" == crm_data["business_type"]
    assert "Interactive filterable seasonal menu" in crm_data["problem"]


def test_multiple_template_categories_submission(client: TestClient, admin_headers: dict):
    """
    Test submitting inquiries for all required categories:
    - Coaching Institute (Apex Learning)
    - Salon & Spa (Lumina Sanctuary)
    - Real Estate (Haven & Prime)
    - E-commerce (Nordic Craft)
    - Local Service (ProFix Masters)
    - Freelancer Portfolio (Elena Vance)
    - Startup Landing Page (FlowGrid AI)
    """
    templates_test_data = [
        {
            "name": "Dr. Vikas Agrawal",
            "business_name": "Apex JEE Academy",
            "email": "vikas@apexjee.com",
            "phone": "+91 96438 20888",
            "business_type": "Coaching Institutes",
            "template": "Apex Learning & Exam Hub",
            "budget": "$2,500 - $5,000"
        },
        {
            "name": "Claire Delacroix",
            "business_name": "Lumina Day Spa",
            "email": "claire@luminaspa.com",
            "phone": "+91 98111 22334",
            "business_type": "Salons and Spas",
            "template": "Lumina Sanctuary & Spa",
            "budget": "$2,500 - $5,000"
        },
        {
            "name": "Rajiv Singhania",
            "business_name": "Prime Realty Group",
            "email": "rajiv@primerealty.in",
            "phone": "+91 99999 88888",
            "business_type": "Real Estate",
            "template": "Haven & Prime Luxury Estates",
            "budget": "$5,000 - $15,000"
        },
        {
            "name": "Astrid Lindholm",
            "business_name": "Nordic Ceramics Co",
            "email": "astrid@nordiccraft.se",
            "phone": "+46 70 123 4567",
            "business_type": "E-commerce & Retail",
            "template": "Nordic Craft Studio",
            "budget": "$5,000 - $15,000"
        },
        {
            "name": "Dave Miller",
            "business_name": "ProFix Electrical Services",
            "email": "dave@profixmasters.com",
            "phone": "+1 555 234 5678",
            "business_type": "Local Business & Services",
            "template": "ProFix Masters — HVAC & Electrical",
            "budget": "< $2,500"
        },
        {
            "name": "Elena Vance",
            "business_name": "Vance Advisory",
            "email": "elena@vanceadvisory.com",
            "phone": "+1 415 555 0199",
            "business_type": "Freelancers and Personal Brands",
            "template": "Elena Vance — Brand Strategist & Advisor",
            "budget": "$2,500 - $5,000"
        },
        {
            "name": "Alex Chen",
            "business_name": "FlowGrid Inc",
            "email": "alex@flowgrid.ai",
            "phone": "+1 650 555 0123",
            "business_type": "Startup Landing Pages",
            "template": "FlowGrid AI — Automation Platform",
            "budget": "$2,500 - $5,000"
        }
    ]

    for item in templates_test_data:
        payload = {
            "name": item["name"],
            "business_name": item["business_name"],
            "email": item["email"],
            "phone": item["phone"],
            "business_type": item["business_type"],
            "service_interest": "Website / Build",
            "problem": f"Requesting website build modeled on {item['template']} demo concept. Need fast turnaround and CRM integration.",
            "budget": item["budget"],
            "source": f"Website - Template: {item['template']} (Demo Concept)",
            "consent": True
        }

        res = client.post("/api/leads", json=payload)
        assert res.status_code == 201, f"Failed for {item['template']}: {res.text}"
        created = res.json()
        assert created["source"] == f"Website - Template: {item['template']} (Demo Concept)"

        # Verify in CRM leads pipeline
        get_res = client.get(f"/api/leads/{created['id']}", headers=admin_headers)
        assert get_res.status_code == 200
        assert get_res.json()["business_type"] == item["business_type"]


def test_template_inquiry_validation_rules(client: TestClient):
    """
    Ensure input validation rules remain strictly enforced when submitting template inquiries:
    - Min 2 chars name
    - Valid email
    - Valid phone
    - Min 10 chars problem
    - Consent true
    """
    invalid_payload = {
        "name": "A", # Too short
        "business_name": "Test",
        "email": "invalid-email",
        "phone": "123",
        "business_type": "Restaurants and Cafés",
        "service_interest": "Website / Build",
        "problem": "Too short", # Less than 10 chars
        "budget": "$2,500 - $5,000",
        "consent": False
    }

    res = client.post("/api/leads", json=invalid_payload)
    assert res.status_code in (400, 422)
