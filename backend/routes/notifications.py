import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import Notification, EmailLog
from schemas import NotificationOut, NotificationListOut, EmailLogOut
from auth import get_current_admin
from rate_limiter import limiter

logger = logging.getLogger("the_sorted_club.notifications")
router = APIRouter(prefix="/api/notifications", tags=["Admin Notifications"])


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

