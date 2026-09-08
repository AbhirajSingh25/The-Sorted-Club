import os
import logging
import secrets
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("the_sorted_club.database")

# Load environment variables from .env in backend directory (override only in non-test modes)
env_path = Path(__file__).resolve().parent / ".env"
is_test = os.environ.get("APP_ENV") == "test"
load_dotenv(dotenv_path=env_path, override=not is_test)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sorted_club.db")


def create_db_engine(db_url: str = DATABASE_URL):
    """
    Creates a database engine configured appropriately for the target database:
    - PostgreSQL: connection pooling (pool_size=10, max_overflow=20), pool_pre_ping=True, pool_recycle=3600.
    - SQLite: check_same_thread=False, WAL journal mode, foreign keys ON.
    """
    if db_url.startswith("postgresql") or db_url.startswith("postgres"):
        return create_engine(
            db_url,
            pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
            max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )
    else:
        # SQLite configuration with 30s busy timeout for concurrent transactions
        connect_args = {"check_same_thread": False, "timeout": 30} if db_url.startswith("sqlite") else {}
        eng = create_engine(
            db_url,
            connect_args=connect_args,
            echo=False
        )

        # Enable WAL mode and foreign keys ONLY for SQLite disk databases
        if db_url.startswith("sqlite") and ":memory:" not in db_url:
            @event.listens_for(eng, "connect")
            def set_sqlite_pragma(dbapi_connection, connection_record):
                cursor = dbapi_connection.cursor()
                try:
                    cursor.execute("PRAGMA journal_mode=WAL")
                    cursor.execute("PRAGMA foreign_keys=ON")
                    cursor.execute("PRAGMA synchronous=NORMAL")
                except Exception as e:
                    logger.debug(f"SQLite PRAGMA setup notice: {e}")
                finally:
                    cursor.close()

        return eng


engine = create_db_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def upgrade_schema(db_engine):
    """
    Non-destructive schema migration for SQLite and SQL databases.
    Creates missing tables (clients, client_onboarding_items, lead_activities, payment_confirmations, projects, etc.).
    Dynamically adds missing columns for SQLite local development without destructive recreation.
    On PostgreSQL, schema creation is database-agnostic.
    """
    # 1. Create any missing tables defined in metadata
    Base.metadata.create_all(bind=db_engine)

    # 2. For SQLite development, safely alter tables to add any missing columns if needed
    if db_engine.dialect.name == "sqlite":
        crm_columns = [
            ("source", "VARCHAR(100) DEFAULT 'Website'"),
            ("utm_source", "VARCHAR(100)"),
            ("utm_medium", "VARCHAR(100)"),
            ("utm_campaign", "VARCHAR(100)"),
            ("utm_content", "VARCHAR(100)"),
            ("referral_source", "VARCHAR(100)"),
            ("priority", "VARCHAR(50) DEFAULT 'MEDIUM'"),
            ("assigned_to", "VARCHAR(100)"),
            ("estimated_value", "FLOAT"),
            ("next_follow_up_at", "DATETIME"),
            ("last_contacted_at", "DATETIME"),
            ("notes", "TEXT"),
            ("qualification_notes", "TEXT"),
            ("decision_maker", "VARCHAR(255)"),
            ("budget_fit", "VARCHAR(100)"),
            ("timeline", "VARCHAR(100)"),
            ("lost_reason", "TEXT"),
            ("converted_at", "DATETIME"),
            ("relevant_template", "VARCHAR(100)"),
            ("problem_noticed", "TEXT"),
            ("has_real_business", "BOOLEAN DEFAULT 0"),
            ("has_clear_need", "BOOLEAN DEFAULT 0"),
            ("has_budget", "BOOLEAN DEFAULT 0"),
            ("has_timeline", "BOOLEAN DEFAULT 0"),
            ("is_decision_maker", "BOOLEAN DEFAULT 0"),
            ("responds_communication", "BOOLEAN DEFAULT 0"),
            ("qualification_score", "INTEGER DEFAULT 0")
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

                # Check existing columns in proposals table
                prop_result = conn.execute(text("PRAGMA table_info(proposals)"))
                prop_cols = {row[1] for row in prop_result.fetchall()}
                if prop_cols and "payment_schedule" not in prop_cols:
                    conn.execute(text("ALTER TABLE proposals ADD COLUMN payment_schedule JSON"))
                    conn.commit()

                # Check existing columns in lead_activities table
                act_result = conn.execute(text("PRAGMA table_info(lead_activities)"))
                act_rows = act_result.fetchall()
                act_cols = {row[1] for row in act_rows}
                lead_id_notnull = any(row[1] == "lead_id" and row[3] == 1 for row in act_rows)
                if act_cols and "client_id" not in act_cols:
                    conn.execute(text("ALTER TABLE lead_activities ADD COLUMN client_id INTEGER"))
                    conn.commit()

                if lead_id_notnull:
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS lead_activities_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            lead_id INTEGER,
                            client_id INTEGER,
                            type VARCHAR(50) NOT NULL,
                            text TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            created_by VARCHAR(100),
                            FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE,
                            FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
                        )
                    """))
                    conn.execute(text("""
                        INSERT INTO lead_activities_new (id, lead_id, client_id, type, text, created_at, created_by)
                        SELECT id, lead_id, client_id, type, text, created_at, created_by FROM lead_activities
                    """))
                    conn.execute(text("DROP TABLE lead_activities"))
                    conn.execute(text("ALTER TABLE lead_activities_new RENAME TO lead_activities"))
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

                # Check existing columns in projects table
                proj_result = conn.execute(text("PRAGMA table_info(projects)"))
                proj_cols = {row[1] for row in proj_result.fetchall()}
                if proj_cols:
                    if "waiting_for" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN waiting_for TEXT"))
                    if "proposal_id" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN proposal_id INTEGER"))
                    if "contract_id" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN contract_id INTEGER"))
                    if "invoice_id" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN invoice_id INTEGER"))
                    if "public_token" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN public_token VARCHAR(100)"))
                    if "health" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN health VARCHAR(50) DEFAULT 'ON_TRACK'"))
                    if "handover_checklist" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN handover_checklist JSON"))
                    if "handover_notes" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN handover_notes TEXT"))
                    if "handover_completed_at" not in proj_cols:
                        conn.execute(text("ALTER TABLE projects ADD COLUMN handover_completed_at DATETIME"))
                    conn.commit()

                    # Backfill projects with missing public_token
                    p_rows = conn.execute(text("SELECT id FROM projects WHERE public_token IS NULL OR public_token = ''")).fetchall()
                    for pr in p_rows:
                        conn.execute(
                            text("UPDATE projects SET public_token = :tok WHERE id = :id"),
                            {"tok": secrets.token_urlsafe(24), "id": pr[0]}
                        )
                    conn.commit()

            except Exception as e:
                logger.warning(f"Schema upgrade notice: {e}")


def get_db():
    """Dependency that yields a database session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
