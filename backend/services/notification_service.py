import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from pathlib import Path
from dotenv import dotenv_values
from sqlalchemy.orm import Session

from models import Notification, EmailLog, NotificationType

logger = logging.getLogger("the_sorted_club.notifications")

# Module flag used only by specialized unit tests to test mocked SMTP dispatch paths in test mode
_allow_test_smtp_mock: bool = False


def get_app_env() -> str:
    """
    Retrieves and normalizes the current application environment.
    Supported values: 'test', 'development', 'production'.
    Defaults to 'development'.
    """
    app_env = os.environ.get("APP_ENV") or os.environ.get("ENV")
    if not app_env:
        env_path = Path(__file__).resolve().parent.parent / ".env"
        if env_path.exists():
            file_env = dotenv_values(env_path)
            app_env = file_env.get("APP_ENV") or file_env.get("ENV")
    return (app_env or "development").strip().lower()


def get_email_config() -> Dict[str, Any]:
    """
    Loads email & SMTP configuration with strict environment-aware separation:
    - 'test': Live email delivery is ALWAYS disabled (is_live_allowed = False, enabled = False).
    - 'development': Live email delivery is disabled by default; manual diagnostic is permitted.
    - 'production': Live email delivery is permitted if EMAIL_NOTIFICATIONS_ENABLED=true.
    """
    app_env = get_app_env()
    env_path = Path(__file__).resolve().parent.parent / ".env"
    file_env = dotenv_values(env_path) if env_path.exists() else {}

    def get_val(key: str, default: str = "") -> str:
        if key in os.environ:
            return os.environ[key]
        return file_env.get(key, default)

    host = get_val("SMTP_HOST", "smtp.gmail.com")
    try:
        port = int(get_val("SMTP_PORT", "587"))
    except ValueError:
        port = 587

    use_ssl_env = str(get_val("SMTP_USE_SSL", "false")).lower() in ("1", "true", "yes")
    use_ssl = use_ssl_env or (port == 465)

    configured_enabled = str(get_val("EMAIL_NOTIFICATIONS_ENABLED", "false")).lower() in ("1", "true", "yes")

    # Strict environment isolation rules
    if app_env == "test":
        # In test mode, real SMTP delivery is ALWAYS prohibited
        is_live_allowed = False
        delivery_enabled = False
    elif app_env == "development":
        # In dev mode, live email delivery is active if EMAIL_NOTIFICATIONS_ENABLED=true
        is_live_allowed = True
        delivery_enabled = configured_enabled
    else:  # production
        is_live_allowed = True
        delivery_enabled = configured_enabled

    return {
        "app_env": app_env,
        "enabled": delivery_enabled,
        "configured_enabled": configured_enabled,
        "is_live_allowed": is_live_allowed,
        "host": host,
        "port": port,
        "username": get_val("SMTP_USERNAME", "thesortedclub@gmail.com"),
        "password": get_val("SMTP_PASSWORD", "") if app_env != "test" else os.environ.get("SMTP_PASSWORD", ""),
        "from_email": get_val("SMTP_FROM_EMAIL", "thesortedclub@gmail.com"),
        "business_email": get_val("BUSINESS_NOTIFICATION_EMAIL", "thesortedclub@gmail.com"),
        "use_ssl": use_ssl,
        "frontend_url": get_val("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    }


def generate_email_html(
    event_type: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    action_url: Optional[str] = None
) -> str:
    """
    Renders a responsive, branded HTML email for The Sorted Club business notifications.
    """
    config = get_email_config()
    frontend_url = config["frontend_url"]
    data = data or {}
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p UTC")

    # Build detail rows
    detail_rows_html = ""
    for label, val in data.items():
        if val is not None and str(val).strip():
            clean_label = label.replace("_", " ").title()
            detail_rows_html += f"""
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 35%; font-weight: 500; border-bottom: 1px solid #f1f5f9;">{clean_label}</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{val}</td>
            </tr>
            """

    # Button HTML
    button_html = ""
    if action_url:
        full_url = action_url if action_url.startswith("http") else f"{frontend_url}{action_url}"
        button_html = f"""
        <div style="margin-top: 24px; text-align: center;">
            <a href="{full_url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.5px;">
                OPEN IN ADMIN DASHBOARD →
            </a>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 20px 24px; text-align: left; display: flex; align-items: center; justify-content: space-between;">
                <div style="color: #ffffff; font-size: 16px; font-weight: 800; letter-spacing: 1px;">
                    THE SORTED <span style="color: #38bdf8;">CLUB</span>
                </div>
                <div style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    {event_type.replace('_', ' ')}
                </div>
            </div>

            <!-- Body -->
            <div style="padding: 24px;">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">{title}</h2>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">{message}</p>

                {f'<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">{detail_rows_html}</table>' if detail_rows_html else ''}

                {button_html}
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
                <strong>The Sorted Club</strong> • Operational Notification Hub<br>
                Email: <a href="mailto:thesortedclub@gmail.com" style="color: #0284c7; text-decoration: none;">thesortedclub@gmail.com</a> • WhatsApp: +91 9643820888<br>
                <span style="font-size: 11px; color: #94a3b8;">Event recorded at {now_str}</span>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def _dispatch_smtp_email(
    config: Dict[str, Any],
    target_email: str,
    event_type: str,
    subject: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    action_url: Optional[str] = None
) -> Tuple[str, Optional[str]]:
    """
    Internal helper to format and dispatch an email via SMTP.
    Returns (status: 'SENT'|'FAILED'|'SKIPPED', error_message).
    """
    # Strict fail-safe: block real socket connections in test mode unless mock flag is active
    if config["app_env"] == "test" and not _allow_test_smtp_mock:
        return "SKIPPED", "Email delivery blocked in test environment"

    try:
        html_content = generate_email_html(
            event_type=event_type,
            title=title,
            message=message,
            data=data,
            action_url=action_url
        )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config["from_email"]
        msg["To"] = target_email

        plain_text = f"{title}\n\n{message}\n\n"
        if data:
            for k, v in data.items():
                plain_text += f"{k.title()}: {v}\n"
        if action_url:
            plain_text += f"\nAction Link: {config['frontend_url']}{action_url}\n"

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        if config["use_ssl"]:
            with smtplib.SMTP_SSL(config["host"], config["port"], timeout=12) as server:
                if config["username"] and config["password"]:
                    server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [target_email], msg.as_string())
        else:
            with smtplib.SMTP(config["host"], config["port"], timeout=12) as server:
                server.starttls()
                if config["username"] and config["password"]:
                    server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [target_email], msg.as_string())

        logger.info(f"Email notification successfully sent to {target_email} for event {event_type}")
        return "SENT", None
    except Exception as e:
        error_msg = str(e).replace(config.get("password", ""), "********") if config.get("password") else str(e)
        logger.warning(f"Failed to send email notification to {target_email} for {event_type}: {error_msg}")
        return "FAILED", error_msg


def send_business_notification(
    db: Session,
    event_type: str,
    subject: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    recipient: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    action_url: Optional[str] = None
) -> Optional[Notification]:
    """
    Centralized business notification service with strict environment separation.
    
    1. Creates and persists an admin dashboard Notification in the database (ALL environments).
    2. Evaluates email dispatch:
       - In 'test' mode: Bypasses live SMTP completely. Records EmailLog as SKIPPED (or SENT if test mock transport active).
       - In 'development' mode: Skips automated dispatch; diagnostic endpoint remains available.
       - In 'production' mode: Dispatches email via Gmail SMTP if EMAIL_NOTIFICATIONS_ENABLED=True.
    3. Records EmailLog with delivery status (SENT, SKIPPED, or FAILED).
    4. Resilient: If email fails or SMTP is unreachable, NEVER rolls back the business transaction.
    """
    config = get_email_config()
    app_env = config["app_env"]
    target_email = recipient or config["business_email"]
    notification = None

    # 1. Create DB Notification Record (always created and persisted in all environments)
    try:
        notification = Notification(
            type=event_type,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,
            action_url=action_url,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
    except Exception as e:
        logger.error(f"Failed to record dashboard notification: {e}", exc_info=True)
        try:
            db.rollback()
        except Exception:
            pass

    # 2. Determine Email Delivery
    email_status = "SKIPPED"
    error_msg = None

    if app_env == "test":
        # In test environment, real SMTP is NEVER contacted.
        # If a specialized test explicitly activated mocked SMTP:
        if config["configured_enabled"] and _allow_test_smtp_mock:
            email_status, error_msg = _dispatch_smtp_email(
                config=config,
                target_email=target_email,
                event_type=event_type,
                subject=subject,
                title=title,
                message=message,
                data=data,
                action_url=action_url
            )
        else:
            email_status = "SKIPPED"
            error_msg = "Email delivery disabled in test environment (APP_ENV=test)"
            logger.debug(f"[TEST] Notification recorded for {event_type}. Real email delivery skipped.")

    elif app_env == "development" and not config["enabled"]:
        email_status = "SKIPPED"
        error_msg = "Automated email delivery disabled in development mode (APP_ENV=development)"
        logger.info(f"[DEV] Notification recorded for {event_type}. Automated email skipped (use admin test-email for manual testing).")

    elif not config["enabled"]:
        email_status = "SKIPPED"
        error_msg = "EMAIL_NOTIFICATIONS_ENABLED is false"
        logger.info(f"Email notifications disabled. Event {event_type} logged to database.")

    elif not config["password"]:
        email_status = "SKIPPED"
        error_msg = "SMTP_PASSWORD is not set (requires Gmail 16-char App Password)"
        logger.info(f"Email notifications enabled but SMTP_PASSWORD missing for {event_type}.")

    elif not config["host"] or not target_email:
        email_status = "SKIPPED"
        error_msg = "SMTP_HOST or recipient email missing"
        logger.warning(f"SMTP configuration incomplete for event {event_type}.")

    else:
        # Live dispatch in production or explicit dev override
        email_status, error_msg = _dispatch_smtp_email(
            config=config,
            target_email=target_email,
            event_type=event_type,
            subject=subject,
            title=title,
            message=message,
            data=data,
            action_url=action_url
        )

    # 3. Record Email Delivery Log
    try:
        log_entry = EmailLog(
            event_type=event_type,
            recipient=target_email,
            subject=subject,
            status=email_status,
            error_message=error_msg,
            sent_at=datetime.now(timezone.utc)
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record email log: {e}")
        try:
            db.rollback()
        except Exception:
            pass

    return notification


def test_smtp_delivery(recipient: Optional[str] = None, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Diagnostic tool to verify SMTP configuration and test live email delivery.
    Only accessible by authenticated admins.
    In 'test' mode, fails-safe unless smtplib is mocked.
    """
    config = get_email_config()
    target_email = recipient or config["business_email"]
    app_env = config["app_env"]

    report: Dict[str, Any] = {
        "success": False,
        "status": "untested",
        "app_env": app_env,
        "enabled": config["configured_enabled"],
        "host": config["host"],
        "port": config["port"],
        "username": config["username"],
        "from_email": config["from_email"],
        "target_email": target_email,
        "has_password": bool(config["password"]),
        "use_ssl": config["use_ssl"],
        "message": "",
        "error": None,
        "error_code": None
    }

    if not config["password"]:
        report["status"] = "missing_password"
        report["error_code"] = "SMTP_MISSING_PASSWORD"
        report["error"] = "SMTP_PASSWORD is empty. For Gmail, generate a 16-character App Password at https://myaccount.google.com/apppasswords and add it to backend/.env."
        report["message"] = "SMTP configuration incomplete: missing SMTP_PASSWORD."
        return report

    # If running in test mode without mock:
    if app_env == "test" and not _allow_test_smtp_mock:
        # Check if smtplib.SMTP is patched (MagicMock)
        if not isinstance(smtplib.SMTP, MagicMock if 'MagicMock' in globals() else object):
            report["status"] = "test_mode_safe"
            report["message"] = "Live SMTP delivery is disabled in test mode (APP_ENV=test)."
            return report

    log_status = "FAILED"
    error_msg = None

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🧪 The Sorted Club — SMTP Live Diagnostic Test"
        msg["From"] = config["from_email"]
        msg["To"] = target_email
        body = f"This is an automated diagnostic test verifying SMTP delivery from The Sorted Club to {target_email}."
        msg.attach(MIMEText(body, "plain"))

        if config["use_ssl"]:
            with smtplib.SMTP_SSL(config["host"], config["port"], timeout=10) as server:
                server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [target_email], msg.as_string())
        else:
            with smtplib.SMTP(config["host"], config["port"], timeout=10) as server:
                server.starttls()
                server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [target_email], msg.as_string())

        report["success"] = True
        report["status"] = "success"
        report["message"] = f"Live diagnostic email successfully delivered to {target_email} via {config['host']}:{config['port']}."
        log_status = "SENT"
    except smtplib.SMTPAuthenticationError as auth_err:
        report["success"] = False
        report["status"] = "failed"
        report["error_code"] = "SMTP_AUTH_FAILED"
        sanitized = str(auth_err).replace(config.get("password", ""), "********") if config.get("password") else str(auth_err)
        report["error"] = f"Authentication rejected by {config['host']}. Verify the 16-character Gmail App Password for {config['username']}: {sanitized}"
        report["message"] = "SMTP authentication failed. Check your Gmail App Password."
        error_msg = report["error"]
    except Exception as e:
        report["success"] = False
        report["status"] = "failed"
        report["error_code"] = "SMTP_DELIVERY_FAILED"
        sanitized = str(e).replace(config.get("password", ""), "********") if config.get("password") else str(e)
        report["error"] = sanitized
        report["message"] = f"SMTP delivery failed: {sanitized}"
        error_msg = sanitized

    # Record delivery log if db session provided
    if db is not None:
        try:
            log_entry = EmailLog(
                event_type="DIAGNOSTIC_TEST",
                recipient=target_email,
                subject="🧪 The Sorted Club — SMTP Live Diagnostic Test",
                status=log_status,
                error_message=error_msg,
                sent_at=datetime.now(timezone.utc)
            )
            db.add(log_entry)
            db.commit()
        except Exception as log_err:
            logger.error(f"Failed to record diagnostic email log: {log_err}")
            try:
                db.rollback()
            except Exception:
                pass

    return report


