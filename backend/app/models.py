from sqlalchemy import Boolean, Column, ForeignKey, Integer, JSON, String

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # builder | landowner | investor | admin
    office_location = Column(String, nullable=True)
    kyc_verified = Column(Boolean, nullable=False, default=True)
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
    public_area = Column(JSON, nullable=True)  # {lat, lng, radiusKm} — coarse, safe to show pre-NDA
    # first-class owner (queryable + used for authorization)
    owner_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    # SEALED — never serialized without an NDA. {coords, address, ownerName, surveyNos, contact}
    sealed = Column(JSON, nullable=False)
    # vertical-specific
    jd = Column(JSON, nullable=True)
    warehouse = Column(JSON, nullable=True)
    big_land = Column(JSON, nullable=True)
    comps = Column(JSON, nullable=False)
    feasibility = Column(JSON, nullable=False)
    created_at = Column(String, nullable=False)


class Nda(Base):
    __tablename__ = "ndas"

    id = Column(String, primary_key=True)
    builder_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    landowner_id = Column(String, nullable=False)
    listing_id = Column(String, ForeignKey("listings.id"), index=True, nullable=False)
    signed_on = Column(String, nullable=False)
    witnessed_by = Column(String, nullable=False)
    scan_ref = Column(String, nullable=False)


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
