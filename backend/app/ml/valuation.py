"""Terracrest Valuation Intelligence — the real model behind the Studio.

The deterministic engine gives an instant parametric GDV. This module learns the
*correction* an empanelled architect applies to that estimate — i.e. it predicts
the ratio (architect GDV / parametric GDV) from a parcel's feasibility features.

It is a ridge regression solved in closed form with NumPy — small, fast (<100ms to
train on the whole corpus), fully interpretable (standardised coefficients are the
feature importances), and dependency-light enough to run on a free tier. Every
architect delivery becomes a new labelled example: the model is retrained on the
synthetic bootstrap corpus plus whatever real deliveries exist, so it sharpens with
use. Provenance is reported honestly in the model card.
"""

from __future__ import annotations

import datetime as dt
import math

import numpy as np

# Ordered feature vector. Standardised coefficients over these are the importances.
FEATURES = [
    "fsi",
    "floors",
    "towers",
    "log_plot",
    "efficiency",
    "log_unit",
    "log_psf",
    "road_width",
    "highrise",       # floors above the 12-storey refuge/NBC threshold
    "is_warehouse",
    "is_bigland",
]

FEATURE_LABEL = {
    "fsi": "FSI",
    "floors": "Floors",
    "towers": "Towers",
    "log_plot": "Plot area (log)",
    "efficiency": "Floor-plate efficiency",
    "log_unit": "Avg unit size (log)",
    "log_psf": "Sale price (log)",
    "road_width": "Road width",
    "highrise": "High-rise premium floors",
    "is_warehouse": "Warehouse typology",
    "is_bigland": "Big-land typology",
}

# Typical sale ₹/sq ft by vertical — used to express "pricing aggressiveness"
# (how far a builder's assumed sale price sits above the typical for the type).
_REF_PSF = {"joint-development": 8000.0, "warehouse": 3100.0, "big-land": 900.0}


def featurize(ctx: dict) -> list[float]:
    """Build the feature vector from a feasibility/parcel context dict."""
    vertical = ctx.get("vertical", "joint-development")
    floors = float(ctx.get("floors", 1) or 1)
    return [
        float(ctx.get("fsi", 1.0) or 1.0),
        floors,
        float(ctx.get("towers", 1) or 1),
        math.log10(max(1.0, float(ctx.get("plotAreaSqft", 1) or 1))),
        float(ctx.get("floorPlateEfficiency", 0.78) or 0.78),
        math.log10(max(1.0, float(ctx.get("avgUnitSqft", 1000) or 1000))),
        math.log10(max(1.0, float(ctx.get("baseSalePsf", 1000) or 1000))),
        float(ctx.get("roadWidthFt", 40) or 40),
        max(0.0, floors - 12.0),
        1.0 if vertical == "warehouse" else 0.0,
        1.0 if vertical == "big-land" else 0.0,
    ]


# ------------------------------------------------------------------ corpus
def _true_logr(vertical: str, fsi: float, floors: float, eff: float, psf: float, rng) -> float:
    """The (synthetic) ground-truth architect adjustment, in log-ratio space. This is
    the pattern the model has to recover: high-rise massing and aggressive pricing get
    trimmed for code compliance; better efficiency holds value; shells barely move."""
    ref = _REF_PSF.get(vertical, 8000.0)
    psf_aggr = math.log10(max(1e-6, psf / ref))
    logr = (
        -0.020 * (fsi - 2.0)
        - 0.011 * max(0.0, floors - 12.0)
        - 0.055 * psf_aggr
        + 0.10 * (eff - 0.78)
        + (0.010 if vertical == "warehouse" else 0.0)
        + (-0.006 if vertical == "big-land" else 0.0)
    )
    noise = rng.normal(0.0, 0.015 if vertical != "big-land" else 0.028)
    return logr + noise


def _sample_ctx(rng) -> dict:
    r = rng.random()
    vertical = "joint-development" if r < 0.60 else ("warehouse" if r < 0.85 else "big-land")
    if vertical == "joint-development":
        return {
            "vertical": vertical,
            "fsi": rng.uniform(1.5, 3.2),
            "floors": int(rng.integers(6, 23)),
            "towers": int(rng.integers(1, 7)),
            "plotAreaSqft": rng.uniform(40_000, 300_000),
            "floorPlateEfficiency": rng.uniform(0.72, 0.85),
            "avgUnitSqft": rng.uniform(900, 2000),
            "baseSalePsf": rng.uniform(6000, 12000),
            "roadWidthFt": int(rng.choice([30, 40, 60])),
        }
    if vertical == "warehouse":
        return {
            "vertical": vertical,
            "fsi": rng.uniform(0.8, 1.2),
            "floors": 1,
            "towers": 1,
            "plotAreaSqft": rng.uniform(80_000, 300_000),
            "floorPlateEfficiency": rng.uniform(0.88, 0.94),
            "avgUnitSqft": rng.uniform(60_000, 140_000),
            "baseSalePsf": rng.uniform(2500, 3800),
            "roadWidthFt": 60,
        }
    return {
        "vertical": vertical,
        "fsi": rng.uniform(0.10, 0.30),
        "floors": int(rng.integers(1, 4)),
        "towers": int(rng.integers(2, 9)),
        "plotAreaSqft": rng.uniform(300_000, 800_000),
        "floorPlateEfficiency": rng.uniform(0.60, 0.75),
        "avgUnitSqft": rng.uniform(1500, 3000),
        "baseSalePsf": rng.uniform(700, 1200),
        "roadWidthFt": 30,
    }


