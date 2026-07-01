from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, require_admin
from ..database import get_db

router = APIRouter(tags=["pricebook"])


@router.get("/pricebook", response_model=schemas.PriceBookOut)
def get_pricebook(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    pb = db.get(models.PriceBook, "current")
    if pb is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Price book not set")
    return pb


@router.patch("/admin/pricebook", response_model=schemas.PriceBookOut, dependencies=[Depends(require_admin)])
def update_pricebook(body: schemas.UpdatePriceBookRequest, db: Session = Depends(get_db)):
    pb = db.get(models.PriceBook, "current")
    if pb is None:
        pb = models.PriceBook(id="current", base_build_psf=body.baseBuildPsf, rates=body.rates)
        db.add(pb)
    else:
        pb.base_build_psf = body.baseBuildPsf
        pb.rates = body.rates
    db.commit()
    db.refresh(pb)
    return pb
