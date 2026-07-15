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


# ------------------------------------------------- full access (the moat)
def test_listings_requires_auth(client):
    assert client.get("/listings").status_code == 401


def test_any_member_sees_full_sealed_detail(client):
    h = headers(client, "builder_rajesh_001")
    listings = {l["id"]: l for l in client.get("/listings", headers=h).json()}
    assert listings["JD-BLR-2026-012"].get("sealed")
    assert listings["WH-BLR-2026-047"].get("sealed")
    assert listings["BL-BLR-2026-008"].get("sealed")


def test_public_area_and_sealed_both_present(client):
    h = headers(client, "builder_rajesh_001")
    wh = client.get("/listings/WH-BLR-2026-047", headers=h).json()
    assert wh.get("publicArea")
    assert wh.get("sealed") and "KIADB" in wh["sealed"]["address"]


def test_owner_sees_own_sealed(client):
    h = headers(client, "landowner_ramanathan_002")
    jd = client.get("/listings/JD-BLR-2026-012", headers=h).json()
    assert jd.get("sealed") and jd["sealed"]["ownerName"] == "Ramanathan Holdings LLP"


def test_a_second_member_sees_the_same_full_detail(client):
    """Membership itself is the gate — there is no further per-parcel unlock step."""
    h = headers(client, "builder_priya_003")
    jd = client.get("/listings/JD-BLR-2026-012", headers=h).json()
    assert jd.get("sealed") and jd["sealed"]["ownerName"] == "Ramanathan Holdings LLP"


# ------------------------------------------------------------- documents
def test_documents_always_listed_for_any_member(client):
    rajesh = headers(client, "builder_rajesh_001")
    priya = headers(client, "builder_priya_003")
    assert len(client.get("/listings/JD-BLR-2026-012/documents", headers=rajesh).json()) == 4
    assert len(client.get("/listings/WH-BLR-2026-047/documents", headers=priya).json()) == 4


def test_document_download_is_watermarked_pdf(client):
    h = headers(client, "builder_rajesh_001")
    r = client.get("/listings/JD-BLR-2026-012/documents/JD-BLR-2026-012-title-deed", headers=h)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content[:5] == b"%PDF-"


def test_document_download_works_for_any_member(client):
    priya = headers(client, "builder_priya_003")
    r = client.get("/listings/WH-BLR-2026-047/documents/WH-BLR-2026-047-title-deed", headers=priya)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"


# ------------------------------------------------------- admin authorization
def test_admin_forbidden_for_non_admin(client):
    assert client.get("/admin/users", headers=headers(client, "builder_rajesh_001")).status_code == 403


def test_admin_lists_all_users(client):
    r = client.get("/admin/users", headers=headers(client, "admin_terracrest"))
    assert r.status_code == 200 and len(r.json()) == 8


def test_admin_creates_loginable_account(client):
    admin = headers(client, "admin_terracrest")
    r = client.post("/admin/users", headers=admin, json={"username": "builder_test_100", "displayName": "Test Builder", "role": "builder"})
    assert r.status_code == 201
    assert client.post("/auth/login", json={"username": "builder_test_100", "password": "demo"}).status_code == 200


def test_admin_sets_listing_status(client):
    admin = headers(client, "admin_terracrest")
    r = client.patch("/admin/listings/BL-BLR-2026-008/status", headers=admin, json={"status": "under-offer"})
    assert r.status_code == 200 and r.json()["status"] == "under-offer"


def test_admin_creates_listing(client):
    admin = headers(client, "admin_terracrest")
    payload = {
        "id": "JD-BLR-2026-099", "vertical": "joint-development", "headline": "Test parcel",
        "localityLabel": "Test locality", "areaLabel": "~ 1 acre", "landAreaSqft": 43560,
        "zoning": "Residential", "localityNote": "Test note", "ownerId": "landowner_ramanathan_002",
        "guidanceLow": 40, "guidanceHigh": 50, "areaLat": 13.2, "areaLng": 77.7, "areaRadiusKm": 3.0,
        "address": "Test address", "ownerName": "Test Owner", "surveyNos": "1/1, 1/2", "contact": "+91 000",
        "exactLat": 13.21, "exactLng": 77.71, "plotAreaSqft": 43560, "fsi": 2.0, "floors": 10,
        "towers": 2, "avgUnitSqft": 1200, "baseSalePsf": 7000,
    }
    r = client.post("/admin/listings", headers=admin, json=payload)
    assert r.status_code == 201
    assert r.json()["id"] == "JD-BLR-2026-099" and r.json()["status"] == "verified"
    # appears in discovery, full detail visible to any member immediately, and has a vault
    builder = headers(client, "builder_rajesh_001")
    assert "JD-BLR-2026-099" in [l["id"] for l in client.get("/listings", headers=builder).json()]
    assert client.get("/listings/JD-BLR-2026-099", headers=builder).json().get("sealed")
    assert len(client.get("/listings/JD-BLR-2026-099/documents", headers=admin).json()) == 4


