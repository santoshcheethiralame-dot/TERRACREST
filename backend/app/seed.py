"""Populate the database with the same Bengaluru book of business as the
frontend seed. Run:  python -m app.seed   (drops and recreates all tables)."""

from .auth import hash_password
from .database import Base, SessionLocal, engine
from . import models

DEMO_PASSWORD = "demo"


def _users():
    pw = hash_password(DEMO_PASSWORD)
    rows = [
        ("builder_rajesh_001", "Rajesh Menon · Rajesh Developers", "builder", "Koramangala, Bengaluru", "2026-03-11"),
        ("builder_priya_003", "Priya Nair · Priya Estates", "builder", "Whitefield, Bengaluru", "2026-04-02"),
        ("landowner_ramanathan_002", "S. Ramanathan · Ramanathan Holdings LLP", "landowner", None, "2026-02-19"),
        ("landowner_gupta_004", "A. Gupta · Gupta Warehousing", "landowner", None, "2026-03-28"),
        ("landowner_narayan_006", "Narayan Family Trust", "landowner", None, "2026-05-06"),
        ("investor_khanna_005", "A. Khanna · Khanna Family Office", "investor", "Indiranagar, Bengaluru", "2026-01-30"),
        ("admin_terracrest", "Terracrest Desk", "admin", None, "2025-12-01"),
    ]
    return [
        models.User(
            id=uid, username=uid, display_name=name, role=role,
            office_location=office, kyc_verified=True, member_since=since, password_hash=pw,
        )
        for uid, name, role, office, since in rows
    ]


