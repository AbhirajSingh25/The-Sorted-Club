from datetime import datetime, timezone, timedelta
import pytest

LEAD_PAYLOAD = {
    "name": "Dev Mehta",
    "business_name": "Mehta FinTech",
    "email": "dev@mehtafintech.io",
    "phone": "+91 99887 76655",
    "business_type": "SaaS & Tech",
    "service_interest": "Custom software",
    "problem": "We require a high-throughput transaction ledger and client reconciliation portal.",
    "budget": "$15,000 - $50,000",
    "source": "Website",
    "priority": "HIGH",
    "estimated_value": 25000.0,
    "consent": True
}

def test_crm_status_transition_and_activity_logging(client, admin_headers):
    """Verify updating CRM status logs a STATUS_CHANGE activity automatically."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    # Transition from NEW to NEGOTIATION
    patch_res = client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "NEGOTIATION", "estimated_value": 30000.0},
        headers=admin_headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "NEGOTIATION"
    assert patch_res.json()["estimated_value"] == 30000.0

    # Fetch activities
    act_res = client.get(f"/api/leads/{lead_id}/activities", headers=admin_headers)
    assert act_res.status_code == 200
    activities = act_res.json()
    assert any(a["type"] == "STATUS_CHANGE" and "NEGOTIATION" in a["text"] for a in activities)

def test_crm_conversion_to_won_sets_timestamp(client, admin_headers):
    """Verify transitioning to WON sets converted_at timestamp."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    patch_res = client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "WON"},
        headers=admin_headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "WON"
    assert patch_res.json()["converted_at"] is not None

def test_crm_lost_reason_recording(client, admin_headers):
    """Verify recording lost_reason when deal is lost."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    patch_res = client.patch(
        f"/api/leads/{lead_id}",
        json={"status": "LOST", "lost_reason": "Client chose in-house engineering team"},
        headers=admin_headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "LOST"
    assert patch_res.json()["lost_reason"] == "Client chose in-house engineering team"

def test_crm_priority_updates(client, admin_headers):
    """Verify priority can be updated across all 4 levels."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    for prio in ["LOW", "MEDIUM", "HIGH", "URGENT"]:
        patch_res = client.patch(
            f"/api/leads/{lead_id}",
            json={"priority": prio},
            headers=admin_headers
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["priority"] == prio

def test_crm_activities_creation_and_retrieval(client, admin_headers):
    """Verify creating and retrieving various activity types (Note, Call, Email, WhatsApp, Meeting)."""
    res = client.post("/api/leads", json=LEAD_PAYLOAD)
    lead_id = res.json()["id"]

    # 1. Add a Call activity
    call_res = client.post(
        f"/api/leads/{lead_id}/activities",
        json={"type": "CALL", "text": "Spoke with Dev about architecture and timeline."},
        headers=admin_headers
    )
    assert call_res.status_code == 201
    assert call_res.json()["type"] == "CALL"
    assert call_res.json()["lead_id"] == lead_id

    # 2. Add an Email activity
    email_res = client.post(
        f"/api/leads/{lead_id}/activities",
        json={"type": "EMAIL", "text": "Sent proposal draft v1."},
        headers=admin_headers
    )
    assert email_res.status_code == 201

    # 3. Add a WhatsApp activity
    wa_res = client.post(
        f"/api/leads/{lead_id}/activities",
        json={"type": "WHATSAPP", "text": "Sent meeting reschedule request via WhatsApp."},
        headers=admin_headers
    )
    assert wa_res.status_code == 201

    # Retrieve all activities
    acts_res = client.get(f"/api/leads/{lead_id}/activities", headers=admin_headers)
    assert acts_res.status_code == 200
    acts = acts_res.json()
    assert len(acts) >= 3

def test_crm_follow_up_filtering(client, admin_headers):
    """Verify follow-up filtering: TODAY, OVERDUE, UPCOMING, NO_FOLLOWUP."""
    now = datetime.now(timezone.utc)
    today_iso = now.isoformat()
    overdue_iso = (now - timedelta(days=2)).isoformat()
    upcoming_iso = (now + timedelta(days=3)).isoformat()

    # Lead 1: Overdue
    client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "Overdue Lead",
        "email": "overdue@example.com",
        "next_follow_up_at": overdue_iso
    })
    # Lead 2: Due Today
    client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "Today Lead",
        "email": "today@example.com",
        "next_follow_up_at": today_iso
    })
    # Lead 3: Upcoming
    client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "Upcoming Lead",
        "email": "upcoming@example.com",
        "next_follow_up_at": upcoming_iso
    })
    # Lead 4: No follow-up
    client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "No Followup Lead",
        "email": "nofollowup@example.com",
        "next_follow_up_at": None
    })

    # Test OVERDUE filter
    overdue_res = client.get("/api/leads?follow_up_filter=OVERDUE", headers=admin_headers)
    assert overdue_res.status_code == 200
    assert any(l["name"] == "Overdue Lead" for l in overdue_res.json())

    # Test TODAY filter
    today_res = client.get("/api/leads?follow_up_filter=TODAY", headers=admin_headers)
    assert today_res.status_code == 200
    assert any(l["name"] == "Today Lead" for l in today_res.json())

    # Test UPCOMING filter
    upcoming_res = client.get("/api/leads?follow_up_filter=UPCOMING", headers=admin_headers)
    assert upcoming_res.status_code == 200
    assert any(l["name"] == "Upcoming Lead" for l in upcoming_res.json())

    # Test NO_FOLLOWUP filter
    none_res = client.get("/api/leads?follow_up_filter=NO_FOLLOWUP", headers=admin_headers)
    assert none_res.status_code == 200
    assert any(l["name"] == "No Followup Lead" for l in none_res.json())

