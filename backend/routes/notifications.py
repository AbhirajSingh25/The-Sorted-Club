import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import Notification, EmailLog, AdminPushSubscription, PushLog
from schemas import (
    NotificationOut,
    NotificationListOut,
    EmailLogOut,
    VapidPublicKeyResponse,
    PushSubscriptionCreate,
    PushSubscriptionDelete,
    PushLogOut
)
from auth import get_current_admin
from rate_limiter import limiter
from services.push_service import get_vapid_config, send_web_push

logger = logging.getLogger("the_sorted_club.notifications")
router = APIRouter(prefix="/api/notifications", tags=["Admin Notifications & Push"])


@router.get("", response_model=NotificationListOut)
def get_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Max notifications to retrieve"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Fetch admin notifications list and total unread count.
    """
    try:
        query = db.query(Notification)
        unread_count = db.query(Notification).filter(Notification.is_read == False).count()
        total_count = db.query(Notification).count()

        if unread_only:
            query = query.filter(Notification.is_read == False)

        notifications = query.order_by(desc(Notification.created_at)).limit(limit).all()

        return NotificationListOut(
            notifications=notifications,
            unread_count=unread_count,
            total_count=total_count
        )
    except Exception as e:
        logger.error(f"Failed to fetch notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notifications."
        )


@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Mark all unread notifications as read.
    """
    try:
        updated = db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
        db.commit()
        return {"message": "All notifications marked as read.", "count": updated}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read."
        )


@router.get("/email-logs", response_model=List[EmailLogOut])
def get_email_logs(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: View delivery log history of automated notifications.
    """
    try:
        logs = db.query(EmailLog).order_by(desc(EmailLog.sent_at)).limit(limit).all()
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch email logs."
        )


@router.post("/test-email", status_code=status.HTTP_200_OK)
def trigger_test_email(
    request: Request,
    recipient: Optional[str] = Query(None, description="Optional custom recipient email"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Run live SMTP connectivity & delivery diagnostic test.
    Rate limited to 5 requests per minute.
    """
    limiter.check(request, "diagnostic_email", max_requests=5, window_seconds=60)
    from services.notification_service import test_smtp_delivery
    return test_smtp_delivery(recipient=recipient, db=db)


# ==============================================================================
# WEB PUSH & DEVICE SUBSCRIPTION ENDPOINTS (Static paths declared first)
# ==============================================================================

@router.get("/vapid-public-key", response_model=VapidPublicKeyResponse)
def get_vapid_public_key(_admin: str = Depends(get_current_admin)):
    """
    Protected endpoint: Return VAPID public key for browser push subscription setup.
    Never exposes the private key.
    """
    cfg = get_vapid_config()
    return VapidPublicKeyResponse(
        public_key=cfg["public_key"] if cfg["configured"] else None,
        configured=cfg["configured"]
    )


@router.post("/push-subscriptions", status_code=status.HTTP_201_CREATED)
def register_push_subscription(
    sub_in: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Register or re-activate a Web Push subscription for this device.
    """
    try:
        existing = db.query(AdminPushSubscription).filter(
            AdminPushSubscription.endpoint == sub_in.endpoint
        ).first()

        if existing:
            existing.p256dh = sub_in.keys.p256dh
            existing.auth = sub_in.keys.auth
            existing.user_agent = sub_in.user_agent
            existing.device_label = sub_in.device_label or existing.device_label
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            logger.info(f"Re-activated push subscription for endpoint: {sub_in.endpoint[:30]}...")
            return {"status": "subscribed", "message": "Subscription updated and active."}

        new_sub = AdminPushSubscription(
            endpoint=sub_in.endpoint,
            p256dh=sub_in.keys.p256dh,
            auth=sub_in.keys.auth,
            user_agent=sub_in.user_agent,
            device_label=sub_in.device_label,
            is_active=True
        )
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        logger.info(f"Registered new push subscription: {sub_in.endpoint[:30]}...")
        return {"status": "subscribed", "message": "Device successfully registered for Web Push notifications."}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save push subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register push subscription."
        )


@router.delete("/push-subscriptions", status_code=status.HTTP_200_OK)
async def delete_push_subscription(
    request: Request,
    endpoint: Optional[str] = Query(None, description="Endpoint to unsubscribe"),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Deactivate or remove a device push subscription.
    Accepts endpoint either as query parameter or in request JSON body.
    """
    target_endpoint = endpoint
    if not target_endpoint:
        try:
            body = await request.json()
            if isinstance(body, dict):
                target_endpoint = body.get("endpoint")
        except Exception:
            pass

    if not target_endpoint:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription endpoint is required."
        )

    try:
        sub = db.query(AdminPushSubscription).filter(
            AdminPushSubscription.endpoint == target_endpoint
        ).first()

        if sub:
            sub.is_active = False
            db.commit()
            return {"status": "unsubscribed", "message": "Device unregistered from push notifications."}
        return {"status": "not_found", "message": "Subscription endpoint not found."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete push subscription."
        )


@router.post("/test-push", status_code=status.HTTP_200_OK)
def trigger_test_push(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Send a test Web Push notification to registered admin devices.
    Rate limited to 5 requests per minute.
    """
    limiter.check(request, "test_push", max_requests=5, window_seconds=60)
    result = send_web_push(
        db=db,
        title="Push test",
        body=f"Web Push is actively delivering to your admin devices for {admin_user}.",
        url="/admin",
        tag="tsc-test-push",
        event_type="TEST_PUSH"
    )
    return result


@router.get("/push-logs", response_model=List[PushLogOut])
def get_push_logs(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: View delivery log history of Web Push notifications.
    """
    try:
        logs = db.query(PushLog).order_by(desc(PushLog.sent_at)).limit(limit).all()
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch push logs."
        )


# ==============================================================================
# PARAMETERIZED PATHS (Declared last to avoid shadowing static endpoints)
# ==============================================================================

@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Mark a specific notification as read.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification {notification_id} not found."
        )

    try:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification."
        )


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin)
):
    """
    Protected endpoint: Permanently delete a notification.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification {notification_id} not found."
        )

    try:
        db.delete(notification)
        db.commit()
        return {"message": f"Notification {notification_id} deleted."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification."
        )
