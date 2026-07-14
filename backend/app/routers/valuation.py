from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, require_admin
from ..database import get_db
from ..ml import risk as riskmod
from ..ml import valuation as vmodel

router = APIRouter(tags=["valuation"])


@router.post("/valuation/predict")
def predict(body: schemas.ValuationRequest, user: models.User = Depends(get_current_user)):
    """The ML-adjusted GDV + P10–P90 band for a live Studio feasibility."""
    ctx = body.model_dump()
    net = ctx.pop("parametricNet")
    return vmodel.MODEL.predict(ctx, net)


@router.get("/valuation/model-card")
def model_card(user: models.User = Depends(get_current_user)):
    """Full transparency: model type, corpus size + provenance, holdout metrics,
    and the learned feature importances."""
    return vmodel.MODEL.card()


@router.get("/listings/{listing_id}/risk")
def listing_risk(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Masked-safe risk scorecard — reads only public parcel attributes."""
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    return riskmod.score(
        {
            "vertical": listing.vertical,
            "guidance": listing.guidance,
            "jd": listing.jd,
            "warehouse": listing.warehouse,
            "big_land": listing.big_land,
            "comps": listing.comps,
            "feasibility": listing.feasibility,
            "locality_note": listing.locality_note,
        }
    )


def build_examples(db: Session) -> list[dict]:
    """Every delivered architect review becomes a labelled training example:
    features from the parcel's feasibility, label = architect GDV / parametric GDV."""
    examples: list[dict] = []
    for r in db.query(models.ArchitectReview).filter_by(status="delivered").all():
        base = (r.ml_snapshot or {}).get("baseNet")
        if not r.architect_gdv or not base:
            continue
        listing = db.get(models.Listing, r.listing_id)
        if listing is None:
            continue
        ctx = {"vertical": listing.vertical, **(listing.feasibility or {})}
        examples.append({"ctx": ctx, "ratio": r.architect_gdv / base})
    return examples


@router.post("/admin/valuation/retrain", dependencies=[Depends(require_admin)])
def retrain(db: Session = Depends(get_db)):
    """Refit on the synthetic bootstrap plus all real architect deliveries."""
    return vmodel.retrain(build_examples(db)).card()
