from typing import Any, Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from . import models


class CamelModel(BaseModel):
    """Serializes to camelCase to match the frontend domain types exactly,
    while reading snake_case attributes off the ORM objects."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(CamelModel):
    id: str
    username: str
    display_name: str
    role: str
    office_location: Optional[str] = None
    kyc_verified: bool
    active: bool = True
    member_since: str


class LoginResponse(CamelModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPair(CamelModel):
    access_token: str
    refresh_token: str


class RefreshRequest(BaseModel):
    refreshToken: str


class ListingOut(CamelModel):
    id: str
    vertical: str
    headline: str
    status: str
    locality_label: str
    area_label: str
    land_area_sqft: int
    zoning: str
    locality_note: str
    verification: dict
    guidance: dict
    public_area: Optional[dict] = None  # coarse area, always shown
    sealed: Optional[dict] = None  # withheld unless caller is entitled
    jd: Optional[dict] = None
    warehouse: Optional[dict] = None
    big_land: Optional[dict] = None
    comps: list[Any]
    feasibility: dict
    created_at: str


class NdaOut(CamelModel):
    id: str
    builder_id: str
    landowner_id: str
    listing_id: str
    signed_on: str
    witnessed_by: str
    scan_ref: str


class OfferOut(CamelModel):
    id: str
    listing_id: str
    builder: str
    type: str
    quote: str
    terms: str
    status: str


class EngagementOut(CamelModel):
    listing_id: str
    views: list[Any]
    shortlists: list[Any]
    site_visits: list[Any]


class DocumentOut(CamelModel):
    id: str
    listing_id: str
    name: str
    kind: str


class MessageOut(CamelModel):
    id: str
    listing_id: str
    author_id: str
    author_name: str
    body: str
    created_at: str


class PostMessageRequest(BaseModel):
    body: str


class DealOut(CamelModel):
    id: str
    listing_id: str
    builder_id: str
    stage: str
    est_commission: int
    rm: str


class UnlockState(BaseModel):
    unlocked: bool


# --- admin request bodies (camelCase to match the frontend) ---
class CreateUserRequest(BaseModel):
    username: str
    displayName: str
    role: str
    officeLocation: Optional[str] = None


class CreateNdaRequest(BaseModel):
    builderId: str
    listingId: str


class SetActiveRequest(BaseModel):
    active: bool


class SetKycRequest(BaseModel):
    verified: bool


class PasswordResetOut(CamelModel):
    temp_password: str


class ArchitectReviewOut(CamelModel):
    id: str
    listing_id: str
    builder_id: str
    builder_name: str = ""
    status: str
    fee: int
    ml_snapshot: dict
    architect_name: Optional[str] = None
    architect_gdv: Optional[int] = None
    architect_notes: Optional[str] = None
    requested_at: str
    delivered_at: Optional[str] = None


class RequestArchitectReviewRequest(BaseModel):
    listingId: str
    mlSnapshot: dict


class ValuationRequest(BaseModel):
    vertical: str
    fsi: float
    floors: int
    towers: int
    plotAreaSqft: float
    floorPlateEfficiency: float
    avgUnitSqft: float
    baseSalePsf: float
    roadWidthFt: float = 40
    parametricNet: float


class DeliverArchitectReviewRequest(BaseModel):
    architectName: str
    architectGdv: int
    architectNotes: str = ""


def serialize_architect_review(r: "models.ArchitectReview", builder_name: str) -> ArchitectReviewOut:
    return ArchitectReviewOut(
        id=r.id, listing_id=r.listing_id, builder_id=r.builder_id, builder_name=builder_name,
        status=r.status, fee=r.fee, ml_snapshot=r.ml_snapshot,
        architect_name=r.architect_name, architect_gdv=r.architect_gdv, architect_notes=r.architect_notes,
        requested_at=r.requested_at, delivered_at=r.delivered_at,
    )


class ActivityEventOut(CamelModel):
    id: str
    actor_id: Optional[str] = None
    actor_name: str
    kind: str
    listing_id: Optional[str] = None
    summary: str
    created_at: str


class PriceBookOut(CamelModel):
    base_build_psf: int
    rates: dict


class UpdatePriceBookRequest(BaseModel):
    baseBuildPsf: int
    rates: dict


class UpdateStatusRequest(BaseModel):
    status: str


class CreateListingRequest(BaseModel):
    id: str
    vertical: str
    headline: str
    localityLabel: str
    areaLabel: str
    landAreaSqft: int
    zoning: str
    localityNote: str
    ownerId: str
    guidanceLow: int
    guidanceHigh: int
    # public map (coarse, pre-NDA)
    areaLat: float
    areaLng: float
    areaRadiusKm: float
    # sealed (unlock-only)
    address: str
    ownerName: str
    surveyNos: str  # comma-separated
    contact: str
    exactLat: float
    exactLng: float
    # feasibility (drives the Studio)
    plotAreaSqft: int
    fsi: float
    floors: int
    towers: int
    avgUnitSqft: int
    baseSalePsf: int


def serialize_listing(listing: "models.Listing", include_sealed: bool) -> ListingOut:
    """The heart of the moat: sealed details are attached only when entitled;
    otherwise they never leave the server."""
    out = ListingOut.model_validate(listing)
    if include_sealed:
        out.sealed = {**listing.sealed, "ownerId": listing.owner_id}
    else:
        out.sealed = None
    return out
