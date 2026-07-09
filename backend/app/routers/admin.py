import datetime as dt
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import activity, models, schemas
from ..auth import hash_password, require_admin
from ..database import get_db

# Every route here requires an admin identity.
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# ---------------------------------------------------------------- users
@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@router.post("/users", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_user(body: schemas.CreateUserRequest, db: Session = Depends(get_db)):
    username = body.username.strip().lower()
    if db.query(models.User).filter_by(username=username).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already exists")
    user = models.User(
        id=username,
        username=username,
        display_name=body.displayName,
        role=body.role,
        office_location=body.officeLocation,
        kyc_verified=True,
        member_since=dt.date.today().isoformat(),
        password_hash=hash_password("demo"),  # temp password; forced change on first login in production
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    activity.log(
        db, kind="access", summary=f"{user.display_name} granted membership access",
        actor_id=user.id, actor_name="Terracrest Desk",
    )
    return user


def _get_user_or_404(user_id: str, db: Session) -> models.User:
    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.patch("/users/{user_id}/password", response_model=schemas.PasswordResetOut)
def reset_password(user_id: str, db: Session = Depends(get_db)):
    """Issue a temporary password — the desk communicates it offline; the member changes it on first login."""
    user = _get_user_or_404(user_id, db)
    temp = secrets.token_urlsafe(6)
    user.password_hash = hash_password(temp)
    db.commit()
    return schemas.PasswordResetOut(temp_password=temp)


@router.patch("/users/{user_id}/active", response_model=schemas.UserOut)
def set_active(user_id: str, body: schemas.SetActiveRequest, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)
    user.active = body.active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/kyc", response_model=schemas.UserOut)
def set_kyc(user_id: str, body: schemas.SetKycRequest, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)
    user.kyc_verified = body.verified
    db.commit()
    db.refresh(user)
    return user


# ------------------------------------------------------------- listings
@router.get("/listings", response_model=list[schemas.ListingOut], response_model_exclude_none=True)
def list_all_listings(db: Session = Depends(get_db)):
    return [schemas.serialize_listing(l) for l in db.query(models.Listing).all()]


@router.patch("/listings/{listing_id}/status", response_model=schemas.ListingOut, response_model_exclude_none=True)
def set_listing_status(listing_id: str, body: schemas.UpdateStatusRequest, db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    listing.status = body.status
    db.commit()
    db.refresh(listing)
    activity.log(db, kind="status_change", summary=f"{listing.id} → {body.status}", actor_name="Terracrest Desk", listing_id=listing.id)
    return schemas.serialize_listing(listing)


_VAULT = [
    ("title-deed", "Title deed", "deed"),
    ("ec", "Encumbrance certificate", "certificate"),
    ("survey", "Boundary survey", "survey"),
    ("tax", "Tax receipts (3 yrs)", "receipt"),
]


@router.post("/listings", response_model=schemas.ListingOut, status_code=status.HTTP_201_CREATED, response_model_exclude_none=True)
def create_listing(body: schemas.CreateListingRequest, db: Session = Depends(get_db)):
    if db.get(models.Listing, body.id) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "A parcel with that ID already exists")
    owner = db.get(models.User, body.ownerId)
    if owner is None or owner.role != "landowner":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ownerId must be an existing land owner")

    survey = [s.strip() for s in body.surveyNos.split(",") if s.strip()]
    listing = models.Listing(
        id=body.id,
        vertical=body.vertical,
        headline=body.headline,
        status="verified",  # admin verifies on entry; publish separately
        locality_label=body.localityLabel,
        area_label=body.areaLabel,
        land_area_sqft=body.landAreaSqft,
        zoning=body.zoning,
        locality_note=body.localityNote,
        verification={"by": "Terracrest Site Team", "on": dt.date.today().strftime("%d %b %Y")},
        guidance={"low": body.guidanceLow, "high": body.guidanceHigh},
        owner_id=body.ownerId,
        public_area={"lat": body.areaLat, "lng": body.areaLng, "radiusKm": body.areaRadiusKm},
        sealed={
            "coords": {"lat": body.exactLat, "lng": body.exactLng},
            "address": body.address,
            "ownerName": body.ownerName,
            "surveyNos": survey,
            "contact": body.contact,
        },
        jd=(
            {"fsi": body.fsi, "approval": "Admin-entered", "roadWidthFt": 40, "suggestedModel": "TBD", "timelineMonths": 36}
            if body.vertical == "joint-development"
            else None
        ),
        warehouse=None,
        big_land=None,
        comps=[],
        feasibility={
            "plotAreaSqft": body.plotAreaSqft,
            "fsi": body.fsi,
            "setbackM": 6,
            "roadWidthFt": 40,
            "towers": body.towers,
            "floors": body.floors,
            "floorPlateEfficiency": 0.78,
            "avgUnitSqft": body.avgUnitSqft,
            "baseSalePsf": body.baseSalePsf,
        },
        created_at=dt.date.today().isoformat(),
    )
    db.add(listing)
    # give the new parcel a document vault so a member's view has real files
    for key, name, kind in _VAULT:
        db.add(models.Document(id=f"{body.id}-{key}", listing_id=body.id, name=name, kind=kind))
    db.commit()
    db.refresh(listing)
    activity.log(db, kind="listing_created", summary=f"Parcel {listing.id} created — {listing.headline}", actor_name="Terracrest Desk", listing_id=listing.id)
    return schemas.serialize_listing(listing)


# ----------------------------------------------------------------- deals
@router.get("/deals", response_model=list[schemas.DealOut])
def list_all_deals(db: Session = Depends(get_db)):
    return db.query(models.Deal).all()


# -------------------------------------------------------------- activity
@router.get("/activity", response_model=list[schemas.ActivityEventOut])
def list_activity(limit: int = 120, db: Session = Depends(get_db)):
    """The operations-centre audit feed — every consequential action, newest first."""
    return (
        db.query(models.ActivityEvent)
        .order_by(models.ActivityEvent.created_at.desc())
        .limit(min(max(limit, 1), 500))
        .all()
    )


# ----------------------------------------------------- architect reviews
@router.get("/architect-reviews", response_model=list[schemas.ArchitectReviewOut])
def list_architect_reviews(db: Session = Depends(get_db)):
    names = {u.id: u.display_name for u in db.query(models.User).all()}
    rows = db.query(models.ArchitectReview).order_by(models.ArchitectReview.requested_at.desc()).all()
    return [schemas.serialize_architect_review(r, names.get(r.builder_id, r.builder_id)) for r in rows]


@router.patch("/architect-reviews/{review_id}", response_model=schemas.ArchitectReviewOut)
def deliver_architect_review(review_id: str, body: schemas.DeliverArchitectReviewRequest, db: Session = Depends(get_db)):
    """The desk records the empanelled architect's stamped, validated figure."""
    review = db.get(models.ArchitectReview, review_id)
    if review is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Review not found")
    review.status = "delivered"
    review.architect_name = body.architectName
    review.architect_gdv = body.architectGdv
    review.architect_notes = body.architectNotes
    review.delivered_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    db.commit()
    db.refresh(review)
    listing = db.get(models.Listing, review.listing_id)
    activity.log(
        db, kind="architect",
        summary=f"Architect {body.architectName} delivered a validated GDV — {listing.headline if listing else review.listing_id}",
        actor_name="Terracrest Desk", listing_id=review.listing_id,
    )
    # The flywheel: this delivery is a new labelled example — refit the model.
    from ..ml import valuation as vmodel
    from .valuation import build_examples
    vmodel.retrain(build_examples(db))
    names = {u.id: u.display_name for u in db.query(models.User).all()}
    return schemas.serialize_architect_review(review, names.get(review.builder_id, review.builder_id))
