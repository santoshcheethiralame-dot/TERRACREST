import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App configuration. Values are read from the environment (TERRACREST_ prefix)
    or a local .env file. Swap DATABASE_URL to a PostgreSQL URL for production."""

    model_config = SettingsConfigDict(env_prefix="TERRACREST_", env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./terracrest.db"
    jwt_secret: str = "dev-only-secret-change-me-in-production-please"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    refresh_token_days: int = 7
    cors_origins: str = "http://localhost:5173,http://localhost:5178,https://terracrest.vercel.app"
    # Hostnames this API will answer requests for (Host header allow-list).
    # Prevents Host-header injection / requests aimed at a stale or spoofed
    # domain from being processed. Add your real Render domain(s) via env.
    # "testserver" is the fixed Host header Starlette's TestClient sends —
    # needed so the test suite and CI don't get blocked by this same check.
    allowed_hosts: str = "localhost,127.0.0.1,terracrest-api.onrender.com,testserver"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def trusted_hosts(self) -> list[str]:
        return [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]


settings = Settings()

# Managed hosts (Render/Railway/Fly/Heroku) inject a plain DATABASE_URL. Honor it
# and normalize the driver to psycopg so a bare postgres:// URL works with
# SQLAlchemy 2.0 — no code changes to go from SQLite (dev) to Postgres (prod).
_host_db = os.environ.get("DATABASE_URL")
if _host_db:
    settings.database_url = _host_db
if settings.database_url.startswith("postgres://"):
    settings.database_url = "postgresql+psycopg://" + settings.database_url[len("postgres://") :]
elif settings.database_url.startswith("postgresql://"):
    settings.database_url = "postgresql+psycopg://" + settings.database_url[len("postgresql://") :]
