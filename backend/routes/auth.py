import re
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
from models import AdminUser, AdminPushSubscription
from schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminChangeUsernameRequest,
    AdminChangePasswordRequest,
    AdminCredentialChangeResponse,
    AdminSettingsOut
)
from auth import (
    authenticate_admin,
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
    get_admin_username,
    get_admin_password
)
from rate_limiter import limiter
from services.notification_service import get_email_config
from services.push_service import get_vapid_config

router = APIRouter(prefix="/api/admin", tags=["Admin Auth & Security"])


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(creds: AdminLoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticate admin credentials against database store (with fallback to environment).
    Rate limited to 10 attempts per minute per IP.
    """
    limiter.check(request, "admin_login", max_requests=10, window_seconds=60)

    if not authenticate_admin(creds.username, creds.password, db=db):
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


@router.post("/change-username", response_model=AdminCredentialChangeResponse)
def change_admin_username(
    req: AdminChangeUsernameRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_admin)
):
    """
    Securely update the admin login identifier (username/email).
    Requires current password verification.
    Persists to database AdminUser table.
    """
    limiter.check(request, "admin_cred_change", max_requests=5, window_seconds=60)

    # 1. Verify current password
    if not authenticate_admin(current_user, req.current_password, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password verification failed."
        )

    new_user = req.new_username.strip()
    if len(new_user) < 3 or len(new_user) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New username must be between 3 and 100 characters."
        )

    # Check collision
    existing = db.query(AdminUser).filter(AdminUser.username == new_user).first()
    if existing and existing.username != current_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An admin account with this username already exists."
        )

    # 2. Update or create authoritative AdminUser record in database
    admin_record = db.query(AdminUser).filter(AdminUser.username == current_user).first()
    if not admin_record:
        # If transitioning from environment variable, create record with hashed current password
        admin_record = AdminUser(
            username=new_user,
            password_hash=hash_password(req.current_password)
        )
        db.add(admin_record)
    else:
        admin_record.username = new_user

    # Also update any push subscriptions associated with old username
    db.query(AdminPushSubscription).filter(
        AdminPushSubscription.admin_username == current_user
    ).update({"admin_username": new_user})

    db.commit()
    db.refresh(admin_record)

    # Issue new token with updated username
    new_token = create_access_token(new_user)

    return AdminCredentialChangeResponse(
        message="Admin username updated successfully. Please use your new identifier for future logins.",
        access_token=new_token,
        username=new_user,
        token_type="bearer"
    )


@router.post("/change-password", response_model=AdminCredentialChangeResponse)
def change_admin_password(
    req: AdminChangePasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_admin)
):
    """
    Securely update the admin password.
    Requires current password verification and enforces reasonable password standards.
    Hashes new password with PBKDF2-HMAC-SHA256.
    """
    limiter.check(request, "admin_cred_change", max_requests=5, window_seconds=60)

    # 1. Verify current password
    if not authenticate_admin(current_user, req.current_password, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password verification failed."
        )

    # 2. Validate new password
    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    if req.confirm_password is not None and req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match."
        )

    if req.new_password == req.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password."
        )

    # 3. Hash new password securely
    new_hash = hash_password(req.new_password)

    # 4. Update or create authoritative AdminUser record in database
    admin_record = db.query(AdminUser).filter(AdminUser.username == current_user).first()
    if not admin_record:
        admin_record = AdminUser(
            username=current_user,
            password_hash=new_hash
        )
        db.add(admin_record)
    else:
        admin_record.password_hash = new_hash

    db.commit()
    db.refresh(admin_record)

    # Issue refreshed access token
    new_token = create_access_token(current_user)

    return AdminCredentialChangeResponse(
        message="Admin password updated successfully. Your new password is now active.",
        access_token=new_token,
        username=current_user,
        token_type="bearer"
    )


@router.get("/settings", response_model=AdminSettingsOut)
def get_admin_settings(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_admin)
):
    """
    Returns operational health and notification configuration status for the authenticated admin.
    Excludes all secret keys, passwords, and connection strings.
    """
    email_cfg = get_email_config()
    vapid_cfg = get_vapid_config()

    # Check database connectivity
    db_connected = True
    active_push_count = 0
    try:
        active_push_count = db.query(AdminPushSubscription).filter(
            AdminPushSubscription.is_active == True
        ).count()
    except Exception:
        db_connected = False

    return AdminSettingsOut(
        username=current_user,
        email_configured=bool(email_cfg.get("password")),
        email_enabled=bool(email_cfg.get("enabled")),
        business_email=email_cfg.get("business_email", "thesortedclub@gmail.com"),
        push_configured=vapid_cfg.get("configured", False),
        active_push_subscriptions_count=active_push_count,
        db_connected=db_connected,
        app_version="v2.4.0",
        environment=email_cfg.get("app_env", "development")
    )
