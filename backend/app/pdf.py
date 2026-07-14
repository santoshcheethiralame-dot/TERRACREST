import datetime as dt
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def watermarked_document(doc_name: str, listing_id: str, viewer: str) -> bytes:
    """A branded stand-in document, dynamically watermarked with the viewer's
    identity and date — the spec's leak-tracing measure. If a document leaks,
    the watermark names the source."""
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    today = dt.date.today().isoformat()

    # dark page
    c.setFillColorRGB(0.055, 0.055, 0.067)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # masthead
    c.setFillColorRGB(0.79, 0.635, 0.153)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(25 * mm, h - 32 * mm, "DB TERRACREST ADVISORY")
    c.setStrokeColorRGB(0.79, 0.635, 0.153)
    c.setLineWidth(0.5)
    c.line(25 * mm, h - 36 * mm, w - 25 * mm, h - 36 * mm)

    c.setFillColorRGB(0.957, 0.945, 0.91)
    c.setFont("Helvetica", 15)
    c.drawString(25 * mm, h - 48 * mm, doc_name)
    c.setFillColorRGB(0.69, 0.67, 0.61)
    c.setFont("Helvetica", 10)
    c.drawString(25 * mm, h - 55 * mm, f"Parcel {listing_id}")

    # faux body lines
    c.setFillColorRGB(0.22, 0.22, 0.25)
    y = h - 72 * mm
    widths = [0.92, 0.86, 0.9, 0.6, 0.88, 0.8, 0.94, 0.5, 0.9, 0.84, 0.7, 0.9, 0.82, 0.55]
    for f in widths:
        c.rect(25 * mm, y, (w - 50 * mm) * f, 2.2, fill=1, stroke=0)
        y -= 9 * mm

    # diagonal dynamic watermark
    c.saveState()
    c.translate(w / 2, h / 2)
    c.rotate(33)
    c.setFillColorRGB(0.79, 0.635, 0.153)
    c.setFillAlpha(0.13)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(0, 14, f"CONFIDENTIAL · {viewer.upper()}")
    c.setFont("Helvetica", 15)
    c.drawCentredString(0, -14, f"{today} · TERRACREST ADVISORY")
    c.restoreState()

    # footer
    c.setFillColorRGB(0.45, 0.43, 0.38)
    c.setFont("Helvetica", 8)
    c.drawString(25 * mm, 15 * mm, f"Watermarked to {viewer} · every view and download is logged · {today}")

    c.showPage()
    c.save()
    return buf.getvalue()