def _listings():
    return [
        models.Listing(
            id="JD-BLR-2026-012",
            vertical="joint-development",
            headline="North-corridor JD parcel — podium and four towers",
            status="live",
            locality_label="Sector 4, Devanahalli · Bengaluru North",
            area_label="≈ 2.4 acres",
            land_area_sqft=104444,
            zoning="Residential (BDA) · high-rise permissible",
            locality_note=(
                "Personally inspected on 12 June 2026. A rare corner holding on the Devanahalli "
                "growth corridor, ten minutes from the airport toll. Clean single-owner title, no "
                "encumbrance. The frontage road is fully formed; a Prestige launch a kilometre north "
                "has reset guidance upward."
            ),
            verification={"by": "Terracrest Site Team", "on": "12 June 2026"},
            guidance={"low": 85, "high": 95},
            public_area={"lat": 13.25, "lng": 77.70, "radiusKm": 3.5},
            owner_id="landowner_ramanathan_002",
            sealed={
                "coords": {"lat": 13.2437, "lng": 77.7172},
                "address": "Survey 141, Sector 4, Devanahalli Industrial Area, Bengaluru 562110",
                "ownerName": "Ramanathan Holdings LLP",
                "surveyNos": ["141/2B", "141/3"],
                "contact": "+91 98••• ••••• (via RM)",
            },
            jd={
                "fsi": 2.25,
                "approval": "BDA approved · plan-sanction ready",
                "roadWidthFt": 40,
                "suggestedModel": "60:40 revenue share (owner-favoured)",
                "timelineMonths": 36,
            },
            comps=[
                {"project": "Prestige (undisclosed)", "distanceKm": 1.2, "psf": 8200, "year": 2024, "note": "Direct comparable"},
                {"project": "Sobha (undisclosed)", "distanceKm": 2.8, "psf": 7800, "year": 2023, "note": "Older — adjust down"},
            ],
            feasibility={
                "plotAreaSqft": 104444, "fsi": 2.25, "setbackM": 6, "roadWidthFt": 40,
                "towers": 4, "floors": 14, "floorPlateEfficiency": 0.78, "avgUnitSqft": 1400, "baseSalePsf": 8200,
            },
            created_at="2026-06-14",
        ),
        models.Listing(
            id="WH-BLR-2026-047",
            vertical="warehouse",
            headline="Grade-A warehouse shell — Hoskote logistics belt",
            status="under-offer",
            locality_label="Hoskote–Doddaballapur belt · Bengaluru East",
            area_label="≈ 1.1 lakh sq ft built",
            land_area_sqft=160000,
            zoning="Industrial / warehousing",
            locality_note=(
                "Sits amid operational Amazon and Flipkart last-mile hubs. Labour strong — three "
                "villages within 5 km. The last-mile approach is unpaved for 200 m; we recommend "
                "grading before lease. Power reliable at 500 kW, 3-phase. No flooding risk — verified "
                "with panchayat records."
            ),
            verification={"by": "Terracrest Site Team", "on": "12 June 2026"},
            guidance={"low": 34, "high": 38},
            public_area={"lat": 13.08, "lng": 77.79, "radiusKm": 3.0},
            owner_id="landowner_gupta_004",
            sealed={
                "coords": {"lat": 13.0731, "lng": 77.7979},
                "address": "Plot 22, KIADB Hoskote Phase 2, Bengaluru 560067",
                "ownerName": "Gupta Warehousing Pvt Ltd",
                "surveyNos": ["58/1"],
                "contact": "+91 99••• ••••• (via RM)",
            },
            warehouse={
                "clearHeightM": 7.5, "docks": 12, "powerKw": 500, "floorLoadTonM2": 5, "leaseType": "Long-term / sale",
            },
            comps=[
                {"project": "KIADB Grade-A shed", "distanceKm": 2.1, "psf": 3100, "year": 2025, "note": "Capital-value comp"},
            ],
            feasibility={
                "plotAreaSqft": 160000, "fsi": 1.0, "setbackM": 9, "roadWidthFt": 60,
                "towers": 1, "floors": 1, "floorPlateEfficiency": 0.92, "avgUnitSqft": 110000, "baseSalePsf": 3100,
            },
            created_at="2026-05-30",
        ),
        models.Listing(
            id="BL-BLR-2026-008",
            vertical="big-land",
            headline="Contiguous 12-acre holding — Nandi foothills",
            status="live",
            locality_label="Off Nandi Hills Road · Chikkaballapur",
            area_label="≈ 12 acres",
            land_area_sqft=522720,
            zoning="Agricultural · conversion potential (resort / managed farmland)",
            locality_note=(
                "A clean contiguous parcel with road frontage and a live borewell. Appreciation is "
                "driven by the airport–Nandi corridor and weekend-home demand. Boundaries were walked "
                "and cross-checked against the RTC; one historical claim on the northern edge is "
                "resolved and documented."
            ),
            verification={"by": "Terracrest Site Team", "on": "20 June 2026"},
            guidance={"low": 60, "high": 72},
            public_area={"lat": 13.37, "lng": 77.68, "radiusKm": 4.0},
            owner_id="landowner_narayan_006",
            sealed={
                "coords": {"lat": 13.3702, "lng": 77.6835},
                "address": "Survey 9 & 11, Sultanpet Hobli, Chikkaballapur 562101",
                "ownerName": "Estate of B. Narayan (family trust)",
                "surveyNos": ["9/1", "9/2", "11"],
                "contact": "+91 97••• ••••• (via RM)",
            },
            big_land={
                "soil": "Red loam, good percolation",
                "waterTable": "Borewell at 240 ft, year-round",
                "disputes": "One northern-edge claim — resolved and documented",
                "horizonYears": 5,
                "appreciationNote": "Airport–Nandi corridor; weekend-home demand rising",
            },
            comps=[
                {"project": "Managed farmland plots", "distanceKm": 3.5, "psf": 900, "year": 2025, "note": "Per-sq-ft land comp"},
            ],
            feasibility={
                "plotAreaSqft": 522720, "fsi": 0.15, "setbackM": 12, "roadWidthFt": 30,
                "towers": 6, "floors": 2, "floorPlateEfficiency": 0.7, "avgUnitSqft": 2400, "baseSalePsf": 900,
            },
            created_at="2026-06-21",
        ),
    ]