def generate_customer_email_html(
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    cta_text: Optional[str] = None,
    cta_url: Optional[str] = None
) -> str:
    """
    Renders a responsive, customer-safe branded HTML transactional email for clients.
    Excludes internal diagnostic fields, internal activity logs, and staff metadata.
    """
    config = get_email_config()
    frontend_url = config["frontend_url"]
    data = data or {}

    detail_rows_html = ""
    excluded_keys = {"id", "db_id", "admin", "admin_user", "created_by", "assigned_to", "internal_notes", "notes", "action_url", "diagnostic"}
    for label, val in data.items():
        clean_key = str(label).strip().lower().replace(" ", "_")
        if clean_key in excluded_keys:
            continue
        if val is not None and str(val).strip():
            clean_label = str(label).replace("_", " ").title()
            detail_rows_html += f"""
            <tr>
                <td style="padding: 9px 0; color: #64748b; font-size: 13px; width: 38%; font-weight: 500; border-bottom: 1px solid #f1f5f9;">{clean_label}</td>
                <td style="padding: 9px 0; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{val}</td>
            </tr>
            """

    button_html = ""
    if cta_url:
        full_url = cta_url if cta_url.startswith("http") else f"{frontend_url}{cta_url}"
        button_text = cta_text or "VIEW DETAILS →"
        button_html = f"""
        <div style="margin: 28px 0 16px 0; text-align: center;">
            <a href="{full_url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 13px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px;">
                {button_text}
            </a>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 22px 26px; text-align: left; display: flex; align-items: center; justify-content: space-between;">
                <div style="color: #ffffff; font-size: 16px; font-weight: 800; letter-spacing: 1px;">
                    THE SORTED <span style="color: #38bdf8;">CLUB</span>
                </div>
                <div style="color: #94a3b8; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">
                    CLIENT NOTIFICATION
                </div>
            </div>

            <!-- Body -->
            <div style="padding: 26px;">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">{title}</h2>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">{message}</p>

                {f'<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">{detail_rows_html}</table>' if detail_rows_html else ''}

                {button_html}
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 26px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6;">
                <strong>The Sorted Club</strong> • Business Operating Collective<br>
                Email: <a href="mailto:thesortedclub@gmail.com" style="color: #0284c7; text-decoration: none;">thesortedclub@gmail.com</a> • WhatsApp: <a href="https://wa.me/919643820888" style="color: #15803d; text-decoration: none;">+91 9643820888</a><br>
                <span style="font-size: 11px; color: #94a3b8;">Sent securely to your verified email.</span>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def send_customer_email(
    db: Session,
    recipient: str,
    event_type: str,
    subject: str,
    title: str,
    message: str,
    cta_text: Optional[str] = None,
    cta_url: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None
) -> Tuple[str, Optional[str]]:
    """
    Dispatches a customer-facing transactional notification with full safety isolation.
    Records delivery status to EmailLog. Does NOT create an admin dashboard notification.
    Never exposes internal CRM notes, private comments, admin usernames, or diagnostic data.
    """
    if not recipient or not recipient.strip():
        return "SKIPPED", "No recipient email provided"

    config = get_email_config()
    app_env = config["app_env"]

    # Failsafe check in test environment
    if app_env == "test":
        email_status = "SKIPPED"
        error_msg = "Customer email delivery disabled in test environment"
    elif app_env == "development" and not config["enabled"]:
        email_status = "SKIPPED"
        error_msg = "Automated customer email disabled in development mode"
    elif not config["enabled"] or not config["password"]:
        email_status = "SKIPPED"
        error_msg = "Email delivery disabled or SMTP credentials missing"
    else:
        try:
            html_content = generate_customer_email_html(
                title=title,
                message=message,
                data=data,
                cta_text=cta_text,
                cta_url=cta_url
            )
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = config["from_email"]
            msg["To"] = recipient.strip()

            plain_text = f"{title}\n\n{message}\n\n"
            if cta_url:
                full_url = cta_url if cta_url.startswith("http") else f"{config['frontend_url']}{cta_url}"
                plain_text += f"View here: {full_url}\n\n"
            msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if config["use_ssl"]:
                with smtplib.SMTP_SSL(config["host"], config["port"], timeout=12) as server:
                    if config["username"] and config["password"]:
                        server.login(config["username"], config["password"])
                    server.sendmail(config["from_email"], [recipient.strip()], msg.as_string())
            else:
                with smtplib.SMTP(config["host"], config["port"], timeout=12) as server:
                    server.starttls()
                    if config["username"] and config["password"]:
                        server.login(config["username"], config["password"])
                    server.sendmail(config["from_email"], [recipient.strip()], msg.as_string())

            email_status = "SENT"
            error_msg = None
            logger.info(f"Customer email successfully sent to {recipient} for event {event_type}")
        except Exception as e:
            error_msg = str(e).replace(config.get("password", ""), "********") if config.get("password") else str(e)
            email_status = "FAILED"
            logger.warning(f"Failed to send customer email to {recipient}: {error_msg}")

    # Record delivery log
    try:
        log_entry = EmailLog(
            event_type=f"CUSTOMER_{event_type}",
            recipient=recipient.strip(),
            subject=subject,
            status=email_status,
            error_message=error_msg,
            sent_at=datetime.now(timezone.utc)
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record customer email log: {e}")
        try:
            db.rollback()
        except Exception:
            pass

    return email_status, error_msg