def test_admin_create_listing_rejects_duplicate(client):
    admin = headers(client, "admin_terracrest")
    dup = {
        "id": "JD-BLR-2026-012", "vertical": "joint-development", "headline": "x", "localityLabel": "x",
        "areaLabel": "x", "landAreaSqft": 1, "zoning": "x", "localityNote": "x", "ownerId": "landowner_ramanathan_002",
        "guidanceLow": 1, "guidanceHigh": 2, "areaLat": 0, "areaLng": 0, "areaRadiusKm": 1, "address": "x",
        "ownerName": "x", "surveyNos": "1", "contact": "x", "exactLat": 0, "exactLng": 0, "plotAreaSqft": 1,
        "fsi": 1, "floors": 1, "towers": 1, "avgUnitSqft": 1, "baseSalePsf": 1,
    }
    assert client.post("/admin/listings", headers=admin, json=dup).status_code == 409


# ------------------------------------------------------------- deal room
def test_deal_room_open_to_any_member(client):
    rajesh = headers(client, "builder_rajesh_001")
    priya = headers(client, "builder_priya_003")
    assert len(client.get("/listings/JD-BLR-2026-012/messages", headers=rajesh).json()) == 5
    assert len(client.get("/listings/JD-BLR-2026-012/messages", headers=priya).json()) == 5
    r = client.post("/listings/JD-BLR-2026-012/messages", headers=priya, json={"body": "Interested in this parcel too."})
    assert r.status_code == 201 and r.json()["authorId"] == "builder_priya_003"
    assert len(client.get("/listings/JD-BLR-2026-012/messages", headers=rajesh).json()) == 6


def test_deal_room_meeting_and_share(client):
    rajesh = headers(client, "builder_rajesh_001")
    msgs = client.get("/listings/JD-BLR-2026-012/messages", headers=rajesh).json()
    # the seed carries a scheduled meeting and a proposed split
    assert any(m.get("meetingTime") for m in msgs)
    assert any((m.get("dealShare") or {}).get("builderPct") == 60 for m in msgs)
    # a builder can post a fresh revenue-split proposal that round-trips
    r = client.post(
        "/listings/JD-BLR-2026-012/messages",
        headers=rajesh,
        json={"body": "Revised offer.", "dealShare": {"builderPct": 55, "landownerPct": 45}},
    )
    assert r.status_code == 201
    assert r.json()["dealShare"] == {"builderPct": 55, "landownerPct": 45}


# ------------------------------------------------- admin user management
def test_admin_user_management(client):
    admin = headers(client, "admin_terracrest")
    # reset password: temp works, old fails
    r = client.patch("/admin/users/builder_priya_003/password", headers=admin)
    assert r.status_code == 200
    temp = r.json()["tempPassword"]
    assert client.post("/auth/login", json={"username": "builder_priya_003", "password": "demo"}).status_code == 401
    assert client.post("/auth/login", json={"username": "builder_priya_003", "password": temp}).status_code == 200
    # deactivate blocks login (403), reactivate restores it
    assert client.patch("/admin/users/builder_priya_003/active", headers=admin, json={"active": False}).status_code == 200
    assert client.post("/auth/login", json={"username": "builder_priya_003", "password": temp}).status_code == 403
    client.patch("/admin/users/builder_priya_003/active", headers=admin, json={"active": True})
    assert client.post("/auth/login", json={"username": "builder_priya_003", "password": temp}).status_code == 200
    # toggle KYC
    r = client.patch("/admin/users/builder_priya_003/kyc", headers=admin, json={"verified": False})
    assert r.status_code == 200 and r.json()["kycVerified"] is False


# ------------------------------------------------------------- price book
def test_pricebook_read_and_admin_update(client):
    rajesh = headers(client, "builder_rajesh_001")
    admin = headers(client, "admin_terracrest")
    # any authenticated user can read the live rates the Studio prices against
    r = client.get("/pricebook", headers=rajesh)
    assert r.status_code == 200
    pb = r.json()
    assert pb["baseBuildPsf"] == 2150 and pb["rates"]["flooring:mid"] == 85
    # non-admin cannot rewrite the book
    assert client.patch("/admin/pricebook", headers=rajesh, json={"baseBuildPsf": 1, "rates": {}}).status_code == 403
    # admin update persists and is served on the next read
    new_rates = dict(pb["rates"], **{"flooring:mid": 99})
    up = client.patch("/admin/pricebook", headers=admin, json={"baseBuildPsf": 2300, "rates": new_rates})
    assert up.status_code == 200 and up.json()["baseBuildPsf"] == 2300
    assert client.get("/pricebook", headers=rajesh).json()["rates"]["flooring:mid"] == 99


