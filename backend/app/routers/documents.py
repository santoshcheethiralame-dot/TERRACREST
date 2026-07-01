from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..pdf import watermarked_document
from .listings import can_see_sealed

router = APIRouter(tags=["documents"])


@router.get("/listings/{listing_id}/documents", response_model=list[schemas.DocumentOut])
def list_documents(listing_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parcel not found")
    if not can_see_sealed(user, listing, db):
        return []  # the vault is withheld until an NDA is logged
    return db.query(models.Document).filter_by(listing_id=listing_id).all()


@router.get("/listings/{listing_id}/documents/{doc_id}")
def download_document(listing_id: str, doc_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.get(models.Listing, listing_id)
    doc = db.get(models.Document, doc_id)
    if listing is None or doc is None or doc.listing_id != listing_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    if not can_see_sealed(user, listing, db):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "NDA required")
    pdf = watermarked_document(doc.name, listing_id, user.username)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{doc_id}.pdf"'},
    )
