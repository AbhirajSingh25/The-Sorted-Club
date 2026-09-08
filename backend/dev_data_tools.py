"""
The Sorted Club — Dev Data Management Tool
Utility script to inspect and safely clean synthetic / test records from SQLite.
Strictly disabled in production mode.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from database import engine, SessionLocal
from models import Lead, Client, Proposal, Contract, Invoice, Payment, PaymentConfirmation, Project, Notification, EmailLog

def assert_non_production():
    app_env = os.getenv("APP_ENV", "development").lower()
    if app_env == "production":
        raise RuntimeError("CRITICAL ERROR: Destructive dev tools and data resets are strictly forbidden in production mode.")

def inspect_database():
    db = SessionLocal()
    try:
        leads_count = db.query(Lead).count()
        clients_count = db.query(Client).count()
        proposals_count = db.query(Proposal).count()
        contracts_count = db.query(Contract).count()
        invoices_count = db.query(Invoice).count()
        payments_count = db.query(Payment).count()
        confirmations_count = db.query(PaymentConfirmation).count()
        projects_count = db.query(Project).count()
        notifications_count = db.query(Notification).count()
        email_logs_count = db.query(EmailLog).count()

        print("\n=== THE SORTED CLUB DATABASE INVENTORY ===")
        print(f"Leads:                  {leads_count}")
        print(f"Clients:                {clients_count}")
        print(f"Proposals:              {proposals_count}")
        print(f"Contracts:              {contracts_count}")
        print(f"Invoices:               {invoices_count}")
        print(f"Payments:               {payments_count}")
        print(f"Payment Confirmations:  {confirmations_count}")
        print(f"Projects:               {projects_count}")
        print(f"Notifications:          {notifications_count}")
        print(f"Email Logs:             {email_logs_count}")
        print("==========================================\n")

        leads = db.query(Lead).all()
        print("Existing Leads:")
        for l in leads:
            print(f"  [{l.id}] {l.name} | {l.business_name} | {l.email} | Status: {l.status} | Source: {l.source}")
    finally:
        db.close()

def clean_test_leads():
    """
    Safely prunes demo / synthetic leads (names containing 'test' or emails containing 'example.com' or 'test').
    Keeps all production records intact.
    Strictly blocked in production.
    """
    assert_non_production()
    db = SessionLocal()
    try:
        test_leads = db.query(Lead).filter(
            (Lead.email.ilike("%example.com")) |
            (Lead.email.ilike("%test%")) |
            (Lead.name.ilike("%test%"))
        ).all()

        if not test_leads:
            print("No test leads found to clean.")
            return

        print(f"Found {len(test_leads)} synthetic test leads:")
        for l in test_leads:
            print(f"  Removing: [{l.id}] {l.name} ({l.email})")
            db.delete(l)

        db.commit()
        print("Successfully cleaned synthetic test leads.")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "clean":
        clean_test_leads()
    else:
        inspect_database()
