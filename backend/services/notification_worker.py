import os
import sys
import time
import logging
import smtplib
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

def get_worker_db() -> Session:
    """Dynamically acquire a database session from the active sessionmaker."""
    import database
    return database.SessionLocal()
from models import (
    NotificationJob,
    NotificationJobStatus,
    NotificationChannel,
    EmailLog,
    PushLog
)
from services.notification_service import (
    get_email_config,
    _dispatch_smtp_email,
    generate_customer_email_html
)
import services.notification_service as notif_svc
import services.push_service as push_svc

logger = logging.getLogger("the_sorted_club.worker")

# Maximum attempts before marking job as permanently failed
DEFAULT_MAX_ATTEMPTS = 5

# Backoff configuration (seconds): 15s, 45s, 120s, 300s, 600s
BACKOFF_DELAYS = [15, 45, 120, 300, 600]


def is_permanent_email_error(error_str: str) -> bool:
    """
    Identifies whether an email error is permanent and should not be retried endlessly.
    """
    if not error_str:
        return False
    lower = error_str.lower()
    # 5xx SMTP codes, invalid address, recipient refused
    permanent_patterns = [
        "invalid email",
        "550",
        "551",
        "552",
        "553",
        "554",
        "501",
        "syntax error",
        "user unknown",
        "mailbox not found",
        "recipient address rejected",
        "no recipient email provided"
    ]
    return any(p in lower for p in permanent_patterns)


def is_config_error(error_str: str) -> bool:
    """
    Identifies if delivery failure is due to missing or invalid credentials / config.
    """
    if not error_str:
        return False
    lower = error_str.lower()
    config_patterns = [
        "smtp_password",
        "app password",
        "authentication rejected",
        "535",
        "disabled",
        "missing credentials"
    ]
    return any(p in lower for p in config_patterns)


def sanitize_error(error_str: Optional[str], password: Optional[str]) -> Optional[str]:
    """Sanitizes sensitive credentials from error logs and database records."""
    if not error_str:
        return None
    if password and password in error_str:
        return error_str.replace(password, "********")
    return error_str


def execute_single_job(job_id: int, db: Session) -> Tuple[str, Optional[str]]:
    """
    Executes a claimed NotificationJob synchronously in a thread.
    Returns (result_status: 'COMPLETED'|'FAILED'|'SKIPPED'|'RETRY', error_message).
    """
    job = db.query(NotificationJob).filter(NotificationJob.id == job_id).first()
    if not job:
        return "FAILED", "Job not found"

    config = get_email_config()
    payload = job.payload or {}
    status_result = "COMPLETED"
    err_result = None

    try:
        if job.channel == NotificationChannel.EMAIL.value or job.channel == "EMAIL":
            # Determine email dispatch path
            target_email = job.recipient or config["business_email"]
            subject = job.subject or payload.get("subject", "The Sorted Club Notification")

            is_customer_ack = (job.event_type == "CUSTOMER_ACK") or ("_customer_ack" in (job.idempotency_key or ""))

            if is_customer_ack:
                # Customer acknowledgement email
                app_env = config["app_env"]
                if app_env == "test":
                    if config["configured_enabled"] and notif_svc._allow_test_smtp_mock:
                        # Test with mocked SMTP
                        status_result, err_result = _dispatch_customer_smtp(config, target_email, subject, payload)
                    else:
                        status_result = "SKIPPED"
                        err_result = "Email delivery disabled in test environment"
                elif not config["enabled"]:
                    status_result = "SKIPPED"
                    err_result = "EMAIL_NOTIFICATIONS_ENABLED is false"
                elif not config["password"]:
                    status_result = "SKIPPED"
                    err_result = "SMTP_PASSWORD is not set (requires Gmail 16-char App Password)"
                else:
                    status_result, err_result = _dispatch_customer_smtp(config, target_email, subject, payload)

            else:
                # Business owner or administrative notification email
                app_env = config["app_env"]
                if app_env == "test":
                    if config["configured_enabled"] and notif_svc._allow_test_smtp_mock:
                        raw_status, err_result = _dispatch_smtp_email(
                            config=config,
                            target_email=target_email,
                            event_type=job.event_type,
                            subject=subject,
                            title=payload.get("title", subject),
                            message=payload.get("message", ""),
                            data=payload.get("data"),
                            action_url=payload.get("action_url")
                        )
                        status_result = raw_status
                    else:
                        status_result = "SKIPPED"
                        err_result = "Email delivery disabled in test environment"
                elif not config["enabled"]:
                    status_result = "SKIPPED"
                    err_result = "EMAIL_NOTIFICATIONS_ENABLED is false"
                elif not config["password"]:
                    status_result = "SKIPPED"
                    err_result = "SMTP_PASSWORD is not set (requires Gmail 16-char App Password)"
                else:
                    raw_status, err_result = _dispatch_smtp_email(
                        config=config,
                        target_email=target_email,
                        event_type=job.event_type,
                        subject=subject,
                        title=payload.get("title", subject),
                        message=payload.get("message", ""),
                        data=payload.get("data"),
                        action_url=payload.get("action_url")
                    )
                    status_result = raw_status

            # Record or update EmailLog for operational observability
            try:
                log_status = "SENT" if status_result in ("COMPLETED", "SENT") else status_result
                log_event_type = "CUSTOMER_INQUIRY_RECEIVED" if is_customer_ack else job.event_type
                log_entry = EmailLog(
                    event_type=log_event_type,
                    recipient=target_email,
                    subject=subject,
                    status=log_status,
                    error_message=sanitize_error(err_result, config.get("password")),
                    lead_id=job.lead_id,
                    attempts=job.attempts,
                    last_attempt_at=datetime.now(timezone.utc),
                    next_retry_at=job.next_retry_at,
                    sent_at=datetime.now(timezone.utc)
                )
                db.add(log_entry)
                db.commit()
            except Exception as log_err:
                logger.error(f"Failed to record email log during job execution: {log_err}")
                try:
                    db.rollback()
                except Exception:
                    pass

        elif job.channel == NotificationChannel.PUSH.value or job.channel == "PUSH":
            # Web push dispatch
            push_res = push_svc.send_web_push(
                db=db,
                title=payload.get("title", "New website inquiry"),
                body=payload.get("body", "A new inquiry has arrived."),
                url=payload.get("url", "/admin"),
                tag=payload.get("tag", f"lead-{job.lead_id}"),
                event_type=job.event_type
            )
            if push_res.get("status") == "SKIPPED":
                status_result = "SKIPPED"
                err_result = push_res.get("error")
            elif push_res.get("failed_count", 0) > 0 and push_res.get("sent_count", 0) == 0:
                status_result = "FAILED"
                err_result = push_res.get("error") or "Failed to deliver push to registered devices"
            else:
                status_result = "COMPLETED"
                err_result = None

        else:
            status_result = "FAILED"
            err_result = f"Unknown notification channel: {job.channel}"

    except Exception as e:
        status_result = "FAILED"
        err_result = sanitize_error(str(e), config.get("password"))
        logger.warning(f"Exception during notification job {job.id}: {err_result}")

    # Standardize return status
    if status_result in ("SENT", "COMPLETED"):
        return "COMPLETED", None
    elif status_result == "SKIPPED":
        return "SKIPPED", err_result
    else:
        return "FAILED", err_result


