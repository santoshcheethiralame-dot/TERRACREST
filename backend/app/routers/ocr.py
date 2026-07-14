import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from .. import models
from ..auth import get_current_user

router = APIRouter(tags=["ocr"])

MAX_BYTES = 8 * 1024 * 1024  # 8 MB — a scanned page, not a photo library


class OcrResult(BaseModel):
    text: str
    confidence: float
    engine: str


@router.post("/api/ocr", response_model=OcrResult)
async def scan_document(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
) -> OcrResult:
    """Read Kannada + English text out of a scanned land record.

    Pass 1 (roadmap) is the empanelled CRNN model — it reads only digits today,
    so it stays out of the path until it is trained on Kannada. Everything real
    runs through Tesseract with the Kannada + English packs, which handles the
    conjuncts and matras on Karnataka title deeds, ECs, and katha extracts.
    """
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty upload")
    if len(data) > MAX_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Image too large (max 8 MB)")

    try:
        import pytesseract
        from PIL import Image, UnidentifiedImageError
    except ImportError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "OCR engine is not installed on this server")

    try:
        image = Image.open(io.BytesIO(data))
        image.load()
        image = image.convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not read that image file")

    try:
        text = pytesseract.image_to_string(image, lang="kan+eng").strip()
        detail = pytesseract.image_to_data(image, lang="kan+eng", output_type=pytesseract.Output.DICT)
    except pytesseract.TesseractNotFoundError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "OCR engine is not available on this server")

    # Mean per-word confidence, 0–1. Tesseract emits -1 for non-text boxes.
    scores = [int(c) for c in detail.get("conf", []) if str(c).lstrip("-").isdigit() and int(c) >= 0]
    confidence = round(sum(scores) / len(scores) / 100, 2) if scores else 0.0

    return OcrResult(text=text, confidence=confidence, engine="tesseract · kan+eng")
