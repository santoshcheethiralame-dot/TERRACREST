from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["listings"])

DISCOVERABLE = ("verified", "live", "under-offer")


@router.get("/listings", response_model=list[schemas.ListingOut], response_model_exclude_none=True)
def list_listings(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listings = db.query(models.Listing).filter(models.Listing.status.in_(DISCOVERABLE)).all()
    return [schemas.serialize_listing(l) for l in listings]


@router.get("/listings/{listing_id}", response_model=schemas.ListingOut, response_model_exclude_none=True)
def get_listing(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    return schemas.serialize_listing(listing)
