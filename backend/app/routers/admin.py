import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
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
    return user


# ------------------------------------------------------------- listings
@router.get("/listings", response_model=list[schemas.ListingOut], response_model_exclude_none=True)
def list_all_listings(db: Session = Depends(get_db)):
    return [schemas.serialize_listing(l, True) for l in db.query(models.Listing).all()]


@router.patch("/listings/{listing_id}/status", response_model=schemas.ListingOut, response_model_exclude_none=True)
def set_listing_status(listing_id: str, body: schemas.UpdateStatusRequest, db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    listing.status = body.status
    db.commit()
    db.refresh(listing)
    return schemas.serialize_listing(listing, True)


# ------------------------------------------------------------------ ndas
@router.get("/ndas", response_model=list[schemas.NdaOut])
def list_all_ndas(db: Session = Depends(get_db)):
    return db.query(models.Nda).all()


@router.post("/ndas", response_model=schemas.NdaOut, status_code=status.HTTP_201_CREATED)
def log_nda(body: schemas.CreateNdaRequest, db: Session = Depends(get_db)):
    """The desk records a witnessed NDA — this is what unseals a parcel for a builder."""
    listing = db.get(models.Listing, body.listingId)
    builder = db.get(models.User, body.builderId)
    if listing is None or builder is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Builder or parcel not found")
    nda_id = f"NDA-{body.listingId}-{body.builderId}"
    existing = db.get(models.Nda, nda_id)
    if existing is not None:
        return existing
    nda = models.Nda(
        id=nda_id,
        builder_id=body.builderId,
        landowner_id=listing.owner_id,
        listing_id=body.listingId,
        signed_on=dt.date.today().isoformat(),
        witnessed_by="Adv. Meera Krishnan",
        scan_ref=f"/deals/{body.listingId}/nda/",
    )
    db.add(nda)
    db.commit()
    db.refresh(nda)
    return nda


# ----------------------------------------------------------------- deals
@router.get("/deals", response_model=list[schemas.DealOut])
def list_all_deals(db: Session = Depends(get_db)):
    return db.query(models.Deal).all()
