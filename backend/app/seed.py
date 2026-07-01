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


def _ndas():
    return [
        models.Nda(
            id="NDA-JD-012-rajesh", builder_id="builder_rajesh_001", landowner_id="landowner_ramanathan_002",
            listing_id="JD-BLR-2026-012", signed_on="2026-06-24", witnessed_by="Adv. Meera Krishnan",
            scan_ref="/deals/deal_001/nda/",
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
                    stage="nda-signed", est_commission=17000000, rm="Kavya R."),
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


def _insert_all(db) -> None:
    db.add_all(_users())
    db.add_all(_listings())
    db.add_all(_ndas())
    db.add_all(_offers())
    db.add_all(_engagements())
    db.add_all(_deals())
    db.add_all(_documents())
    db.commit()


def seed() -> None:
    """Destructive full reset — for local dev (`python -m app.seed`)."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _insert_all(db)
        print("Seeded: 7 users, 3 listings, 1 NDA, 4 offers, 2 engagements, 1 deal.")
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