# ---------------------------------------------------------- activity feed
def test_activity_feed_admin_only_and_grows(client):
    rajesh = headers(client, "builder_rajesh_001")
    admin = headers(client, "admin_terracrest")
    # the audit feed is admin-only
    assert client.get("/admin/activity", headers=rajesh).status_code == 403
    before = client.get("/admin/activity", headers=admin).json()
    assert len(before) >= 6  # seeded history
    # consequential actions append events; the feed reflects them
    client.post("/listings/JD-BLR-2026-012/messages", headers=rajesh, json={"body": "Audit me."})
    client.get("/listings/JD-BLR-2026-012/documents/JD-BLR-2026-012-title-deed", headers=rajesh)
    after = client.get("/admin/activity", headers=admin).json()
    assert len(after) > len(before)
    kinds = {ev["kind"] for ev in after}
    assert {"login", "message", "document"} <= kinds
    # returned newest-first (non-increasing timestamps)
    stamps = [ev["createdAt"] for ev in after]
    assert stamps == sorted(stamps, reverse=True)


# ------------------------------------------------- architect validation
def test_architect_review_flow(client):
    rajesh = headers(client, "builder_rajesh_001")
    admin = headers(client, "admin_terracrest")
    snap = {"units": 120, "saleableSqft": 170000, "baseNet": 800000000, "constructionCost": 700000000, "salePsf": 8000}
    # a builder commissions validation
    r = client.post("/architect-reviews", headers=rajesh, json={"listingId": "JD-BLR-2026-012", "mlSnapshot": snap})
    assert r.status_code == 201
    review = r.json()
    assert review["status"] == "requested" and review["fee"] == 250000 and review["mlSnapshot"]["baseNet"] == 800000000
    rid = review["id"]
    # it shows up in the builder's own list and the admin queue
    assert any(x["id"] == rid for x in client.get("/me/architect-reviews", headers=rajesh).json())
    assert any(x["id"] == rid for x in client.get("/admin/architect-reviews", headers=admin).json())
    # the desk delivers the architect's validated figure
    payload = {"architectName": "Test Architect · CoA 1", "architectGdv": 775000000, "architectNotes": "Trimmed for NBC."}
    d = client.patch(f"/admin/architect-reviews/{rid}", headers=admin, json=payload)
    assert d.status_code == 200
    body = d.json()
    assert body["status"] == "delivered" and body["architectGdv"] == 775000000 and body["deliveredAt"]
    # the builder now sees the delivered validation
    mine = {x["id"]: x for x in client.get("/me/architect-reviews", headers=rajesh).json()}
    assert mine[rid]["status"] == "delivered" and mine[rid]["architectName"] == "Test Architect · CoA 1"
    # a non-admin cannot deliver
    assert client.patch(f"/admin/architect-reviews/{rid}", headers=rajesh, json=payload).status_code == 403


# ------------------------------------------------- lawyer + document verification
def test_lawyer_verification_seeded_and_admin_upsert(client):
    rajesh = headers(client, "builder_rajesh_001")
    admin = headers(client, "admin_terracrest")
    lv = client.get("/listings/JD-BLR-2026-012/lawyer-verification", headers=rajesh).json()
    assert lv and lv["lawyerName"] == "Adv. Meera Krishnan" and lv["verified"] is True
    # a non-admin cannot record a verification
    assert client.put(
        "/admin/listings/JD-BLR-2026-012/lawyer-verification", headers=rajesh,
        json={"lawyerName": "X", "barCouncilNo": "Y", "verificationDate": "2026-07-01"},
    ).status_code == 403
    # the desk upserts a fresh figure
    r = client.put(
        "/admin/listings/JD-BLR-2026-012/lawyer-verification", headers=admin,
        json={"lawyerName": "Adv. New", "barCouncilNo": "KAR/2020/1", "verificationDate": "2026-07-01", "remarks": "clear", "verified": True},
    )
    assert r.status_code == 200 and r.json()["lawyerName"] == "Adv. New"
    assert client.get("/listings/JD-BLR-2026-012/lawyer-verification", headers=rajesh).json()["lawyerName"] == "Adv. New"


def test_document_summary_seeded_and_gated(client):
    rajesh = headers(client, "builder_rajesh_001")
    ds = client.get("/listings/JD-BLR-2026-012/document-summary", headers=rajesh).json()
    assert ds and "Ramanathan Holdings LLP" in ds["ownershipChain"]
    # member-gated
    assert client.get("/listings/JD-BLR-2026-012/document-summary").status_code == 401