def _build_corpus(real_examples: list[dict] | None, n_synth: int = 500, seed: int = 42):
    """Returns (X, y, n_real). Synthetic bootstrap + any real architect deliveries.
    A real example is {"ctx": <feasibility dict>, "ratio": architect_gdv/parametric_net}."""
    rng = np.random.default_rng(seed)
    feats, targets = [], []
    for _ in range(n_synth):
        ctx = _sample_ctx(rng)
        feats.append(featurize(ctx))
        targets.append(_true_logr(ctx["vertical"], ctx["fsi"], float(ctx["floors"]), ctx["floorPlateEfficiency"], ctx["baseSalePsf"], rng))

    n_real = 0
    for ex in real_examples or []:
        ratio = ex.get("ratio")
        if ratio is None or ratio <= 0:
            continue
        feats.append(featurize(ex["ctx"]))
        targets.append(math.log(ratio))
        n_real += 1

    return np.array(feats, dtype=float), np.array(targets, dtype=float), n_real


# ------------------------------------------------------------------- model
class ValuationModel:
    def __init__(self, mean, std, w, b, resid_std, importances, metrics, n, n_real):
        self.mean, self.std, self.w, self.b = mean, std, w, b
        self.resid_std = resid_std
        self.importances = importances      # list of {feature, label, weight, direction}
        self.metrics = metrics              # {maePct, r2}
        self.n, self.n_real = n, n_real
        self.trained_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")

    def _logr(self, feats: list[float]) -> float:
        x = (np.array(feats, dtype=float) - self.mean) / self.std
        return float(x @ self.w + self.b)

    def predict(self, ctx: dict, parametric_net: float) -> dict:
        """Return the ML-adjusted GDV, the P10–P90 band, and the learned adjustment."""
        logr = self._logr(featurize(ctx))
        ratio = math.exp(logr)
        z = 1.2816  # ~P10/P90 under a log-normal residual
        return {
            "parametricNet": round(parametric_net),
            "mlGdv": round(parametric_net * ratio),
            "p10": round(parametric_net * math.exp(logr - z * self.resid_std)),
            "p90": round(parametric_net * math.exp(logr + z * self.resid_std)),
            "adjustmentPct": round((ratio - 1.0) * 100, 2),
        }

    def card(self) -> dict:
        return {
            "modelType": "Ridge regression (closed-form, NumPy)",
            "target": "log(architect GDV / parametric GDV)",
            "nExamples": self.n,
            "nReal": self.n_real,
            "nSynthetic": self.n - self.n_real,
            "provenance": (
                "Trained on a synthetic bootstrap grounded in a domain adjustment model, "
                "plus every real architect delivery. Retrains as deliveries accrue."
            ),
            "metrics": self.metrics,
            "importances": self.importances,
            "trainedAt": self.trained_at,
        }


def _fit(X: np.ndarray, y: np.ndarray, lam: float = 1.0):
    mean = X.mean(axis=0)
    std = X.std(axis=0)
    std[std == 0] = 1.0
    Xs = (X - mean) / std
    ybar = float(y.mean())
    d = Xs.shape[1]
    A = Xs.T @ Xs + lam * np.eye(d)
    w = np.linalg.solve(A, Xs.T @ (y - ybar))
    return mean, std, w, ybar


def train(real_examples: list[dict] | None = None, seed: int = 42) -> ValuationModel:
    X, y, n_real = _build_corpus(real_examples, seed=seed)
    n = len(y)

    # Hold out 20% for honest metrics.
    rng = np.random.default_rng(seed + 1)
    idx = rng.permutation(n)
    cut = max(1, int(n * 0.8))
    tr, te = idx[:cut], idx[cut:]

    mean, std, w, b = _fit(X[tr], y[tr])
    Xte = (X[te] - mean) / std
    pred = Xte @ w + b
    resid = y[te] - pred
    resid_std = float(np.sqrt(np.mean(resid**2))) or 0.02

    # Metrics: MAE in GDV-percentage-points (ratio space), and R² on the log target.
    mae_pct = float(np.mean(np.abs(np.exp(pred) - np.exp(y[te])))) * 100
    ss_res = float(np.sum((y[te] - pred) ** 2))
    ss_tot = float(np.sum((y[te] - y[te].mean()) ** 2)) or 1.0
    r2 = 1.0 - ss_res / ss_tot

    order = np.argsort(-np.abs(w))
    importances = [
        {
            "feature": FEATURES[i],
            "label": FEATURE_LABEL[FEATURES[i]],
            "weight": round(float(abs(w[i])), 4),
            "direction": "raises" if w[i] >= 0 else "lowers",
        }
        for i in order
    ]

    return ValuationModel(
        mean, std, w, b, resid_std, importances,
        {"maePct": round(mae_pct, 2), "r2": round(r2, 3)},
        n, n_real,
    )


# Module-level singleton, trained at import. Replaced by retrain().
MODEL: ValuationModel = train()


def retrain(real_examples: list[dict] | None = None) -> ValuationModel:
    global MODEL
    MODEL = train(real_examples)
    return MODEL
