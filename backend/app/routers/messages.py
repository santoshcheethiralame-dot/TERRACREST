import datetime as dt
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import activity, models, schemas
from ..auth import get_current_user
from ..database import get_db
from .listings import can_see_sealed

router = APIRouter(tags=["messages"])


def _to_out(m: models.Message, author_name: str) -> schemas.MessageOut:
    return schemas.MessageOut(
        id=m.id,
        listing_id=m.listing_id,
        author_id=m.author_id,
        author_name=author_name,
        body=m.body,
        created_at=m.created_at,
    )


@router.get("/listings/{listing_id}/messages", response_model=list[schemas.MessageOut])
def list_messages(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    if not can_see_sealed(user, listing, db):
        return []  # the Deal Room opens only to entitled parties
    msgs = db.query(models.Message).filter_by(listing_id=listing_id).order_by(models.Message.created_at).all()
    names = {u.id: u.display_name for u in db.query(models.User).all()}
    return [_to_out(m, names.get(m.author_id, m.author_id)) for m in msgs]


@router.post("/listings/{listing_id}/messages", response_model=schemas.MessageOut, status_code=status.HTTP_201_CREATED)
def post_message(listing_id: str, body: schemas.PostMessageRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    if not can_see_sealed(user, listing, db):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "The Deal Room requires a logged NDA")
    text = body.body.strip()
    if not text:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty message")
    msg = models.Message(
        id=str(uuid.uuid4()),
        listing_id=listing_id,
        author_id=user.id,
        body=text,
        created_at=dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes"),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    activity.log(
        db, kind="message", summary=f"{user.display_name} posted in the {listing.headline} Deal Room",
        actor_id=user.id, actor_name=user.display_name, listing_id=listing_id,
    )
    return _to_out(msg, user.display_name)