def _offers():
    data = [
        ("OF-1", "WH-BLR-2026-047", "Rajesh Developers", "Lease", "₹18.0 / sq ft", "5-year lock · 15% escalation", "pending"),
        ("OF-2", "WH-BLR-2026-047", "Priya Logistics", "Lease", "₹17.5 / sq ft", "3-year lock · 10% escalation", "pending"),
        ("OF-3", "JD-BLR-2026-012", "Rajesh Developers", "Joint Development", "62:38 revenue share", "₹6 Cr refundable deposit", "pending"),
        ("OF-4", "JD-BLR-2026-012", "Priya Estates", "Joint Development", "58:42 revenue share", "₹4 Cr refundable deposit · faster start", "pending"),
    ]
    return [models.Offer(id=i, listing_id=l, builder=b, type=t, quote=q, terms=tm, status=s) for i, l, b, t, q, tm, s in data]


def _engagements():
    return [
        models.Engagement(
            listing_id="JD-BLR-2026-012",
            views=[{"by": "builder_rajesh_001", "at": "Today 11:23"}, {"by": "builder_priya_003", "at": "Yesterday 18:40"}],
            shortlists=["builder_rajesh_001", "builder_priya_003"],
            site_visits=[{"by": "builder_rajesh_001", "at": "Scheduled 5 Jul 2026"}],
        ),
        models.Engagement(
            listing_id="WH-BLR-2026-047",
            views=[{"by": "builder_rajesh_001", "at": "Today 09:05"}],
            shortlists=["builder_rajesh_001"],
            site_visits=[],
        ),
    ]


def _deals():
    return [
        models.Deal(id="deal_001", listing_id="JD-BLR-2026-012", builder_id="builder_rajesh_001",
                    stage="engaged", est_commission=17000000, rm="Kavya R."),
    ]


def _documents():
    per = [
        ("title-deed", "Title deed", "deed"),
        ("ec", "Encumbrance certificate", "certificate"),
        ("survey", "Boundary survey", "survey"),
        ("tax", "Tax receipts (3 yrs)", "receipt"),
    ]
    rows = []
    for lid in ("JD-BLR-2026-012", "WH-BLR-2026-047", "BL-BLR-2026-008"):
        for key, name, kind in per:
            rows.append(models.Document(id=f"{lid}-{key}", listing_id=lid, name=name, kind=kind))
    return rows


def _messages():
    return [
        models.Message(id="msg_001", listing_id="JD-BLR-2026-012", author_id="landowner_ramanathan_002",
                       body="Welcome, Rajesh. Happy to discuss the JD terms once you've reviewed the title set.",
                       created_at="2026-06-25T10:15+00:00"),
        models.Message(id="msg_002", listing_id="JD-BLR-2026-012", author_id="builder_rajesh_001",
                       body="Thank you. The FSI and approvals look clean — can we schedule a site walk next week?",
                       created_at="2026-06-25T11:40+00:00"),
        models.Message(id="msg_003", listing_id="JD-BLR-2026-012", author_id="landowner_ramanathan_002",
                       body="Certainly. Our RM Kavya will coordinate — proposing Tuesday morning.",
                       created_at="2026-06-26T09:05+00:00"),
    ]


def _pricebook():
    tiers = {
        "flooring": {"budget": 45, "mid": 85, "premium": 220, "luxury": 450},
        "sanitary": {"budget": 20, "mid": 45, "premium": 95, "luxury": 190},
        "kitchen": {"budget": 30, "mid": 70, "premium": 150, "luxury": 320},
        "windows": {"budget": 35, "mid": 80, "premium": 160, "luxury": 300},
        "lift": {"budget": 15, "mid": 35, "premium": 60, "luxury": 95},
        "facade": {"budget": 25, "mid": 55, "premium": 95, "luxury": 210},
    }
    rates = {f"{cat}:{tier}": psf for cat, ts in tiers.items() for tier, psf in ts.items()}
    return models.PriceBook(id="current", base_build_psf=2150, rates=rates)


