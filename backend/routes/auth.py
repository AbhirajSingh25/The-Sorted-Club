from fastapi import APIRouter, HTTPException, status, Depends, Request
from schemas import AdminLoginRequest, AdminLoginResponse
from auth import authenticate_admin, create_access_token, get_current_admin
from rate_limiter import limiter

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(creds: AdminLoginRequest, request: Request):
    """
    Authenticate admin credentials and return signed session token.
    Credentials are validated against environment variables on backend.
    Rate limited to 10 attempts per minute per IP.
    """
    limiter.check(request, "admin_login", max_requests=10, window_seconds=60)

    if not authenticate_admin(creds.username, creds.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    
    token = create_access_token(creds.username)
    return AdminLoginResponse(
        access_token=token,
        token_type="bearer",
        username=creds.username
    )

@router.get("/verify")
def verify_admin_session(admin_user: str = Depends(get_current_admin)):
    """
    Verify existing admin session token.
    """
    return {"status": "authenticated", "username": admin_user}
