from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["dashboard"])


@router.get("/listings/{listing_id}/engagement", response_model=Optional[schemas.EngagementOut])
def engagement(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.get(models.Engagement, listing_id)


@router.get("/listings/{listing_id}/offers", response_model=list[schemas.OfferOut])
def offers(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Offer).filter_by(listing_id=listing_id).all()


@router.get("/listings/{listing_id}/ndas", response_model=list[schemas.NdaOut])
def ndas_for_listing(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Nda).filter_by(listing_id=listing_id).all()


@router.get("/me/properties", response_model=list[schemas.ListingOut], response_model_exclude_none=True)
def my_properties(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listings = db.query(models.Listing).filter_by(owner_id=user.id).all()
    # An owner always sees their own sealed details.
    return [schemas.serialize_listing(l, True) for l in listings]


@router.get("/me/ndas", response_model=list[schemas.NdaOut])
def my_ndas(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Nda).filter_by(builder_id=user.id).all()


@router.get("/me/deals", response_model=list[schemas.DealOut])
def my_deals(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Deal).filter_by(builder_id=user.id).all()
