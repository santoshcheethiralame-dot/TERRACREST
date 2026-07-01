import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import activity, models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["listings"])

DISCOVERABLE = ("verified", "live", "under-offer")


def can_see_sealed(user: models.User, listing: models.Listing, db: Session) -> bool:
    """Entitlement to sealed details: the admin desk, the owning landowner, or a
    builder with a logged NDA against this parcel. No one else — ever."""
    if user.role == "admin":
        return True
    if user.id == listing.owner_id:
        return True
    nda = db.query(models.Nda).filter_by(listing_id=listing.id, builder_id=user.id).first()
    return nda is not None


@router.get("/listings", response_model=list[schemas.ListingOut], response_model_exclude_none=True)
def list_listings(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listings = db.query(models.Listing).filter(models.Listing.status.in_(DISCOVERABLE)).all()
    return [schemas.serialize_listing(l, can_see_sealed(user, l, db)) for l in listings]


@router.get("/listings/{listing_id}", response_model=schemas.ListingOut, response_model_exclude_none=True)
def get_listing(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    return schemas.serialize_listing(listing, can_see_sealed(user, listing, db))


@router.get("/listings/{listing_id}/unlocked", response_model=schemas.UnlockState)
def is_unlocked(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    nda = db.query(models.Nda).filter_by(listing_id=listing_id, builder_id=user.id).first()
    return schemas.UnlockState(unlocked=nda is not None)


@router.post("/listings/{listing_id}/nda", response_model=schemas.NdaOut)
def log_nda(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Records an executed physical NDA — the only gate that unseals a parcel.
    In production this is an admin action after a witnessed signing; here the
    entitled builder triggers it for the prototype."""
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")

    nda_id = f"NDA-{listing_id}-{user.id}"
    existing = db.get(models.Nda, nda_id)
    if existing is not None:
        return existing

    nda = models.Nda(
        id=nda_id,
        builder_id=user.id,
        landowner_id=listing.owner_id,
        listing_id=listing_id,
        signed_on=dt.date.today().isoformat(),
        witnessed_by="Adv. Meera Krishnan",
        scan_ref=f"/deals/{listing_id}/nda/",
    )
    db.add(nda)
    db.commit()
    db.refresh(nda)
    activity.log(
        db, kind="nda", summary=f"{user.display_name} logged an NDA — {listing.headline}",
        actor_id=user.id, actor_name=user.display_name, listing_id=listing_id,
    )
    return nda
