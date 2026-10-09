import os
import time
import hmac
import hashlib
import base64
import json
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Load .env on module import (override only in non-test modes)
env_path = Path(__file__).resolve().parent / ".env"
is_test = os.environ.get("APP_ENV") == "test"
load_dotenv(dotenv_path=env_path, override=not is_test)

DEFAULT_INSECURE_SECRETS = {
    "sorted_club_super_secret_jwt_key_2026",
    "change_this_to_a_random_64_character_hex_secret_key",
    "secret",
    "jwt_secret",
    "default_secret"
}

DEFAULT_INSECURE_PASSWORDS = {
    "sorted_admin_2026",
    "change_this_to_a_secure_admin_password",
    "admin",
    "password",
    "123456"
}

def get_admin_username() -> str:
    return os.getenv("ADMIN_USERNAME", "admin")

def get_admin_password() -> str:
    return os.getenv("ADMIN_PASSWORD", "sorted_admin_2026")

def get_admin_secret_key() -> str:
    return os.getenv("ADMIN_SECRET_KEY") or os.getenv("JWT_SECRET") or "sorted_club_super_secret_jwt_key_2026"

def validate_production_auth_config():
    """
    Validates authentication settings for production mode.
    Raises ValueError if insecure defaults or weak keys are used.
    """
    app_env = os.getenv("APP_ENV", "development").lower()
    if app_env == "production":
        secret = get_admin_secret_key()
        if not secret or secret in DEFAULT_INSECURE_SECRETS or len(secret) < 32:
            raise ValueError(
                "CRITICAL SECURITY CONFIGURATION ERROR: Production requires a secure ADMIN_SECRET_KEY / JWT_SECRET "
                "with at least 32 characters. Default or placeholder secrets are strictly prohibited in production."
            )
        
        password = get_admin_password()
        if not password or password in DEFAULT_INSECURE_PASSWORDS or len(password) < 8:
            raise ValueError(
                "CRITICAL SECURITY CONFIGURATION ERROR: Production requires a strong ADMIN_PASSWORD. "
                "Default or placeholder passwords are strictly prohibited in production."
            )

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a cryptographically secure random salt.
    Format: pbkdf2_sha256$iterations$salt_hex$hash_hex
    """
    salt = os.urandom(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${derived.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against a PBKDF2-HMAC-SHA256 hash in constant time.
    """
    try:
        if not hashed or not hashed.startswith("pbkdf2_sha256$"):
            # If not PBKDF2 formatted (e.g. plaintext env comparison fallback)
            return hmac.compare_digest(password.encode("utf-8"), hashed.encode("utf-8"))
        
        parts = hashed.split("$")
        if len(parts) != 4:
            return False
        
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        expected_hash = parts[3]
        
        derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(derived.hex().encode("utf-8"), expected_hash.encode("utf-8"))
    except Exception:
        return False

def authenticate_admin(username: str, password: str, db=None) -> bool:
    """
    Check if provided username and password match admin credentials.
    First checks database AdminUser table if db session provided.
    Falls back to environment variables.
    Uses timing-safe comparisons to protect against timing attacks.
    """
    if db is not None:
        try:
            from models import AdminUser
            admin_record = db.query(AdminUser).filter(AdminUser.username == username.strip()).first()
            if admin_record and admin_record.password_hash:
                return verify_password(password, admin_record.password_hash)
            
            # If any AdminUser records exist in DB, only allow DB users
            any_admin = db.query(AdminUser).first()
            if any_admin:
                return False
        except Exception:
            # If database table not yet created, fall back to environment variables
            pass

    expected_username = get_admin_username()
    expected_password = get_admin_password()

    user_match = hmac.compare_digest(username.strip().encode("utf-8"), expected_username.strip().encode("utf-8"))
    pass_match = hmac.compare_digest(password.strip().encode("utf-8"), expected_password.strip().encode("utf-8"))
    return user_match and pass_match

def create_access_token(username: str, expires_in_seconds: int = 86400 * 7) -> str:
    """
    Create a signed HMAC-SHA256 session token valid for 7 days by default.
    """
    secret_key = get_admin_secret_key()
    sub_val = username if isinstance(username, str) else (username.get("sub", "admin") if isinstance(username, dict) else str(username))
    payload = {
        "sub": sub_val,
        "exp": int(time.time()) + expires_in_seconds,
        "iat": int(time.time())
    }
    payload_json = json.dumps(payload, separators=(',', ':'))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode('utf-8')).decode('utf-8').rstrip('=')
    
    signature = hmac.new(
        secret_key.encode('utf-8'),
        payload_b64.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"{payload_b64}.{signature}"

def verify_token(token: str) -> dict:
    """
    Verify HMAC-SHA256 session token signature and expiration.
    Returns the decoded token payload on success, or raises HTTPException 401.
    """
    try:
        parts = token.split('.')
        if len(parts) != 2:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token format.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        payload_b64, signature = parts
        secret_key = get_admin_secret_key()
        
        # Verify signature in constant time
        expected_sig = hmac.new(
            secret_key.encode('utf-8'),
            payload_b64.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature.encode("utf-8"), expected_sig.encode("utf-8")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Restore base64 padding
        padding_needed = len(payload_b64) % 4
        if padding_needed:
            payload_b64 += '=' * (4 - padding_needed)
            
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        # Check expiration
        if payload.get("exp", 0) < int(time.time()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session token has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Invalid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    FastAPI dependency to protect all admin endpoints.
    Requires a valid Bearer token in the Authorization header.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_token(credentials.credentials)
    sub = payload.get("sub", get_admin_username())
    if isinstance(sub, dict):
        return str(sub.get("sub", get_admin_username()))
    return str(sub)
