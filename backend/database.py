import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env in backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sorted_club.db")

# For SQLite, check_same_thread is required to allow requests across multiple threads
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Enable WAL mode and foreign keys for SQLite database resilience and concurrency
if DATABASE_URL.startswith("sqlite") and ":memory:" not in DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA synchronous=NORMAL")
        except Exception:
            pass
        finally:
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

import secrets

def upgrade_schema(db_engine):
    """
    Non-destructive schema migration for SQLite and SQL databases.
    Creates missing tables (clients, client_onboarding_items, lead_activities, payment_confirmations).
    Dynamically adds missing columns to existing tables.
    Preserves 100% of existing lead, CRM, and commercial data without destructive recreation.
    """
    # 1. Create any missing tables defined in metadata
    Base.metadata.create_all(bind=db_engine)

    # 2. For SQLite, safely alter tables to add any missing columns
    crm_columns = [
        ("source", "VARCHAR(100) DEFAULT 'Website'"),
        ("priority", "VARCHAR(50) DEFAULT 'MEDIUM'"),
        ("assigned_to", "VARCHAR(100)"),
        ("estimated_value", "FLOAT"),
        ("next_follow_up_at", "DATETIME"),
        ("last_contacted_at", "DATETIME"),
        ("notes", "TEXT"),
        ("lost_reason", "TEXT"),
        ("converted_at", "DATETIME")
    ]

    with db_engine.connect() as conn:
        try:
            # Check existing columns in leads table
            result = conn.execute(text("PRAGMA table_info(leads)"))
            existing_cols = {row[1] for row in result.fetchall()}
            if existing_cols:
                for col_name, col_type in crm_columns:
                    if col_name not in existing_cols:
                        conn.execute(text(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}"))
                conn.commit()

            # Check existing columns in lead_activities table
            act_result = conn.execute(text("PRAGMA table_info(lead_activities)"))
            act_cols = {row[1] for row in act_result.fetchall()}
            if act_cols and "client_id" not in act_cols:
                conn.execute(text("ALTER TABLE lead_activities ADD COLUMN client_id INTEGER"))
                conn.commit()

            # Check existing columns in contracts table
            contract_result = conn.execute(text("PRAGMA table_info(contracts)"))
            contract_cols = {row[1] for row in contract_result.fetchall()}
            if contract_cols:
                if "secure_token" not in contract_cols:
                    conn.execute(text("ALTER TABLE contracts ADD COLUMN secure_token VARCHAR(100)"))
                if "accepted_by_name" not in contract_cols:
                    conn.execute(text("ALTER TABLE contracts ADD COLUMN accepted_by_name VARCHAR(255)"))
                if "accepted_by_email" not in contract_cols:
                    conn.execute(text("ALTER TABLE contracts ADD COLUMN accepted_by_email VARCHAR(255)"))
                conn.commit()

                # Backfill contracts with missing secure_token
                rows = conn.execute(text("SELECT id FROM contracts WHERE secure_token IS NULL OR secure_token = ''")).fetchall()
                for r in rows:
                    conn.execute(
                        text("UPDATE contracts SET secure_token = :tok WHERE id = :id"),
                        {"tok": secrets.token_urlsafe(32), "id": r[0]}
                    )
                conn.commit()

            # Check existing columns in invoices table
            invoice_result = conn.execute(text("PRAGMA table_info(invoices)"))
            invoice_cols = {row[1] for row in invoice_result.fetchall()}
            if invoice_cols:
                if "secure_token" not in invoice_cols:
                    conn.execute(text("ALTER TABLE invoices ADD COLUMN secure_token VARCHAR(100)"))
                conn.commit()

                # Backfill invoices with missing secure_token
                rows = conn.execute(text("SELECT id FROM invoices WHERE secure_token IS NULL OR secure_token = ''")).fetchall()
                for r in rows:
                    conn.execute(
                        text("UPDATE invoices SET secure_token = :tok WHERE id = :id"),
                        {"tok": secrets.token_urlsafe(32), "id": r[0]}
                    )
                conn.commit()

        except Exception:
            pass

def get_db():
    """Dependency that yields a database session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
