import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from .config import settings
from .database import SessionLocal
from .ml import valuation as vmodel
from .security import RateLimitMiddleware, SecurityHeadersMiddleware, WafLiteMiddleware
from .seed import seed_if_empty
from .routers import admin, architect, auth, dashboard, documents, listings, messages, pricebook, valuation

# Refuse to boot on a real deployment (Render sets RENDER=true) if someone
# forgot to set a real JWT secret — the dev fallback is public in this repo,
# so shipping it to prod would let anyone forge valid login tokens.
if os.environ.get("RENDER") and settings.jwt_secret == "dev-only-secret-change-me-in-production-please":
    sys.exit(
        "Refusing to start: TERRACREST_JWT_SECRET is still the default dev value. "
        "Set a long random secret in the environment before deploying."
    )

# Ensure tables exist and a fresh database is populated (idempotent).
seed_if_empty()

# Fold any real architect deliveries into the valuation model at boot, so the
# model card reflects them from the first request.
_db = SessionLocal()
try:
    vmodel.retrain(valuation.build_examples(_db))
finally:
    _db.close()

app = FastAPI(
    title="DB Terracrest Advisory API",
    version="0.1.0",
    description="Backend for the invitation-only real estate deal portal. "
    "Membership itself is the gate: full parcel detail, the document vault, "
    "and the Deal Room open to any verified, admin-issued account — never "
    "to the public.",
)

# Middleware runs in reverse order of registration (last added = outermost),
# so the request hits WAF-lite -> rate limit -> trusted host -> CORS,
# response headers get added on the way back out through all of them.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",  # any local dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)
app.add_middleware(RateLimitMiddleware, max_requests=120, window_seconds=60)
app.add_middleware(WafLiteMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(documents.router)
app.include_router(messages.router)
app.include_router(pricebook.router)
app.include_router(architect.router)
app.include_router(valuation.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "terracrest-api"}
