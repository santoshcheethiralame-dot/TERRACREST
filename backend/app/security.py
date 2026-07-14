"""
Lightweight application-layer protection: security headers, rate limiting,
login brute-force lockout, and a basic WAF-style request filter.

This is a *complement* to, not a replacement for, an edge WAF (e.g.
Cloudflare in front of Render/Vercel). App-layer checks stop things that
slip past the edge or that only make sense with app context (e.g. "5 failed
logins for this username"); the edge stops volumetric/DDoS traffic and known
bad IPs far more cheaply than Python code ever can.

Everything here is in-memory, which is fine for a single Render instance.
If you scale to multiple instances, swap the in-memory dicts for Redis
(see notes at the bottom) so limits are shared across instances.
"""

from __future__ import annotations

import re
import time
from collections import defaultdict, deque
from urllib.parse import unquote

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# ---------------------------------------------------------------------------
# 1. Security response headers
# ---------------------------------------------------------------------------


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds standard hardening headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
        )
        # Only relevant behind HTTPS (Render/Vercel terminate TLS for you) —
        # tells browsers to never downgrade to plain HTTP for a year.
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )
        # This is an API, not a page host — no scripts/styles/frames should
        # ever be loaded *by* it, and it should never be framed.
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'"
        )
        response.headers.setdefault("Cache-Control", "no-store")
        return response


# ---------------------------------------------------------------------------
# 2. General-purpose sliding-window rate limiter (per client IP)
# ---------------------------------------------------------------------------


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple sliding-window limiter: N requests per window per IP.

    Not a substitute for edge-level DDoS protection, but stops scripted
    abuse (scraping, credential stuffing, API hammering) that gets through.
    """

    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)

    def _client_ip(self, request: Request) -> str:
        # Render/most PaaS put the real client IP in X-Forwarded-For.
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)

        ip = self._client_ip(request)
        now = time.monotonic()
        q = self._hits[ip]
        while q and now - q[0] > self.window_seconds:
            q.popleft()

        if len(q) >= self.max_requests:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please slow down."},
                headers={"Retry-After": str(self.window_seconds)},
            )

        q.append(now)
        return await call_next(request)


# ---------------------------------------------------------------------------
# 3. Login brute-force lockout (per username + per IP)
# ---------------------------------------------------------------------------

_MAX_FAILED_ATTEMPTS = 5
_LOCKOUT_SECONDS = 15 * 60

_failed_attempts: dict[str, list[float]] = defaultdict(list)


def _prune(key: str) -> list[float]:
    cutoff = time.monotonic() - _LOCKOUT_SECONDS
    attempts = [t for t in _failed_attempts[key] if t > cutoff]
    _failed_attempts[key] = attempts
    return attempts


def check_login_allowed(username: str, ip: str) -> None:
    """Raise 429 if this username or IP has too many recent failures."""
    for key in (f"user:{username}", f"ip:{ip}"):
        if len(_prune(key)) >= _MAX_FAILED_ATTEMPTS:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Too many failed login attempts. Try again in 15 minutes.",
            )


def record_login_failure(username: str, ip: str) -> None:
    now = time.monotonic()
    _failed_attempts[f"user:{username}"].append(now)
    _failed_attempts[f"ip:{ip}"].append(now)


def record_login_success(username: str, ip: str) -> None:
    _failed_attempts.pop(f"user:{username}", None)
    # Deliberately don't clear the IP bucket — one legitimate login from an
    # IP that also has other failing attempts shouldn't reset its counter.


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ---------------------------------------------------------------------------
# 4. Basic WAF-style request filter
# ---------------------------------------------------------------------------
#
# Blocks obviously malicious patterns in the URL path and query string:
# SQL injection tokens, path traversal, common XSS payloads, and null bytes.
# This is a coarse net, not a substitute for parameterized queries (which
# SQLAlchemy already gives you) or output encoding — it just kills the
# noisiest automated scanner traffic before it reaches your routes.

_SUSPICIOUS_PATTERNS = [
    re.compile(r"\.\./"),                                  # path traversal
    re.compile(r"<\s*script", re.IGNORECASE),               # xss
    re.compile(r"union\s+select", re.IGNORECASE),           # sqli
    re.compile(r"or\s+1\s*=\s*1", re.IGNORECASE),           # sqli
    re.compile(r"drop\s+table", re.IGNORECASE),             # sqli
    re.compile(r"\bexec\s*\(", re.IGNORECASE),              # command injection
    re.compile(r"%00"),                                     # null byte
    re.compile(r"etc/passwd", re.IGNORECASE),
]

_MAX_BODY_BYTES = 2 * 1024 * 1024  # 2 MB — this API has no file uploads


class WafLiteMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Decode first — attackers URL-encode payloads (%20, %27, etc.) to
        # slip past naive string/regex checks on the raw query string.
        target = unquote(f"{request.url.path}?{request.url.query}")
        for pattern in _SUSPICIOUS_PATTERNS:
            if pattern.search(target):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Request rejected."},
                )

        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > _MAX_BODY_BYTES:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request body too large."},
            )

        return await call_next(request)


# ---------------------------------------------------------------------------
# Scaling note (multi-instance deployments)
# ---------------------------------------------------------------------------
# The rate limiter and lockout tracker above live in process memory. On
# Render's free tier you get exactly one instance, so this is fine. If you
# ever scale to 2+ instances behind a load balancer, each instance has its
# own counters — an attacker could get N-times the allowance by hitting
# different instances. At that point, swap the in-memory dicts for Redis
# (e.g. `redis-py`, INCR + EXPIRE per key) so all instances share state.
