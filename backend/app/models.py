from sqlalchemy import Boolean, Column, ForeignKey, Integer, JSON, String

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # builder | landowner | investor | business_owner | admin
    office_location = Column(String, nullable=True)
    kyc_verified = Column(Boolean, nullable=False, default=True)
    active = Column(Boolean, nullable=False, default=True)
    member_since = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)


class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True)
    vertical = Column(String, nullable=False)
    headline = Column(String, nullable=False)
    status = Column(String, nullable=False)
    # masked-safe (always public to members)
    locality_label = Column(String, nullable=False)
    area_label = Column(String, nullable=False)
    land_area_sqft = Column(Integer, nullable=False)
    zoning = Column(String, nullable=False)
    locality_note = Column(String, nullable=False)
    verification = Column(JSON, nullable=False)  # {by, on}
    guidance = Column(JSON, nullable=False)  # {low, high}
    public_area = Column(JSON, nullable=True)  # {lat, lng, radiusKm} — coarse, safe to show to the public
    # first-class owner (queryable + used for authorization)
    owner_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    # Full location/ownership detail — withheld from the public, visible to any verified member.
    # {coords, address, ownerName, surveyNos, contact}
    sealed = Column(JSON, nullable=False)
    # vertical-specific
    jd = Column(JSON, nullable=True)
    warehouse = Column(JSON, nullable=True)
    big_land = Column(JSON, nullable=True)
    comps = Column(JSON, nullable=False)
    feasibility = Column(JSON, nullable=False)
    created_at = Column(String, nullable=False)


class Offer(Base):
    __tablename__ = "offers"

    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey("listings.id"), index=True, nullable=False)
    builder = Column(String, nullable=False)
    type = Column(String, nullable=False)
    quote = Column(String, nullable=False)
    terms = Column(String, nullable=False)
    status = Column(String, nullable=False)


class Engagement(Base):
    __tablename__ = "engagements"

    listing_id = Column(String, ForeignKey("listings.id"), primary_key=True)
    views = Column(JSON, nullable=False)  # [{by, at}]
    shortlists = Column(JSON, nullable=False)  # [username]
    site_visits = Column(JSON, nullable=False)  # [{by, at}]


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey("listings.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False)


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    builder_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    stage = Column(String, nullable=False)
    est_commission = Column(Integer, nullable=False)
    rm = Column(String, nullable=False)


class Message(Base):
    """Deal Room correspondence between a member and the counterparty.

    A message can carry a scheduled meeting (a time + a link in the body) or a
    proposed revenue split — the two negotiation moves the deal room supports."""

    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey("listings.id"), index=True, nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    body = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
    meeting_time = Column(String, nullable=True)  # ISO local datetime of a scheduled meeting
    deal_share = Column(JSON, nullable=True)  # {builderPct, landownerPct}


class PriceBook(Base):
    """Admin-maintained Bangalore rates the Feasibility Studio reads live.
    Single row, id='current'."""

    __tablename__ = "price_book"

    id = Column(String, primary_key=True)
    base_build_psf = Column(Integer, nullable=False)
    rates = Column(JSON, nullable=False)  # {"flooring:budget": 45, ...}


class ArchitectReview(Base):
    """A builder's request for independent architect validation of a Studio
    feasibility. The ML engine produces the instant estimate; the empanelled
    architect returns a stamped, human-validated figure — the two are then
    compared side by side. This is Stage Two of the Studio."""

    __tablename__ = "architect_reviews"

    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey("listings.id"), index=True, nullable=False)
    builder_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    status = Column(String, nullable=False)  # requested | delivered
    fee = Column(Integer, nullable=False)
    ml_snapshot = Column(JSON, nullable=False)  # {units, saleableSqft, baseNet, constructionCost, salePsf}
    architect_name = Column(String, nullable=True)
    architect_gdv = Column(Integer, nullable=True)  # architect's validated net value, ₹
    architect_notes = Column(String, nullable=True)
    requested_at = Column(String, nullable=False)
    delivered_at = Column(String, nullable=True)


class ActivityEvent(Base):
    """Append-only audit trail behind the operations-centre feed. Every
    consequential action writes one row — this is what makes the platform's
    'every view and action is logged' promise real rather than decorative."""

    __tablename__ = "activity_events"

    id = Column(String, primary_key=True)
    actor_id = Column(String, nullable=True)
    actor_name = Column(String, nullable=False)
    # login | access | message | listing_created | status_change | document | architect | reservation
    kind = Column(String, nullable=False)
    listing_id = Column(String, nullable=True)
    summary = Column(String, nullable=False)
    created_at = Column(String, nullable=False)  # ISO-8601 UTC


class LawyerVerification(Base):
    """Independent legal due-diligence recorded by the desk against a parcel —
    the empanelled advocate who cleared the title, and their remarks."""

    __tablename__ = "lawyer_verifications"

    listing_id = Column(String, ForeignKey("listings.id"), primary_key=True)
    lawyer_name = Column(String, nullable=False)
    bar_council_no = Column(String, nullable=False)
    verification_date = Column(String, nullable=False)
    remarks = Column(String, nullable=False, default="")
    verified = Column(Boolean, nullable=False, default=True)


class WarehouseReservation(Base):
    """An exclusive hold a business owner places on a warehouse while they
    finalize a lease — one active hold per listing at a time."""

    __tablename__ = "warehouse_reservations"

    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey("listings.id"), index=True, nullable=False)
    business_owner_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    status = Column(String, nullable=False)  # held | confirmed | released
    held_at = Column(String, nullable=False)
    expires_at = Column(String, nullable=False)
    confirmed_at = Column(String, nullable=True)
    released_at = Column(String, nullable=True)


class DocumentSummary(Base):
    """The desk's plain-language title-and-document summary for a parcel:
    ownership chain, encumbrance, tax, and katha, distilled from the record set.
    Prepared by a person on the desk — not an automated claim."""

    __tablename__ = "document_summaries"

    listing_id = Column(String, ForeignKey("listings.id"), primary_key=True)
    ownership_chain = Column(String, nullable=False, default="")
    ec_summary = Column(String, nullable=False, default="")
    tax_history = Column(String, nullable=False, default="")
    katha_details = Column(String, nullable=False, default="")
    prepared_by = Column(String, nullable=False, default="Terracrest Desk")
    updated_at = Column(String, nullable=False)
