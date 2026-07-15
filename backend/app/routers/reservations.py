import datetime as dt
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import activity, models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["reservations"])

ACTIVE_STATUSES = ("held", "confirmed")
HOLD_DAYS = 14


def _require_reserver(user: models.User) -> None:
    if user.role not in ("business_owner", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only a business account may hold a warehouse")


def _require_owner_or_admin(reservation: models.WarehouseReservation, user: models.User) -> None:
    if user.role != "admin" and reservation.business_owner_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your reservation")


@router.post("/listings/{listing_id}/reservations", response_model=schemas.WarehouseReservationOut, status_code=status.HTTP_201_CREATED)
def hold_reservation(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_reserver(user)
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")

    existing = (
        db.query(models.WarehouseReservation)
        .filter(models.WarehouseReservation.listing_id == listing_id, models.WarehouseReservation.status.in_(ACTIVE_STATUSES))
        .first()
    )
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "This warehouse already has an active hold")

    now = dt.datetime.now(dt.timezone.utc)
    reservation = models.WarehouseReservation(
        id=str(uuid.uuid4()),
        listing_id=listing_id,
        business_owner_id=user.id,
        status="held",
        held_at=now.isoformat(timespec="minutes"),
        expires_at=(now + dt.timedelta(days=HOLD_DAYS)).isoformat(timespec="minutes"),
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    activity.log(
        db, kind="reservation", summary=f"{user.display_name} placed a {HOLD_DAYS}-day hold on {listing.headline}",
        actor_id=user.id, actor_name=user.display_name, listing_id=listing_id,
    )
    return reservation


@router.get("/me/reservations", response_model=list[schemas.WarehouseReservationOut])
def my_reservations(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.WarehouseReservation)
        .filter_by(business_owner_id=user.id)
        .order_by(models.WarehouseReservation.held_at.desc())
        .all()
    )


@router.patch("/reservations/{reservation_id}/confirm", response_model=schemas.WarehouseReservationOut)
def confirm_reservation(reservation_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    reservation = db.get(models.WarehouseReservation, reservation_id)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reservation not found")
    _require_owner_or_admin(reservation, user)
    if reservation.status != "held":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only a held reservation can be confirmed")
    reservation.status = "confirmed"
    reservation.confirmed_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes")
    db.commit()
    db.refresh(reservation)
    listing = db.get(models.Listing, reservation.listing_id)
    activity.log(
        db, kind="reservation", summary=f"{user.display_name} confirmed the hold on {listing.headline if listing else reservation.listing_id}",
        actor_id=user.id, actor_name=user.display_name, listing_id=reservation.listing_id,
    )
    return reservation


@router.patch("/reservations/{reservation_id}/release", response_model=schemas.WarehouseReservationOut)
def release_reservation(reservation_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    reservation = db.get(models.WarehouseReservation, reservation_id)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reservation not found")
    _require_owner_or_admin(reservation, user)
    if reservation.status not in ACTIVE_STATUSES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Reservation is not active")
    reservation.status = "released"
    reservation.released_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes")
    db.commit()
    db.refresh(reservation)
    listing = db.get(models.Listing, reservation.listing_id)
    activity.log(
        db, kind="reservation", summary=f"{user.display_name} released the hold on {listing.headline if listing else reservation.listing_id}",
        actor_id=user.id, actor_name=user.display_name, listing_id=reservation.listing_id,
    )
    return reservation
