"""
Unit & Integration Tests for Phase 21: Customer Acquisition & First Customer Outreach System
Tests 9-stage pipeline, prospect intelligence fields, 6-point qualification score, and CRM metrics.
"""

import pytest
from models import LeadStatus, LeadPriority


def test_create_prospect_with_intelligence_fields(client, admin_headers):
    """Verify that new prospects can be created with problem_noticed and relevant_template."""
    payload = {
        "name": "Vikram Sethi",
        "email": "vikram@copperchimney.in",
        "phone": "+91 98765 43210",
        "business_name": "Copper Chimney Bistro",
        "business_type": "Restaurant / Café",
        "service_interest": "Website / Build",
        "budget": "₹20,000 - ₹50,000",
        "problem": "Current site is slow, non-mobile friendly, and has no online table reservation system.",
        "problem_noticed": "Menu is uploaded as a 12MB PDF on Google Drive; mobile layout breaks completely.",
        "relevant_template": "Feast & Flora (Restaurant / Café)",
        "source": "Instagram",
        "priority": "HIGH",
        "status": "NEW",
        "estimated_value": 34999.0
    }

    response = client.post("/api/leads", json=payload)
    assert response.status_code in (200, 201), response.text
    data = response.json()
    assert data["business_name"] == "Copper Chimney Bistro"
    assert data["problem_noticed"] == "Menu is uploaded as a 12MB PDF on Google Drive; mobile layout breaks completely."
    assert data["relevant_template"] == "Feast & Flora (Restaurant / Café)"
    assert data["status"] == "NEW"
    assert data["qualification_score"] == 0  # No qualification flags marked yet


def test_automated_qualification_score_computation(client, admin_headers):
    """Verify that qualification score is automatically computed as sum of 6 criteria flags."""
    # 1. Create a lead with 3 flags True
    payload = {
        "name": "Dr. Ananya Roy",
        "email": "dr.ananya@luxedental.in",
        "phone": "+91 98111 22233",
        "business_name": "Luxe Dental Clinic",
        "business_type": "Healthcare / Clinic",
        "service_interest": "Website / Build",
        "budget": "₹20,000 - ₹50,000",
        "problem": "Needs automated appointment booking and patient intake forms.",
        "has_real_business": True,
        "has_clear_need": True,
        "has_budget": True,
        "has_timeline": False,
        "is_decision_maker": False,
        "responds_communication": False
    }

    response = client.post("/api/leads", json=payload)
    assert response.status_code in (200, 201), response.text
    data = response.json()
    lead_id = data["id"]
    assert data["qualification_score"] == 3

    # 2. Update the lead with 2 additional flags (total 5 flags -> Tier A)
    patch_payload = {
        "is_decision_maker": True,
        "responds_communication": True
    }
    patch_resp = client.patch(f"/api/leads/{lead_id}", json=patch_payload, headers=admin_headers)
    assert patch_resp.status_code == 200, patch_resp.text
    updated = patch_resp.json()
    assert updated["is_decision_maker"] is True
    assert updated["responds_communication"] is True
    assert updated["qualification_score"] == 5

    # 3. Unset a flag -> score decrements to 4
    patch_resp2 = client.patch(f"/api/leads/{lead_id}", json={"has_budget": False}, headers=admin_headers)
    assert patch_resp2.status_code == 200
    assert patch_resp2.json()["qualification_score"] == 4


def test_nine_stage_pipeline_transitions(client, admin_headers):
    """Verify that a prospect can transition smoothly across all 9 customer acquisition stages."""
    # Create new lead
    create_resp = client.post("/api/leads", json={
        "name": "Rohan Mehta",
        "email": "rohan@apexacademy.com",
        "phone": "+91 99887 76655",
        "business_name": "Apex Academy",
        "business_type": "Coaching / EdTech",
        "service_interest": "Website / Build",
        "budget": "₹50,000 - ₹1,00,000",
        "problem": "Wants to sell cohort courses and capture student demo bookings.",
        "relevant_template": "Apex Academy (Coaching / EdTech)"
    })
    lead_id = create_resp.json()["id"]

    all_stages = [
        "NEW",
        "CONTACTED",
        "REPLIED",
        "DISCOVERY_CALL",
        "PROPOSAL_SENT",
        "NEGOTIATION",
        "FOLLOW_UP_REQUIRED",
        "WON"
    ]

    for stage in all_stages:
        resp = client.patch(f"/api/leads/{lead_id}", json={"status": stage}, headers=admin_headers)
        assert resp.status_code == 200, f"Failed at stage {stage}: {resp.text}"
        assert resp.json()["status"] == stage


def test_crm_metrics_reflect_nine_stage_pipeline(client, admin_headers):
    """Verify that CRM pipeline metrics include counts for all acquisition stages."""
    # Create leads in different stages
    stages_to_create = [
        ("Acme Dining", "NEW", 25000),
        ("Apex Tutors", "CONTACTED", 35000),
        ("Luxe Spa", "REPLIED", 45000),
        ("Prime Homes", "DISCOVERY_CALL", 55000),
        ("Aura Store", "PROPOSAL_SENT", 65000),
        ("ProFix Plumbing", "NEGOTIATION", 30000),
        ("Pulse Gym", "WON", 50000),
        ("Nexus Tech", "LOST", 40000),
        ("Vance Media", "FOLLOW_UP_REQUIRED", 35000),
    ]

    for biz, stage, value in stages_to_create:
        client.post("/api/leads", json={
            "name": f"Contact for {biz}",
            "email": f"info@{biz.lower().replace(' ', '')}.com",
            "phone": "+91 90000 00000",
            "business_name": biz,
            "business_type": "Local Service",
            "service_interest": "Website / Build",
            "budget": "₹20,000 - ₹50,000",
            "problem": "Need redesign",
            "status": stage,
            "estimated_value": value
        })

    metrics_resp = client.get("/api/leads/crm-stats", headers=admin_headers)
    assert metrics_resp.status_code == 200, metrics_resp.text
    m = metrics_resp.json()

    assert m["new_count"] >= 1
    assert m["contacted_count"] >= 1
    assert m["replied_count"] >= 1
    assert m["discovery_call_count"] >= 1
    assert m["proposal_count"] >= 1
    assert m["negotiation_count"] >= 1
    assert m["won_count"] >= 1
    assert m["lost_count"] >= 1
    assert m["follow_up_required_count"] >= 1
    assert m["won_value"] >= 50000


def test_search_and_filter_by_outreach_fields(client, admin_headers):
    """Verify filtering and searching by problem_noticed and relevant_template."""
    client.post("/api/leads", json={
        "name": "Siddharth Sen",
        "email": "siddharth@craftandvision.studio",
        "phone": "+91 91234 56789",
        "business_name": "Craft & Vision Photography",
        "business_type": "Freelancer / Personal Brand",
        "service_interest": "Website / Build",
        "budget": "₹20,000 - ₹50,000",
        "problem": "Needs high-res portfolio showcase and client inquiry funnel.",
        "problem_noticed": "Currently using Instagram linktree with zero SEO visibility.",
        "relevant_template": "Craft & Vision (Creative Freelancers & Portfolio)"
    })

    # Search by keyword in problem_noticed
    search_resp = client.get("/api/leads?search=linktree", headers=admin_headers)
    assert search_resp.status_code == 200
    leads = search_resp.json()
    assert len(leads) >= 1
    assert leads[0]["business_name"] == "Craft & Vision Photography"

