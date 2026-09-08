import pytest
from fastapi.testclient import TestClient
from database import get_db
from models import Lead, LeadStatus, Proposal, ProposalStatus, Client

def test_discovery_questionnaire_lead_submission(client: TestClient, db_session):
    """
    Verify that submitting an interactive discovery questionnaire persists
    the lead with 'Website Discovery Questionnaire' source, complete brief notes,
    and appropriate CRM stage.
    """
    payload = {
        "name": "Vikram Malhotra",
        "business_name": "Apex Legal Advisory",
        "email": "vikram@apexlegal.in",
        "phone": "+919876543210",
        "website": "https://apexlegal.in",
        "business_type": "Professional Services / Consulting / Law",
        "service_interest": "Website / Build",
        "problem": "DISCOVERY BRIEF SUBMISSION:\n• Target Audience: Corporate legal clients\n• Selected Pages (5): Home, About, Services, Case Studies, Contact\n• Required Features: Direct WhatsApp, Lead Capture, CMS\n• Preferred Launch: Within 2 to 3 weeks",
        "budget": "₹24,999",
        "source": "Website Discovery Questionnaire",
        "qualification_notes": "Pages: [Home, About, Services, Case Studies, Contact] | Features: [WhatsApp, CMS, Lead Capture] | Timeline: Within 2 to 3 weeks",
        "timeline": "Within 2 to 3 weeks"
    }

    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["business_name"] == "Apex Legal Advisory"
    assert data["name"] == "Vikram Malhotra"
    assert data["email"] == "vikram@apexlegal.in"
    assert data["service_interest"] == "Website / Build"
    assert data["budget"] == "₹24,999"
    assert data["source"] == "Website Discovery Questionnaire"
    assert data["status"] == LeadStatus.NEW.value
    assert "DISCOVERY BRIEF" in data["problem"]
    assert "Within 2 to 3 weeks" in data["timeline"]

    # Verify directly in database
    db_lead = db_session.query(Lead).filter(Lead.id == data["id"]).first()
    assert db_lead is not None
    assert db_lead.email == "vikram@apexlegal.in"
    assert db_lead.qualification_notes is not None


def test_free_website_consultation_request_lead(client: TestClient, db_session):
    """
    Verify that clicking 'Request a Free Website Consultation' properly creates
    an active lead with appropriate interest tag.
    """
    payload = {
        "name": "Dr. Ananya Roy",
        "business_name": "Lumina Dental & Aesthetics",
        "email": "dr.ananya@luminadental.com",
        "phone": "+919811223344",
        "website": "https://luminadental.com",
        "business_type": "Salon / Spa / Wellness / Clinic",
        "service_interest": "Website / Build — Free Website Consultation",
        "problem": "Looking for advice on whether a Booking Website or Business Website is better for our 2 clinic locations.",
        "budget": "₹34,999",
        "source": "Website Consultation CTA"
    }

    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["business_name"] == "Lumina Dental & Aesthetics"
    assert "Free Website Consultation" in data["service_interest"]


def test_portfolio_template_build_this_cta_creates_crm_lead(client: TestClient, db_session):
    """
    Verify that every portfolio template's 'Build This' CTA creates a lead in the existing
    CRM with selected template information.
    """
    payload = {
        "name": "Chef Marcus Vance",
        "business_name": "Savory Table Bistro",
        "email": "marcus@savorytable.com",
        "phone": "+14155552671",
        "business_type": "Restaurants & Cafés",
        "service_interest": "Website / Build",
        "problem": "Interested in blueprint 'Savory Bites' (Restaurants & Cafés) with interactive menu and reservation integration.",
        "budget": "₹19,999 to ₹29,999",
        "source": "Website Template: savory-bites"
    }

    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["business_name"] == "Savory Table Bistro"
    assert "savory-bites" in data["source"]
    assert "Savory Bites" in data["problem"]


def test_standard_package_proposal_flow(client: TestClient, admin_headers, db_session):
    """
    Verify creating and calculating a commercial proposal using standard package line items
    (e.g., Business Website ₹24,999) with 50/50 payment milestone logic.
    """
    # 1. Create a lead and convert to client
    lead_res = client.post("/api/leads", json={
        "name": "Rohit Verma",
        "business_name": "Verma Consulting LLP",
        "email": "rohit@vermaconsulting.com",
        "phone": "+919988776655",
        "business_type": "Professional Services / Consulting / Law",
        "service_interest": "Website / Build",
        "problem": "Need a professional 5-8 page business website with CMS.",
        "budget": "₹24,999"
    })
    assert lead_res.status_code == 201
    lead_id = lead_res.json()["id"]

    client.patch(f"/api/leads/{lead_id}", json={"status": "WON"}, headers=admin_headers)
    client_res = client.post(f"/api/clients/from-lead/{lead_id}", headers=admin_headers)
    assert client_res.status_code == 201
    client_id = client_res.json()["id"]

    # 2. Create proposal with standard Business Website package
    proposal_payload = {
        "client_id": client_id,
        "title": "Business Website Architecture — Verma Consulting",
        "description": "Standard 5–8 page business website with dynamic CMS, technical SEO, and WhatsApp routing.",
        "currency": "INR",
        "items": [
            {
                "name": "Business Website Engineering (5–8 Pages)",
                "description": "Custom UI/UX, headless CMS, and responsive layouts",
                "quantity": 1,
                "unit_price": 24999.00
            }
        ],
        "discount": 0.0,
        "tax": 0.0,
        "notes": "Payment terms: 50% upfront deposit upon contract signing, 50% upon final live sign-off before DNS handover.",
        "terms": "Includes 2 revision rounds and 45 days post-launch technical warranty."
    }

    prop_res = client.post("/api/proposals", json=proposal_payload, headers=admin_headers)
    assert prop_res.status_code == 201
    prop_data = prop_res.json()

    assert prop_data["total"] == 24999.00
    assert prop_data["currency"] == "INR"
    assert prop_data["status"] == "DRAFT"
    assert len(prop_data["items"]) == 1
    assert prop_data["items"][0]["unit_price"] == 24999.00
    assert prop_data["secure_token"] is not None

    # 3. Test public view of tokenized proposal
    token = prop_data["secure_token"]
    public_res = client.get(f"/api/public/proposal/{token}")
    assert public_res.status_code == 200
    public_data = public_res.json()
    assert public_data["total"] == 24999.00
    assert public_data["client_business_name"] == "Verma Consulting LLP"
    assert "2 revision rounds" in public_data["terms"]