# ------------------------------------------------------ warehouse reservations
def test_reservation_full_lifecycle(client):
    biz = headers(client, "bizowner_iyer_007")
    r = client.post("/listings/WH-BLR-2026-047/reservations", headers=biz)
    assert r.status_code == 201
    res = r.json()
    assert res["status"] == "held" and res["listingId"] == "WH-BLR-2026-047"
    rid = res["id"]

    # it shows up in the business owner's own list
    mine = client.get("/me/reservations", headers=biz).json()
    assert any(x["id"] == rid and x["status"] == "held" for x in mine)

    # a second hold on the same warehouse is rejected while one is active
    assert client.post("/listings/WH-BLR-2026-047/reservations", headers=biz).status_code == 409

    # confirm persists server-side — re-fetching proves it, not just the response
    c = client.patch(f"/reservations/{rid}/confirm", headers=biz)
    assert c.status_code == 200 and c.json()["status"] == "confirmed" and c.json()["confirmedAt"]
    assert client.get("/me/reservations", headers=biz).json()[0]["status"] == "confirmed"

    # release persists too, and frees the listing for a new hold
    rel = client.patch(f"/reservations/{rid}/release", headers=biz)
    assert rel.status_code == 200 and rel.json()["status"] == "released"
    assert client.get("/me/reservations", headers=biz).json()[0]["status"] == "released"
    again = client.post("/listings/WH-BLR-2026-047/reservations", headers=biz)
    assert again.status_code == 201


def test_reservation_role_and_ownership_gating(client):
    rajesh = headers(client, "builder_rajesh_001")  # not a business account
    biz = headers(client, "bizowner_iyer_007")
    priya = headers(client, "builder_priya_003")

    # only a business (or admin) account may hold
    assert client.post("/listings/WH-BLR-2026-047/reservations", headers=rajesh).status_code == 403

    r = client.post("/listings/WH-BLR-2026-047/reservations", headers=biz).json()
    # someone else can't confirm or release another member's hold
    assert client.patch(f"/reservations/{r['id']}/confirm", headers=priya).status_code == 403
    assert client.patch(f"/reservations/{r['id']}/release", headers=priya).status_code == 403


# --------------------------------------------------- valuation intelligence
def test_valuation_predict_and_bands(client):
    h = headers(client, "builder_rajesh_001")
    body = {
        "vertical": "joint-development", "fsi": 2.25, "floors": 14, "towers": 4,
        "plotAreaSqft": 104444, "floorPlateEfficiency": 0.78, "avgUnitSqft": 1400,
        "baseSalePsf": 8200, "roadWidthFt": 40, "parametricNet": 862_000_000,
    }
    r = client.post("/valuation/predict", headers=h, json=body)
    assert r.status_code == 200
    p = r.json()
    # a sensible, bounded correction with a coherent P10<ML<P90 band
    assert p["p10"] < p["mlGdv"] < p["p90"]
    assert -15 < p["adjustmentPct"] < 8
    # aggressive high-rise is trimmed harder than the base case
    agg = client.post("/valuation/predict", headers=h, json={**body, "floors": 22, "fsi": 3.1, "baseSalePsf": 11500, "parametricNet": 900_000_000}).json()
    assert agg["adjustmentPct"] < p["adjustmentPct"]


def test_model_card_is_transparent(client):
    card = client.get("/valuation/model-card", headers=headers(client, "builder_rajesh_001")).json()
    assert card["nExamples"] > 100
    assert card["nReal"] >= 1  # the seed JD delivery folds in at boot
    assert 0.0 <= card["metrics"]["r2"] <= 1.0
    assert card["importances"][0]["feature"] in {f["feature"] for f in card["importances"]}
    assert len(card["importances"]) == 11


def test_listing_risk_scorecard(client):
    r = client.get("/listings/JD-BLR-2026-012/risk", headers=headers(client, "builder_rajesh_001"))
    assert r.status_code == 200
    body = r.json()
    assert 0 <= body["overall"] <= 100 and body["grade"] in {"A", "B", "C", "D"}
    assert {b["key"] for b in body["bands"]} == {"title", "liquidity", "appreciation"}
    # every point is explained by at least one factor
    assert all(b["factors"] for b in body["bands"])


def test_retrain_admin_only(client):
    assert client.post("/admin/valuation/retrain", headers=headers(client, "builder_rajesh_001")).status_code == 403
    card = client.post("/admin/valuation/retrain", headers=headers(client, "admin_terracrest")).json()
    assert card["nExamples"] > 100
