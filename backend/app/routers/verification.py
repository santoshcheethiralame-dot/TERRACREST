import datetime as dt
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, require_admin
from ..database import get_db

router = APIRouter(tags=["verification"])


# ---------------------------------------------------------- lawyer verification
@router.get("/listings/{listing_id}/lawyer-verification", response_model=Optional[schemas.LawyerVerificationOut])
def get_lawyer_verification(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.get(models.LawyerVerification, listing_id)


@router.put(
    "/admin/listings/{listing_id}/lawyer-verification",
    response_model=schemas.LawyerVerificationOut,
    dependencies=[Depends(require_admin)],
)
def upsert_lawyer_verification(listing_id: str, body: schemas.LawyerVerificationRequest, db: Session = Depends(get_db)):
    if db.get(models.Listing, listing_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    row = db.get(models.LawyerVerification, listing_id)
    if row is None:
        row = models.LawyerVerification(listing_id=listing_id)
        db.add(row)
    row.lawyer_name = body.lawyerName.strip()
    row.bar_council_no = body.barCouncilNo.strip()
    row.verification_date = body.verificationDate
    row.remarks = body.remarks.strip()
    row.verified = body.verified
    db.commit()
    db.refresh(row)
    return row


# ------------------------------------------------------------ document summary
@router.get("/listings/{listing_id}/document-summary", response_model=Optional[schemas.DocumentSummaryOut])
def get_document_summary(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.get(models.DocumentSummary, listing_id)


@router.put(
    "/admin/listings/{listing_id}/document-summary",
    response_model=schemas.DocumentSummaryOut,
    dependencies=[Depends(require_admin)],
)
def upsert_document_summary(listing_id: str, body: schemas.DocumentSummaryRequest, db: Session = Depends(get_db)):
    if db.get(models.Listing, listing_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    row = db.get(models.DocumentSummary, listing_id)
    if row is None:
        row = models.DocumentSummary(listing_id=listing_id)
        db.add(row)
    row.ownership_chain = body.ownershipChain.strip()
    row.ec_summary = body.ecSummary.strip()
    row.tax_history = body.taxHistory.strip()
    row.katha_details = body.kathaDetails.strip()
    row.updated_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes")
    db.commit()
    db.refresh(row)
    return row