def _dispatch_customer_smtp(config: Dict[str, Any], target_email: str, subject: str, payload: Dict[str, Any]) -> Tuple[str, Optional[str]]:
    """Helper to dispatch customer acknowledgement email via smtplib."""
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    try:
        html_content = generate_customer_email_html(
            title=payload.get("title", subject),
            message=payload.get("message", ""),
            data=payload.get("data"),
            cta_text=payload.get("cta_text"),
            cta_url=payload.get("cta_url")
        )
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config["from_email"]
        msg["To"] = target_email.strip()

        plain_text = f"{payload.get('title', subject)}\n\n{payload.get('message', '')}\n\n"
        if payload.get("cta_url"):
            full_url = payload["cta_url"] if payload["cta_url"].startswith("http") else f"{config['frontend_url']}{payload['cta_url']}"
            plain_text += f"View: {full_url}\n\n"
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        if config["use_ssl"]:
            with smtplib.SMTP_SSL(config["host"], config["port"], timeout=12) as server:
                if config["username"] and config["password"]:
                    server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [target_email.strip()], msg.as_string())
        else:
            with smtplib.SMTP(config["host"], config["port"], timeout=12) as server:
                server.starttls()
                if config["username"] and config["password"]:
                    server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [target_email.strip()], msg.as_string())

        logger.info(f"Customer acknowledgement successfully sent to {target_email}")
        return "COMPLETED", None
    except Exception as e:
        sanitized = sanitize_error(str(e), config.get("password"))
        logger.warning(f"Failed to dispatch customer email to {target_email}: {sanitized}")
        return "FAILED", sanitized


