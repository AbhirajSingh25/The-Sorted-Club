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

# Load .env on module import
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_admin_username() -> str:
    return os.getenv("ADMIN_USERNAME", "admin")

def get_admin_password() -> str:
    return os.getenv("ADMIN_PASSWORD", "sorted_admin_2026")

def get_admin_secret_key() -> str:
    return os.getenv("ADMIN_SECRET_KEY", "sorted_club_super_secret_jwt_key_2026")

security = HTTPBearer(auto_error=False)

def authenticate_admin(username: str, password: str) -> bool:
    """
    Check if provided username and password match configured admin credentials.
    Uses timing-safe comparisons to protect against timing attacks.
    """
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
    payload = {
        "sub": username,
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
    return payload.get("sub", get_admin_username())
