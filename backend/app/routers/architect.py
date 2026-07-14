import datetime as dt
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import activity, models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["architect"])

# The Stage-Two engagement fee, adjustable against commission on closure.
FEE = 250_000


@router.post("/architect-reviews", response_model=schemas.ArchitectReviewOut, status_code=status.HTTP_201_CREATED)
def request_review(
    body: schemas.RequestArchitectReviewRequest,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """A builder commissions the empanelled architect to validate a Studio model."""
    listing = db.get(models.Listing, body.listingId)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")

    review = models.ArchitectReview(
        id=str(uuid.uuid4()),
        listing_id=body.listingId,
        builder_id=user.id,
        status="requested",
        fee=FEE,
        ml_snapshot=body.mlSnapshot,
        requested_at=dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    activity.log(
        db, kind="architect",
        summary=f"{user.display_name} commissioned architect validation — {listing.headline}",
        actor_id=user.id, actor_name=user.display_name, listing_id=listing.id,
    )
    return schemas.serialize_architect_review(review, user.display_name)


@router.get("/me/architect-reviews", response_model=list[schemas.ArchitectReviewOut])
def my_reviews(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.ArchitectReview)
        .filter_by(builder_id=user.id)
        .order_by(models.ArchitectReview.requested_at.desc())
        .all()
    )
    return [schemas.serialize_architect_review(r, user.display_name) for r in rows]
