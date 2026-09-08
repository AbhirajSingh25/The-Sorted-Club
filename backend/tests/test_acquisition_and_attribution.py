import pytest
from models import Lead, LeadStatus, LeadPriority

def test_utm_and_referral_attribution(client, admin_headers):
    """
    Test 1: Verify UTM and referral source attribution tracking on lead submission.
    """
    # 1. Instagram Campaign lead
    ig_lead_res = client.post("/api/leads", json={
        "name": "Vikram Sethi",
        "email": "vikram@sethifitness.in",
        "phone": "+91 98450 12345",
        "business_name": "Sethi Fitness Studio",
        "business_type": "Healthcare & Wellness",
        "service_interest": "Website / Build",
        "problem": "Need a modern mobile website with class schedule and WhatsApp booking for our gym.",
        "budget": "₹14,999 (Sorted Start)",
        "source": "Instagram",
        "utm_source": "instagram",
        "utm_medium": "story_ad",
        "utm_campaign": "sorted_start_launch",
        "consent": True
    })
    assert ig_lead_res.status_code == 201
    ig_lead = ig_lead_res.json()
    assert ig_lead["source"] == "Instagram"
    assert ig_lead["utm_source"] == "instagram"
    assert ig_lead["utm_campaign"] == "sorted_start_launch"

    # 2. Word-of-mouth Referral lead
    ref_lead_res = client.post("/api/leads", json={
        "name": "Pooja Sharma",
        "email": "pooja@thecoachinghub.com",
        "phone": "+91 99887 65432",
        "business_name": "Sharma Leadership Coaching",
        "business_type": "Agency & Consulting",
        "service_interest": "Website / Build",
        "problem": "Executive coaching landing page with client booking calendar.",
        "budget": "₹14,999 (Sorted Start)",
        "source": "Referral (rahul_mehta)",
        "referral_source": "rahul_mehta",
        "consent": True
    })
    assert ref_lead_res.status_code == 201
    ref_lead = ref_lead_res.json()
    assert ref_lead["source"] == "Referral (rahul_mehta)"
    assert ref_lead["referral_source"] == "rahul_mehta"

def test_lead_qualification_notes_and_crm_analytics(client, admin_headers):
    """
    Test 2: Verify recording of discovery qualification notes and breakdown analytics.
    """
    # 1. Create a lead
    lead_res = client.post("/api/leads", json={
        "name": "Rajesh Kumar",
        "email": "rajesh@kumarjewellers.in",
        "phone": "+91 98200 55443",
        "business_name": "Kumar Fine Jewellers",
        "business_type": "E-commerce & Retail",
        "service_interest": "Website / Build",
        "problem": "Luxury jewellery catalog showcase with direct WhatsApp enquiry buttons.",
        "budget": "₹39,999 (Sorted Pro)",
        "source": "WhatsApp",
        "consent": True
    })
    assert lead_res.status_code == 201
    lead_id = lead_res.json()["id"]

    # 2. Update qualification notes during discovery call
    patch_res = client.patch(f"/api/leads/{lead_id}", json={
        "qualification_notes": "Decision Maker: Confirmed owner Rajesh. Timeline: Needs launch before festive season (2 weeks). Budget: ₹39,999 approved. Existing Site: None (offline store expanding online).",
        "estimated_value": 39999.0,
        "priority": "HIGH",
        "status": "QUALIFIED"
    }, headers=admin_headers)
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert "Decision Maker: Confirmed owner Rajesh" in updated["qualification_notes"]
    assert updated["estimated_value"] == 39999.0
    assert updated["status"] == "QUALIFIED"

    # 3. Check CRM metrics breakdown
    crm_res = client.get("/api/leads/crm-stats", headers=admin_headers)
    assert crm_res.status_code == 200
    metrics = crm_res.json()
    assert "breakdown_by_source" in metrics
    assert "breakdown_by_service" in metrics
    assert metrics["breakdown_by_service"].get("Website / Build", 0) >= 1
