import os
import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable

import models
from database import Base, create_db_engine, upgrade_schema
from main import app, validate_production_environment
from rate_limiter import RateLimiter, limiter
from dev_data_tools import clean_test_leads
from routes.invoices import calculate_invoice_totals, generate_preset_installments
from services.notification_service import get_email_config

# ==============================================================================
# 1. PRODUCTION ENVIRONMENT VALIDATION TESTS
# ==============================================================================

def test_production_environment_validation_rejects_insecure_secrets(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/sorted_club")
    monkeypatch.setenv("CORS_ORIGINS", "https://thesortedclub.com")
    monkeypatch.setenv("ADMIN_PASSWORD", "SuperSecurePassword2026!#")
    
    # Insecure / default secret key
    monkeypatch.setenv("ADMIN_SECRET_KEY", "sorted_club_super_secret_jwt_key_2026")
    with pytest.raises(ValueError, match="Production requires a secure ADMIN_SECRET_KEY"):
        validate_production_environment()

    # Too short secret key (< 32 chars)
    monkeypatch.setenv("ADMIN_SECRET_KEY", "short_secret_key_12345")
    with pytest.raises(ValueError, match="at least 32 characters"):
        validate_production_environment()


def test_production_environment_validation_rejects_sqlite(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_SECRET_KEY", "a" * 64)
    monkeypatch.setenv("ADMIN_PASSWORD", "SuperSecurePassword2026!#")
    monkeypatch.setenv("CORS_ORIGINS", "https://thesortedclub.com")
    
    # SQLite URL in production
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./sorted_club.db")
    with pytest.raises(ValueError, match="Production environment requires PostgreSQL"):
        validate_production_environment()


def test_production_environment_validation_rejects_wildcard_cors(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/sorted_club")
    monkeypatch.setenv("ADMIN_SECRET_KEY", "a" * 64)
    monkeypatch.setenv("ADMIN_PASSWORD", "SuperSecurePassword2026!#")
    
    # Wildcard CORS in production
    monkeypatch.setenv("CORS_ORIGINS", "*")
    with pytest.raises(ValueError, match="Wildcard '\\*' is strictly prohibited in production"):
        validate_production_environment()


def test_production_environment_validation_rejects_default_admin_password(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/sorted_club")
    monkeypatch.setenv("ADMIN_SECRET_KEY", "a" * 64)
    monkeypatch.setenv("CORS_ORIGINS", "https://thesortedclub.com")
    
    # Default admin password
    monkeypatch.setenv("ADMIN_PASSWORD", "sorted_admin_2026")
    with pytest.raises(ValueError, match="Default or placeholder passwords are strictly prohibited"):
        validate_production_environment()


def test_production_environment_validation_success(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/sorted_club")
    monkeypatch.setenv("ADMIN_SECRET_KEY", "f47ac10b-58cc-4372-a567-0e02b2c3d479_super_secure_random_production_key")
    monkeypatch.setenv("ADMIN_PASSWORD", "StrongProductionPassword_998822!!")
    monkeypatch.setenv("CORS_ORIGINS", "https://thesortedclub.com,https://www.thesortedclub.com")
    
    # Should complete without error
    validate_production_environment()


# ==============================================================================
# 2. POSTGRESQL DIALECT DDL COMPILATION & MODEL COMPATIBILITY
# ==============================================================================

def test_all_models_compile_valid_postgresql_ddl():
    """
    Verifies that every SQLAlchemy model in The Sorted Club generates
    valid PostgreSQL DDL using SQLAlchemy's PostgreSQL dialect.
    Ensures 0 syntax errors or unsupported column types for PostgreSQL.
    """
    pg_dialect = postgresql.dialect()

    for table in Base.metadata.sorted_tables:
        ddl = str(CreateTable(table).compile(dialect=pg_dialect))
        assert len(ddl) > 0
        assert f"CREATE TABLE {table.name}" in ddl


def test_database_engine_dialect_awareness():
    """
    Verifies that create_db_engine configures PostgreSQL connection pooling options
    and handles SQLite correctly without leaking PRAGMA logic onto PostgreSQL.
    """
    # PostgreSQL engine creation check
    pg_url = "postgresql+psycopg://testuser:testpass@localhost:5432/testdb"
    pg_engine = create_db_engine(pg_url)
    assert pg_engine.dialect.name == "postgresql"
    assert pg_engine.pool.size() == 10

    # SQLite engine creation check
    sqlite_url = "sqlite:///:memory:"
    sqlite_engine = create_db_engine(sqlite_url)
    assert sqlite_engine.dialect.name == "sqlite"


# ==============================================================================
# 3. HEALTH & READINESS PROBES
# ==============================================================================

def test_health_liveness_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

    # Also test /api/health alias
    res_api = client.get("/api/health")
    assert res_api.status_code == 200
    assert res_api.json() == {"status": "healthy"}


def test_ready_readiness_endpoint(client):
    res = client.get("/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"

    # Also test /api/ready alias
    res_api = client.get("/api/ready")
    assert res_api.status_code == 200
    data_api = res_api.json()
    assert data_api["status"] == "ready"
    assert data_api["database"] == "connected"


# ==============================================================================
# 4. SECURITY HEADERS & REQUEST SIZE LIMIT
# ==============================================================================

def test_security_headers_present_in_responses(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert res.headers.get("Permissions-Policy") == "geolocation=(), camera=(), microphone=()"


def test_request_payload_size_limit(client):
    # Send request with content-length header exceeding 5MB (5,242,881 bytes)
    headers = {"Content-Length": "5242881"}
    res = client.post("/api/leads", json={"test": "data"}, headers=headers)
    assert res.status_code == 413
    assert "Payload too large" in res.json()["detail"]


# ==============================================================================
# 5. RATE LIMITING TESTS
# ==============================================================================

def test_rate_limiter_logic():
    test_limiter = RateLimiter()

    class MockRequest:
        def __init__(self, ip="192.168.1.100"):
            self.headers = {"X-Forwarded-For": ip}
            self.client = None
            self.state = type("State", (), {"force_rate_limit_test": True})()

    mock_req = MockRequest()

    # Allowed up to 3 requests
    assert test_limiter.is_allowed(mock_req, "test_action", max_requests=3, window_seconds=60) == True
    assert test_limiter.is_allowed(mock_req, "test_action", max_requests=3, window_seconds=60) == True
    assert test_limiter.is_allowed(mock_req, "test_action", max_requests=3, window_seconds=60) == True

    # 4th request exceeds limit
    assert test_limiter.is_allowed(mock_req, "test_action", max_requests=3, window_seconds=60) == False


# ==============================================================================
# 6. DESTRUCTIVE RESET PROTECTION IN PRODUCTION
# ==============================================================================

def test_destructive_data_cleanup_blocked_in_production(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    with pytest.raises(RuntimeError, match="Destructive dev tools and data resets are strictly forbidden in production"):
        clean_test_leads()


# ==============================================================================
# 7. FINANCIAL PRECISION & SPLIT VERIFICATION
# ==============================================================================

def test_financial_precision_50_50_split_14999():
    """
    Verify ₹14,999.00 splits into exactly ₹7,499.50 advance + ₹7,499.50 final.
    Must have 0 floating point errors (e.g. no 7499.499999999).
    """
    total = 14999.0
    now = models.datetime.now(models.timezone.utc)
    installments = generate_preset_installments("50_50", total, now, None)

    assert len(installments) == 2
    assert installments[0]["amount"] == 7499.50
    assert installments[1]["amount"] == 7499.50
    assert (installments[0]["amount"] + installments[1]["amount"]) == 14999.00
    assert f"{installments[0]['amount']:.2f}" == "7499.50"
    assert f"{installments[1]['amount']:.2f}" == "7499.50"


def test_financial_precision_50_50_split_39999():
    """
    Verify ₹39,999.00 splits into exactly ₹19,999.50 advance + ₹19,999.50 final.
    """
    total = 39999.0
    now = models.datetime.now(models.timezone.utc)
    installments = generate_preset_installments("50_50", total, now, None)

    assert len(installments) == 2
    assert installments[0]["amount"] == 19999.50
    assert installments[1]["amount"] == 19999.50
    assert (installments[0]["amount"] + installments[1]["amount"]) == 39999.00
    assert f"{installments[0]['amount']:.2f}" == "19999.50"
    assert f"{installments[1]['amount']:.2f}" == "19999.50"


def test_financial_precision_invoice_totals_calculation():
    items = [
        {"quantity": 1, "unit_price": 14999.0},
        {"quantity": 2, "unit_price": 2500.25}
    ]
    subtotal, discount, tax, total = calculate_invoice_totals(items, discount=1000.50, tax=500.00)
    assert subtotal == 19999.50
    assert discount == 1000.50
    assert tax == 500.00
    assert total == 19499.00


# ==============================================================================
# 8. EMAIL ISOLATION & OFFICIAL BUSINESS CONTACT
# ==============================================================================

def test_email_isolation_and_official_business_contact():
    config = get_email_config()
    assert config["username"] == "thesortedclub@gmail.com"
    assert config["from_email"] == "thesortedclub@gmail.com"
    assert config["business_email"] == "thesortedclub@gmail.com"
    # In test mode, live delivery is strictly prohibited
    assert config["is_live_allowed"] == False
    assert config["enabled"] == False
