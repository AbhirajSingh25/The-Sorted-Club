import os
import sys
import smtplib
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Set test environment variables BEFORE importing application modules
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ADMIN_USERNAME"] = "testadmin"
os.environ["ADMIN_PASSWORD"] = "testpassword123"
os.environ["ADMIN_SECRET_KEY"] = "test_secret_key_for_testing_purposes_only_2026"
os.environ["EMAIL_NOTIFICATIONS_ENABLED"] = "false"
os.environ["SMTP_PASSWORD"] = ""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from database import Base, get_db
import models
from main import app
from auth import create_access_token

# In-memory test SQLite engine with StaticPool so all connections share the same memory instance
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def block_unmocked_real_smtp_connections(monkeypatch):
    """
    FAIL-SAFE NETWORK GUARD:
    Guarantees that automated tests can NEVER establish real network connections via SMTP.
    If any test or application component attempts an unmocked smtplib.SMTP.connect
    or smtplib.SMTP_SSL.connect, this fixture raises a RuntimeError immediately.
    """
    def guarded_connect(self, host="localhost", port=0, source_address=None, timeout=None):
        raise RuntimeError(
            f"CRITICAL SECURITY VIOLATION: Automated test attempted real SMTP network connection to {host}:{port}. "
            "Tests must never send real emails. All SMTP transports in test suite must be mocked."
        )

    monkeypatch.setattr(smtplib.SMTP, "connect", guarded_connect)
    monkeypatch.setattr(smtplib.SMTP_SSL, "connect", guarded_connect)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database schema for each test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_headers():
    """Generate valid Authorization headers for admin."""
    token = create_access_token("testadmin")
    return {"Authorization": f"Bearer {token}"}
