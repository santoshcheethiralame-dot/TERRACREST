import os

# Point at an isolated test database *before* the app imports settings.
os.environ["TERRACREST_DATABASE_URL"] = "sqlite:///./_test.db"
os.environ.pop("DATABASE_URL", None)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402


@pytest.fixture(autouse=True)
def _fresh_db():
    """Reset to the seed before every test, for isolation."""
    seed()
    yield


@pytest.fixture
def client():
    return TestClient(app)


def headers(client, username, password="demo"):
    """Log in and return an Authorization header for the given member."""
    r = client.post("/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['accessToken']}"}