def test_crm_sorting_and_advanced_filters(client, admin_headers):
    """Verify sorting by value_desc and follow_up_asc, and filtering by source and priority."""
    now = datetime.now(timezone.utc)
    client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "Low Deal",
        "email": "low@example.com",
        "source": "Referral",
        "priority": "LOW",
        "estimated_value": 5000.0,
        "next_follow_up_at": (now + timedelta(days=5)).isoformat()
    })
    client.post("/api/leads", json={
        **LEAD_PAYLOAD,
        "name": "High Deal",
        "email": "high@example.com",
        "source": "LinkedIn",
        "priority": "URGENT",
        "estimated_value": 75000.0,
        "next_follow_up_at": (now + timedelta(days=1)).isoformat()
    })

    # Sort by value_desc
    val_res = client.get("/api/leads?sort_by=value_desc", headers=admin_headers)
    assert val_res.status_code == 200
    leads = val_res.json()
    assert leads[0]["estimated_value"] >= leads[1]["estimated_value"]

    # Filter by source=LinkedIn
    source_res = client.get("/api/leads?source=LinkedIn", headers=admin_headers)
    assert source_res.status_code == 200
    assert len(source_res.json()) == 1
    assert source_res.json()[0]["name"] == "High Deal"

    # Filter by priority=URGENT
    prio_res = client.get("/api/leads?priority=URGENT", headers=admin_headers)
    assert prio_res.status_code == 200
    assert len(prio_res.json()) == 1
    assert prio_res.json()[0]["name"] == "High Deal"

def test_crm_sales_metrics_calculations(client, admin_headers):
    """Verify accurate CRM sales pipeline metrics calculation."""
    # Lead 1: Active in PROPOSAL with 10k
    r1 = client.post("/api/leads", json={**LEAD_PAYLOAD, "email": "d1@example.com", "estimated_value": 10000.0})
    client.patch(f"/api/leads/{r1.json()['id']}", json={"status": "PROPOSAL"}, headers=admin_headers)

    # Lead 2: Active in NEGOTIATION with 20k
    r2 = client.post("/api/leads", json={**LEAD_PAYLOAD, "email": "d2@example.com", "estimated_value": 20000.0})
    client.patch(f"/api/leads/{r2.json()['id']}", json={"status": "NEGOTIATION"}, headers=admin_headers)

    # Lead 3: WON with 50k
    r3 = client.post("/api/leads", json={**LEAD_PAYLOAD, "email": "d3@example.com", "estimated_value": 50000.0})
    client.patch(f"/api/leads/{r3.json()['id']}", json={"status": "WON"}, headers=admin_headers)

    # Lead 4: LOST
    r4 = client.post("/api/leads", json={**LEAD_PAYLOAD, "email": "d4@example.com", "estimated_value": 15000.0})
    client.patch(f"/api/leads/{r4.json()['id']}", json={"status": "LOST"}, headers=admin_headers)

    metrics_res = client.get("/api/leads/crm-stats", headers=admin_headers)
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()

    assert metrics["active_deals_count"] == 2
    assert metrics["total_pipeline_value"] == 30000.0
    assert metrics["proposal_count"] == 1
    assert metrics["negotiation_count"] == 1
    assert metrics["won_count"] == 1
    assert metrics["won_value"] == 50000.0
    assert metrics["lost_count"] == 1
    assert metrics["win_rate_percentage"] == 50.0 # 1 won / (1 won + 1 lost) = 50%
    assert metrics["avg_deal_value"] == 50000.0

def test_unauthorized_crm_endpoints(client):
    """Verify CRM endpoints reject requests without admin token."""
    endpoints = [
        ("GET", "/api/leads/crm-stats"),
        ("GET", "/api/leads/1/activities"),
        ("POST", "/api/leads/1/activities")
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={"type": "NOTE", "text": "Test note"})
        assert res.status_code == 401, f"{method} {path} should return 401"