def _architect_reviews():
    # One delivered (so a builder sees the ML-vs-architect comparison) and one
    # pending (so the desk has something to action in a demo).
    ml = {"units": 130, "saleableSqft": 183259, "baseNet": 862000000, "constructionCost": 731000000, "salePsf": 8200}
    return [
        models.ArchitectReview(
            id="ar_001", listing_id="JD-BLR-2026-012", builder_id="builder_rajesh_001",
            status="delivered", fee=250000, ml_snapshot=ml,
            architect_name="Sundaram & Associates · CoA CA/2011/48210",
            architect_gdv=834000000,
            architect_notes=(
                "Massing holds at G+14 across four towers. Two units per floor drop to meet NBC "
                "refuge-floor and lift-lobby norms, trimming saleable ~1.6%. Construction rate revised "
                "up for the podium transfer-slab. Net: a disciplined, financeable model — buildable as drawn."
            ),
            requested_at="2026-06-26T09:20:00+00:00", delivered_at="2026-06-29T17:05:00+00:00",
        ),
        models.ArchitectReview(
            id="ar_002", listing_id="WH-BLR-2026-047", builder_id="builder_rajesh_001",
            status="requested", fee=250000,
            ml_snapshot={"units": 1, "saleableSqft": 101200, "baseNet": 214000000, "constructionCost": 289000000, "salePsf": 3100},
            requested_at="2026-07-01T12:40:00+00:00",
        ),
    ]


def _activity():
    # A little history so the operations-centre feed isn't empty on first boot.
    rows = [
        ("ev_0", "Terracrest Desk", "builder_rajesh_001", "access", None, "Rajesh Menon · Rajesh Developers granted membership access", "2026-03-11T09:00:00+00:00"),
        ("ev_1", "Terracrest Desk", None, "listing_created", "JD-BLR-2026-012", "Parcel JD-BLR-2026-012 created — North-corridor JD parcel", "2026-06-14T09:12:00+00:00"),
        ("ev_2", "Terracrest Desk", None, "status_change", "JD-BLR-2026-012", "JD-BLR-2026-012 → live", "2026-06-20T15:41:00+00:00"),
        ("ev_3", "Rajesh Menon · Rajesh Developers", "builder_rajesh_001", "login", None, "Rajesh Menon · Rajesh Developers signed in", "2026-06-24T08:03:00+00:00"),
        ("ev_4", "Rajesh Menon · Rajesh Developers", "builder_rajesh_001", "document", "JD-BLR-2026-012", "Rajesh Menon · Rajesh Developers opened “Title deed” — North-corridor JD parcel", "2026-06-24T10:31:00+00:00"),
        ("ev_5", "Rajesh Menon · Rajesh Developers", "builder_rajesh_001", "message", "JD-BLR-2026-012", "Rajesh Menon · Rajesh Developers posted in the North-corridor JD parcel Deal Room", "2026-06-25T11:40:00+00:00"),
    ]
    return [
        models.ActivityEvent(id=i, actor_name=an, actor_id=aid, kind=k, listing_id=lid, summary=s, created_at=ts)
        for i, an, aid, k, lid, s, ts in rows
    ]


def _insert_all(db) -> None:
    db.add_all(_users())
    db.add_all(_listings())
    db.add_all(_offers())
    db.add_all(_engagements())
    db.add_all(_deals())
    db.add_all(_documents())
    db.add_all(_messages())
    db.add(_pricebook())
    db.add_all(_architect_reviews())
    db.add_all(_activity())
    db.commit()


def seed() -> None:
    """Destructive full reset — for local dev (`python -m app.seed`)."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _insert_all(db)
        print("Seeded: 7 users, 3 listings, 4 offers, 2 engagements, 1 deal.")
        print(f"All demo logins use password: {DEMO_PASSWORD!r}")
    finally:
        db.close()


def seed_if_empty() -> None:
    """Create tables and seed only if the database is empty. Safe to call on
    every startup — a fresh hosted Postgres populates itself on first boot."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).first() is None:
            _insert_all(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
