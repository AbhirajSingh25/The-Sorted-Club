import os
import time
import threading
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, status

class RateLimiter:
    """
    Thread-safe in-memory sliding-window rate limiter.
    Tracks request timestamps per (client_ip, action_key).
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._records: Dict[str, List[float]] = {}
        self._cleanup_interval: float = 300.0  # clean expired buckets every 5 minutes
        self._last_cleanup: float = time.time()

    def _get_client_ip(self, request: Request) -> str:
        # Check forwarded headers first (from Nginx reverse proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def is_allowed(self, request: Request, action_key: str, max_requests: int, window_seconds: int) -> bool:
        # If in test mode, bypass rate limiting unless explicitly testing rate limits
        app_env = os.environ.get("APP_ENV", "development").lower()
        if app_env == "test" and not getattr(request.state, "force_rate_limit_test", False):
            return True

        client_ip = self._get_client_ip(request)
        bucket_key = f"{client_ip}:{action_key}"
        now = time.time()
        window_start = now - window_seconds

        with self._lock:
            # Periodic cleanup of completely expired buckets
            if now - self._last_cleanup > self._cleanup_interval:
                expired_keys = [
                    k for k, timestamps in self._records.items()
                    if not timestamps or timestamps[-1] < (now - 600)
                ]
                for k in expired_keys:
                    del self._records[k]
                self._last_cleanup = now

            timestamps = self._records.get(bucket_key, [])
            # Filter timestamps within current window
            valid_timestamps = [t for t in timestamps if t > window_start]

            if len(valid_timestamps) >= max_requests:
                self._records[bucket_key] = valid_timestamps
                return False

            valid_timestamps.append(now)
            self._records[bucket_key] = valid_timestamps
            return True

    def check(self, request: Request, action_key: str, max_requests: int = 60, window_seconds: int = 60):
        """
        FastAPI dependency helper. Raises HTTP 429 if rate limit is exceeded.
        """
        if not self.is_allowed(request, action_key, max_requests, window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again shortly."
            )

# Global singleton rate limiter instance
limiter = RateLimiter()
