"""Parcel Risk Scorecard — transparent and rules-based on purpose.

Valuation is a learned model; risk is a scorecard. For due-diligence risk we
deliberately do NOT hide behind a black box — every point is an explicit,
explainable factor a principal (or a strict reviewer) can audit. Three axes —
title/legal, liquidity, appreciation — combine into a 0–100 score and a grade.
"""

from __future__ import annotations


def _clamp(x: float) -> int:
    return int(max(0, min(100, round(x))))


def _title(d: dict) -> tuple[int, list[dict]]:
    base = 62
    factors = [{"label": "Terracrest site-verified title", "delta": 12}]
    score = base + 12
    vertical = d.get("vertical")
    jd = d.get("jd") or {}
    big = d.get("big_land") or {}

    if vertical == "joint-development":
        approval = (jd.get("approval") or "").lower()
        if "approv" in approval or "sanction" in approval:
            factors.append({"label": "Plan sanction / statutory approval on record", "delta": 16})
            score += 16
    if vertical == "big-land":
        disputes = (big.get("disputes") or "").lower()
        if "resolv" in disputes:
            factors.append({"label": "Historical claim resolved and documented", "delta": 6})
            score += 6
        elif "dispute" in disputes or "claim" in disputes:
            factors.append({"label": "Unresolved boundary claim", "delta": -18})
            score -= 18
    if vertical == "warehouse":
        factors.append({"label": "KIADB / industrial allotment", "delta": 12})
        score += 12
    factors.append({"label": "Encumbrance certificate in vault", "delta": 6})
    score += 6
    return _clamp(score), factors


def _liquidity(d: dict) -> tuple[int, list[dict]]:
    base = 50
    factors = []
    score = base
    vertical = d.get("vertical")
    guidance = d.get("guidance") or {}
    high = float(guidance.get("high", 60) or 60)  # ticket size, ₹ Cr

    v_pts = {"warehouse": 20, "joint-development": 12, "big-land": 2}.get(vertical, 8)
    factors.append({"label": f"{vertical} demand depth", "delta": v_pts})
    score += v_pts

    if high <= 40:
        factors.append({"label": "Sub-₹40 Cr ticket — broad buyer pool", "delta": 16})
        score += 16
    elif high <= 90:
        factors.append({"label": "Mid ticket (₹40–90 Cr)", "delta": 8})
        score += 8
    else:
        factors.append({"label": "Large ticket (>₹90 Cr) — thinner pool", "delta": -6})
        score -= 6

    road = float((d.get("feasibility") or {}).get("roadWidthFt", 40) or 40)
    if road >= 60:
        factors.append({"label": f"{int(road)} ft frontage road", "delta": 8})
        score += 8
    elif road >= 40:
        factors.append({"label": f"{int(road)} ft frontage road", "delta": 4})
        score += 4

    n_comps = len(d.get("comps") or [])
    if n_comps:
        factors.append({"label": f"{n_comps} verified comparable(s) for price discovery", "delta": min(10, 4 * n_comps)})
        score += min(10, 4 * n_comps)
    return _clamp(score), factors


def _appreciation(d: dict) -> tuple[int, list[dict]]:
    base = 52
    factors = []
    score = base
    note = (d.get("locality_note") or "").lower()
    guidance = d.get("guidance") or {}
    low = float(guidance.get("low", 1) or 1)
    high = float(guidance.get("high", 1) or 1)

    for kw, label, pts in [
        ("corridor", "On a designated growth corridor", 12),
        ("airport", "Airport-catchment proximity", 10),
        ("prestige", "Marquee developer launch nearby", 6),
        ("metro", "Metro / transit catalyst", 8),
    ]:
        if kw in note:
            factors.append({"label": label, "delta": pts})
            score += pts

    spread = (high - low) / low if low else 0
    if spread >= 0.12:
        factors.append({"label": "Wide guidance spread — upside optionality", "delta": 8})
        score += 8

    big = d.get("big_land") or {}
    horizon = big.get("horizonYears")
    if horizon and float(horizon) >= 5:
        factors.append({"label": f"{int(horizon)}-yr appreciation horizon", "delta": 6})
        score += 6
    return _clamp(score), factors


_AXES = [
    ("title", "Title & Legal", _title, 0.40),
    ("liquidity", "Liquidity", _liquidity, 0.30),
    ("appreciation", "Appreciation", _appreciation, 0.30),
]


def _grade(overall: int) -> str:
    return "A" if overall >= 78 else "B" if overall >= 62 else "C" if overall >= 45 else "D"


def score(d: dict) -> dict:
    """`d` is a serialized listing (vertical, guidance, jd, warehouse, big_land,
    comps, feasibility, locality_note). Returns overall + explained sub-scores."""
    bands, overall = [], 0.0
    for key, label, fn, weight in _AXES:
        s, factors = fn(d)
        overall += s * weight
        bands.append({"key": key, "label": label, "score": s, "factors": factors})
    overall_i = _clamp(overall)
    return {"overall": overall_i, "grade": _grade(overall_i), "bands": bands}
