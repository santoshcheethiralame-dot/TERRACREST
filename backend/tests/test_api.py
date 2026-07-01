from conftest import headers


# --------------------------------------------------------------- meta
def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


# --------------------------------------------------------------- auth
def test_login_success(client):
    r = client.post("/auth/login", json={"username": "builder_rajesh_001", "password": "demo"})
    assert r.status_code == 200
    body = r.json()
    assert body["accessToken"] and body["refreshToken"]
    assert body["user"]["username"] == "builder_rajesh_001"


def test_login_wrong_password(client):
    assert client.post("/auth/login", json={"username": "builder_rajesh_001", "password": "nope"}).status_code == 401


def test_login_unknown_user(client):
    assert client.post("/auth/login", json={"username": "ghost", "password": "demo"}).status_code == 401


def test_me_requires_auth(client):
    assert client.get("/auth/me").status_code == 401


def test_me_with_access(client):
    r = client.get("/auth/me", headers=headers(client, "builder_rajesh_001"))
    assert r.status_code == 200 and r.json()["username"] == "builder_rajesh_001"


def test_refresh_token_rejected_as_access(client):
    login = client.post("/auth/login", json={"username": "builder_rajesh_001", "password": "demo"}).json()
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {login['refreshToken']}"})
    assert r.status_code == 401


def test_refresh_mints_new_working_pair(client):
    login = client.post("/auth/login", json={"username": "builder_rajesh_001", "password": "demo"}).json()
    r = client.post("/auth/refresh", json={"refreshToken": login["refreshToken"]})
    assert r.status_code == 200
    new = r.json()
    assert new["accessToken"] and new["refreshToken"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {new['accessToken']}"})
    assert me.status_code == 200


def test_access_token_rejected_at_refresh(client):
    login = client.post("/auth/login", json={"username": "builder_rajesh_001", "password": "demo"}).json()
    assert client.post("/auth/refresh", json={"refreshToken": login["accessToken"]}).status_code == 401


def test_refresh_garbage_rejected(client):
    assert client.post("/auth/refresh", json={"refreshToken": "not.a.jwt"}).status_code == 401


# ----------------------------------------------------- masking (the moat)
def test_listings_requires_auth(client):
    assert client.get("/listings").status_code == 401


def test_builder_sees_sealed_only_with_nda(client):
    h = headers(client, "builder_rajesh_001")
    listings = {l["id"]: l for l in client.get("/listings", headers=h).json()}
    assert listings["JD-BLR-2026-012"].get("sealed")  # pre-logged seed NDA
    assert not listings["WH-BLR-2026-047"].get("sealed")
    assert not listings["BL-BLR-2026-008"].get("sealed")


def test_public_area_always_present_but_sealed_withheld(client):
    h = headers(client, "builder_rajesh_001")
    wh = client.get("/listings/WH-BLR-2026-047", headers=h).json()
    assert wh.get("publicArea")
    assert not wh.get("sealed")


def test_owner_sees_own_sealed(client):
    h = headers(client, "landowner_ramanathan_002")
    jd = client.get("/listings/JD-BLR-2026-012", headers=h).json()
    assert jd.get("sealed") and jd["sealed"]["ownerName"] == "Ramanathan Holdings LLP"


# ------------------------------------------------------------- nda unlock
def test_nda_unlocks_parcel(client):
    h = headers(client, "builder_rajesh_001")
    assert not client.get("/listings/WH-BLR-2026-047", headers=h).json().get("sealed")
    assert client.post("/listings/WH-BLR-2026-047/nda", headers=h).status_code == 200
    after = client.get("/listings/WH-BLR-2026-047", headers=h).json()
    assert after.get("sealed") and "KIADB" in after["sealed"]["address"]


# ------------------------------------------------------------- documents
def test_documents_gated_by_nda(client):
    h = headers(client, "builder_rajesh_001")
    assert len(client.get("/listings/JD-BLR-2026-012/documents", headers=h).json()) == 4  # has NDA
    assert client.get("/listings/WH-BLR-2026-047/documents", headers=h).json() == []  # sealed


def test_document_download_is_watermarked_pdf(client):
    h = headers(client, "builder_rajesh_001")
    r = client.get("/listings/JD-BLR-2026-012/documents/JD-BLR-2026-012-title-deed", headers=h)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content[:5] == b"%PDF-"


def test_document_download_blocked_when_sealed(client):
    h = headers(client, "builder_rajesh_001")
    r = client.get("/listings/WH-BLR-2026-047/documents/WH-BLR-2026-047-title-deed", headers=h)
    assert r.status_code == 403


# ------------------------------------------------------- admin authorization
def test_admin_forbidden_for_non_admin(client):
    assert client.get("/admin/users", headers=headers(client, "builder_rajesh_001")).status_code == 403


def test_admin_lists_all_users(client):
    r = client.get("/admin/users", headers=headers(client, "admin_terracrest"))
    assert r.status_code == 200 and len(r.json()) == 7


def test_admin_logging_nda_unseals_for_builder(client):
    admin = headers(client, "admin_terracrest")
    priya = headers(client, "builder_priya_003")
    assert not client.get("/listings/JD-BLR-2026-012", headers=priya).json().get("sealed")
    r = client.post("/admin/ndas", headers=admin, json={"builderId": "builder_priya_003", "listingId": "JD-BLR-2026-012"})
    assert r.status_code in (200, 201)
    assert client.get("/listings/JD-BLR-2026-012", headers=priya).json().get("sealed")


def test_admin_creates_loginable_account(client):
    admin = headers(client, "admin_terracrest")
    r = client.post("/admin/users", headers=admin, json={"username": "builder_test_100", "displayName": "Test Builder", "role": "builder"})
    assert r.status_code == 201
    assert client.post("/auth/login", json={"username": "builder_test_100", "password": "demo"}).status_code == 200


def test_admin_sets_listing_status(client):
    admin = headers(client, "admin_terracrest")
    r = client.patch("/admin/listings/BL-BLR-2026-008/status", headers=admin, json={"status": "under-offer"})
    assert r.status_code == 200 and r.json()["status"] == "under-offer"