class NotificationWorker:
    """
    Persistent, database-backed notification queue worker.
    Runs inside the application lifespan with an async polling loop and thread-pool execution.
    Survives application restarts, prevents duplicate delivery, and handles retries with backoff.
    """

    def __init__(self, poll_interval: float = 3.0):
        self.poll_interval = poll_interval
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._trigger_event: Optional[asyncio.Event] = None

    def start(self):
        """Starts the worker background loop within the current asyncio event loop."""
        if self._running:
            return
        self._running = True
        self._trigger_event = asyncio.Event()
        loop = asyncio.get_event_loop()
        self._task = loop.create_task(self._run_loop())
        logger.info("NotificationWorker background service started.")

    async def stop(self):
        """Gracefully stops the worker loop."""
        self._running = False
        if self._trigger_event:
            self._trigger_event.set()
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("NotificationWorker background service stopped.")

    def notify(self):
        """Wakes the worker immediately when a new job is enqueued."""
        if self._trigger_event:
            try:
                self._trigger_event.set()
            except Exception:
                pass

    async def _run_loop(self):
        """Main worker loop."""
        # On startup, recover any jobs that were stuck in PROCESSING from a prior unexpected shutdown
        await asyncio.to_thread(self._recover_stuck_jobs)

        while self._running:
            try:
                # Process any due jobs
                processed_any = await asyncio.to_thread(self.process_next_due_job)
                if processed_any:
                    # If we processed a job, check immediately for more without waiting
                    continue

                # Wait for next poll or trigger notification
                if self._trigger_event:
                    try:
                        await asyncio.wait_for(self._trigger_event.wait(), timeout=self.poll_interval)
                        self._trigger_event.clear()
                    except asyncio.TimeoutError:
                        pass
                else:
                    await asyncio.sleep(self.poll_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Unexpected error in NotificationWorker loop: {e}", exc_info=True)
                await asyncio.sleep(self.poll_interval)

    def _recover_stuck_jobs(self):
        """Recovers jobs that were left in PROCESSING status (e.g. from container restart)."""
        db = get_worker_db()
        try:
            stuck_threshold = datetime.now(timezone.utc) - timedelta(minutes=2)
            stuck_jobs = db.query(NotificationJob).filter(
                NotificationJob.status == NotificationJobStatus.PROCESSING.value,
                or_(
                    NotificationJob.last_attempt_at.is_(None),
                    NotificationJob.last_attempt_at < stuck_threshold
                )
            ).all()

            if stuck_jobs:
                logger.info(f"Recovering {len(stuck_jobs)} stalled notification job(s) from previous process run.")
                for j in stuck_jobs:
                    j.status = NotificationJobStatus.PENDING.value
                db.commit()
        except Exception as e:
            logger.error(f"Error during job recovery: {e}")
            try:
                db.rollback()
            except Exception:
                pass
        finally:
            db.close()

    def process_next_due_job(self) -> bool:
        """
        Claims and processes a single due job.
        Returns True if a job was found and processed, False if queue was empty.
        """
        db = get_worker_db()
        try:
            now = datetime.now(timezone.utc)

            # Query the oldest pending job that is due
            job = db.query(NotificationJob).filter(
                NotificationJob.status == NotificationJobStatus.PENDING.value,
                NotificationJob.attempts < NotificationJob.max_attempts,
                or_(
                    NotificationJob.next_retry_at.is_(None),
                    NotificationJob.next_retry_at <= now
                )
            ).order_by(NotificationJob.created_at.asc()).first()

            if not job:
                return False

            # Atomically claim job
            job.status = NotificationJobStatus.PROCESSING.value
            job.attempts += 1
            job.last_attempt_at = now
            job_id = job.id
            db.commit()

            # Execute delivery
            outcome, err_msg = execute_single_job(job_id=job_id, db=db)

            # Refresh and finalize status
            job = db.query(NotificationJob).filter(NotificationJob.id == job_id).first()
            if job:
                if outcome == "COMPLETED":
                    job.status = NotificationJobStatus.COMPLETED.value
                    job.completed_at = datetime.now(timezone.utc)
                    job.last_error = None
                    job.next_retry_at = None
                elif outcome == "SKIPPED":
                    job.status = NotificationJobStatus.SKIPPED.value
                    job.completed_at = datetime.now(timezone.utc)
                    job.last_error = err_msg
                    job.next_retry_at = None
                else:  # FAILED
                    job.last_error = err_msg
                    # Check retry policy
                    if is_permanent_email_error(err_msg or "") or job.attempts >= job.max_attempts:
                        job.status = NotificationJobStatus.FAILED.value
                        job.next_retry_at = None
                    else:
                        job.status = NotificationJobStatus.PENDING.value
                        delay_idx = min(job.attempts - 1, len(BACKOFF_DELAYS) - 1)
                        delay_sec = BACKOFF_DELAYS[delay_idx]
                        if is_config_error(err_msg or ""):
                            # If config is missing, back off for 5 minutes instead of spinning
                            delay_sec = 300
                        job.next_retry_at = datetime.now(timezone.utc) + timedelta(seconds=delay_sec)

                db.commit()
            return True
        except Exception as e:
            logger.error(f"Error processing notification job: {e}")
            try:
                db.rollback()
            except Exception:
                pass
            return False
        finally:
            db.close()

    def process_all_pending(self, max_jobs: int = 50) -> int:
        """
        Synchronously processes up to max_jobs pending jobs immediately.
        Useful for automated tests, deployment health checks, and CLI triggers.
        """
        count = 0
        while count < max_jobs:
            processed = self.process_next_due_job()
            if not processed:
                break
            count += 1
        return count


# Global singleton instance
_worker_instance: Optional[NotificationWorker] = None


def get_notification_worker() -> NotificationWorker:
    """Returns the application notification worker singleton."""
    global _worker_instance
    if _worker_instance is None:
        _worker_instance = NotificationWorker()
    return _worker_instance


def notify_worker():
    """Notifies the worker that a new job is available."""
    worker = get_notification_worker()
    worker.notify()


if __name__ == "__main__":
    # Allows running as a standalone worker process: `python -m services.notification_worker`
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    logger.info("Starting standalone NotificationWorker process...")
    worker = NotificationWorker(poll_interval=2.0)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    worker.start()
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down worker process...")
        loop.run_until_complete(worker.stop())
