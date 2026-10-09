import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pathlib import Path
from dotenv import dotenv_values
from sqlalchemy.orm import Session

from models import AdminPushSubscription, PushLog

logger = logging.getLogger("the_sorted_club.push")


def get_vapid_config() -> Dict[str, Any]:
    """
    Loads VAPID public and private keys and claims for Web Push notifications.
    VAPID keys are never generated on startup.
    """
    env_path = Path(__file__).resolve().parent.parent / ".env"
    file_env = dotenv_values(env_path) if env_path.exists() else {}

    def get_val(key: str, default: str = "") -> str:
        if key in os.environ:
            return os.environ[key]
        return file_env.get(key, default)

    public_key = get_val("VAPID_PUBLIC_KEY", "")
    private_key = get_val("VAPID_PRIVATE_KEY", "")
    claim_email = get_val("VAPID_CLAIM_EMAIL", "mailto:thesortedclub@gmail.com")
    if claim_email and not claim_email.startswith("mailto:") and not claim_email.startswith("http"):
        claim_email = f"mailto:{claim_email}"

    configured = bool(public_key and private_key and len(public_key) > 20 and len(private_key) > 20)

    return {
        "public_key": public_key,
        "private_key": private_key,
        "claim_email": claim_email,
        "configured": configured
    }


def send_web_push(
    db: Session,
    title: str,
    body: str,
    url: str = "/admin",
    tag: str = "tsc-alert",
    event_type: str = "GENERAL"
) -> Dict[str, Any]:
    """
    Dispatches a Web Push notification to all active admin devices.
    
    1. Loads VAPID configuration.
    2. Queries active subscriptions from database.
    3. Dispatches Web Push via pywebpush.
    4. Automatically deactivates expired/invalid (404/410) subscriptions.
    5. Records push delivery log in database without exposing secrets.
    6. Fails-safe: Never raises unhandled exception to business workflows.
    """
    vapid = get_vapid_config()
    result = {
        "sent_count": 0,
        "failed_count": 0,
        "deactivated_count": 0,
        "status": "SKIPPED",
        "error": None
    }

    if not vapid["configured"]:
        logger.info(f"Push notification skipped for '{event_type}': VAPID keys not configured.")
        result["status"] = "SKIPPED"
        result["error"] = "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not configured"
        try:
            log_entry = PushLog(
                event_type=event_type,
                recipient="all_admin_devices",
                title=title,
                status="SKIPPED",
                error_message="VAPID keys not configured in server environment",
                sent_at=datetime.now(timezone.utc)
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            pass
        return result

    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        logger.warning("pywebpush library not found. Web Push disabled.")
        result["status"] = "SKIPPED"
        result["error"] = "pywebpush library missing"
        return result

    subscriptions = db.query(AdminPushSubscription).filter(
        AdminPushSubscription.is_active == True
    ).all()

    if not subscriptions:
        logger.info(f"No active push subscriptions registered for admin event '{event_type}'.")
        result["status"] = "SKIPPED"
        result["error"] = "No registered active devices"
        try:
            log_entry = PushLog(
                event_type=event_type,
                recipient="none",
                title=title,
                status="SKIPPED",
                error_message="No active admin devices registered",
                sent_at=datetime.now(timezone.utc)
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            pass
        return result

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url,
        "tag": tag,
        "icon": "/icon-192.png",
        "badge": "/icon-192.png"
    })

    vapid_claims = {
        "sub": vapid["claim_email"]
    }

    for sub in subscriptions:
        sub_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth
            }
        }
        try:
            webpush(
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=vapid["private_key"],
                vapid_claims=vapid_claims,
                ttl=86400
            )
            result["sent_count"] += 1
            logger.info(f"Web Push delivered to subscription id={sub.id} ({sub.admin_username})")
        except WebPushException as ex:
            response = getattr(ex, "response", None)
            status_code = getattr(response, "status_code", None)
            error_str = str(ex)
            
            # 404 Not Found or 410 Gone indicates permanent expiration
            if status_code in (404, 410) or "410" in error_str or "404" in error_str:
                logger.info(f"Deactivating expired push subscription id={sub.id} (Status: {status_code})")
                sub.is_active = False
                result["deactivated_count"] += 1
            else:
                result["failed_count"] += 1
                logger.warning(f"Web Push delivery error for sub id={sub.id}: {error_str}")
        except Exception as general_ex:
            result["failed_count"] += 1
            logger.warning(f"Unexpected push delivery error for sub id={sub.id}: {general_ex}")

    try:
        db.commit()
    except Exception:
        db.rollback()

    status_str = "SENT" if result["sent_count"] > 0 else ("FAILED" if result["failed_count"] > 0 else "SKIPPED")
    result["status"] = status_str

    try:
        log_entry = PushLog(
            event_type=event_type,
            recipient=f"{result['sent_count']} device(s)",
            title=title,
            status=status_str,
            error_message=f"Sent: {result['sent_count']}, Failed: {result['failed_count']}, Deactivated: {result['deactivated_count']}" if status_str != "SENT" else None,
            sent_at=datetime.now(timezone.utc)
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        pass

    return result
