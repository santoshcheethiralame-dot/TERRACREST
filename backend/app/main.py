from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .seed import seed_if_empty
from .routers import admin, architect, auth, dashboard, documents, listings, messages, pricebook

# Ensure tables exist and a fresh database is populated (idempotent).
seed_if_empty()

app = FastAPI(
    title="DB Terracrest Advisory API",
    version="0.1.0",
    description="Backend for the invitation-only real estate deal portal. "
    "Enforces the masking moat server-side: sealed parcel details are never "
    "returned without a logged NDA.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",  # any local dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(documents.router)
app.include_router(messages.router)
app.include_router(pricebook.router)
app.include_router(architect.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "terracrest-api"}
