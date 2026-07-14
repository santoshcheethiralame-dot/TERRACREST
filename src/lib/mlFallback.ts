import type { ModelCard, RiskScore, ValuationContext, ValuationPrediction } from '@/domain/types'
import { listings } from '@/data/seed'

/* ============================================================
   No-backend mirror of the ML valuation + risk scorecard, so
   the Studio stays coherent when VITE_API_URL is unset. In
   API mode the real NumPy model + Python scorecard serve these.
   ============================================================ */

const REF_PSF: Record<string, number> = { 'joint-development': 8000, warehouse: 3100, 'big-land': 900 }

export function fallbackPredict(ctx: ValuationContext): ValuationPrediction {
  const ref = REF_PSF[ctx.vertical] ?? 8000
  const logr =
    -0.02 * (ctx.fsi - 2.0) -
    0.011 * Math.max(0, ctx.floors - 12) -
    0.055 * Math.log10(Math.max(1e-6, ctx.baseSalePsf / ref)) +
    0.1 * (ctx.floorPlateEfficiency - 0.78) +
    (ctx.vertical === 'warehouse' ? 0.01 : 0) +
    (ctx.vertical === 'big-land' ? -0.006 : 0)
  const net = ctx.parametricNet
  const z = 1.2816
  const s = 0.018
  return {
    parametricNet: Math.round(net),
    mlGdv: Math.round(net * Math.exp(logr)),
    p10: Math.round(net * Math.exp(logr - z * s)),
    p90: Math.round(net * Math.exp(logr + z * s)),
    adjustmentPct: Math.round((Math.exp(logr) - 1) * 10000) / 100,
  }
}

export function fallbackModelCard(): ModelCard {
  return {
    modelType: 'Ridge regression (closed-form, NumPy)',
    target: 'log(architect GDV / parametric GDV)',
    nExamples: 500,
    nReal: 1,
    nSynthetic: 499,
    provenance:
      'Trained on a synthetic bootstrap grounded in a domain adjustment model, plus every real architect delivery. Retrains as deliveries accrue.',
    metrics: { maePct: 1.5, r2: 0.89 },
    importances: [
      { feature: 'highrise', label: 'High-rise premium floors', weight: 0.036, direction: 'lowers' },
      { feature: 'fsi', label: 'FSI', weight: 0.02, direction: 'lowers' },
      { feature: 'is_bigland', label: 'Big-land typology', weight: 0.019, direction: 'lowers' },
      { feature: 'log_psf', label: 'Sale price (log)', weight: 0.017, direction: 'lowers' },
      { feature: 'efficiency', label: 'Floor-plate efficiency', weight: 0.009, direction: 'raises' },
      { feature: 'is_warehouse', label: 'Warehouse typology', weight: 0.008, direction: 'lowers' },
      { feature: 'log_unit', label: 'Avg unit size (log)', weight: 0.004, direction: 'raises' },
      { feature: 'road_width', label: 'Road width', weight: 0.003, direction: 'raises' },
      { feature: 'towers', label: 'Towers', weight: 0.002, direction: 'raises' },
      { feature: 'log_plot', label: 'Plot area (log)', weight: 0.002, direction: 'lowers' },
      { feature: 'floors', label: 'Floors', weight: 0.001, direction: 'lowers' },
    ],
    trainedAt: new Date().toISOString().slice(0, 19) + '+00:00',
  }
}

const clamp = (x: number) => Math.max(0, Math.min(100, Math.round(x)))

export function fallbackRisk(listingId: string): RiskScore {
  const l = listings.find((x) => x.id === listingId)
  const vertical = l?.vertical ?? 'joint-development'
  const guidance = l?.guidance ?? { low: 60, high: 72 }
  const note = (l?.localityNote ?? '').toLowerCase()
  const road = l?.feasibility?.roadWidthFt ?? 40
  const nComps = l?.comps?.length ?? 0

  // Title & Legal
  const tf: { label: string; delta: number }[] = [{ label: 'Terracrest site-verified title', delta: 12 }]
  let title = 62 + 12
  if (vertical === 'joint-development' && /approv|sanction/.test((l?.jd?.approval ?? '').toLowerCase())) {
    tf.push({ label: 'Plan sanction / statutory approval on record', delta: 16 }); title += 16
  }
  if (vertical === 'big-land') {
    const dis = (l?.bigLand?.disputes ?? '').toLowerCase()
    if (/resolv/.test(dis)) { tf.push({ label: 'Historical claim resolved and documented', delta: 6 }); title += 6 }
    else if (/dispute|claim/.test(dis)) { tf.push({ label: 'Unresolved boundary claim', delta: -18 }); title -= 18 }
  }
  if (vertical === 'warehouse') { tf.push({ label: 'KIADB / industrial allotment', delta: 12 }); title += 12 }
  tf.push({ label: 'Encumbrance certificate in vault', delta: 6 }); title += 6

  // Liquidity
  const lf: { label: string; delta: number }[] = []
  let liq = 50
  const vpts = vertical === 'warehouse' ? 20 : vertical === 'joint-development' ? 12 : 2
  lf.push({ label: `${vertical} demand depth`, delta: vpts }); liq += vpts
  if (guidance.high <= 40) { lf.push({ label: 'Sub-₹40 Cr ticket — broad buyer pool', delta: 16 }); liq += 16 }
  else if (guidance.high <= 90) { lf.push({ label: 'Mid ticket (₹40–90 Cr)', delta: 8 }); liq += 8 }
  else { lf.push({ label: 'Large ticket (>₹90 Cr) — thinner pool', delta: -6 }); liq -= 6 }
  if (road >= 60) { lf.push({ label: `${road} ft frontage road`, delta: 8 }); liq += 8 }
  else if (road >= 40) { lf.push({ label: `${road} ft frontage road`, delta: 4 }); liq += 4 }
  if (nComps) { const d = Math.min(10, 4 * nComps); lf.push({ label: `${nComps} verified comparable(s) for price discovery`, delta: d }); liq += d }

  // Appreciation
  const af: { label: string; delta: number }[] = []
  let app = 52
  for (const [kw, label, pts] of [['corridor', 'On a designated growth corridor', 12], ['airport', 'Airport-catchment proximity', 10], ['prestige', 'Marquee developer launch nearby', 6], ['metro', 'Metro / transit catalyst', 8]] as const) {
    if (note.includes(kw)) { af.push({ label, delta: pts }); app += pts }
  }
  const spread = guidance.low ? (guidance.high - guidance.low) / guidance.low : 0
  if (spread >= 0.12) { af.push({ label: 'Wide guidance spread — upside optionality', delta: 8 }); app += 8 }
  const horizon = l?.bigLand?.horizonYears
  if (horizon && horizon >= 5) { af.push({ label: `${horizon}-yr appreciation horizon`, delta: 6 }); app += 6 }

  const bands = [
    { key: 'title', label: 'Title & Legal', score: clamp(title), factors: tf },
    { key: 'liquidity', label: 'Liquidity', score: clamp(liq), factors: lf },
    { key: 'appreciation', label: 'Appreciation', score: clamp(app), factors: af },
  ]
  const overall = clamp(bands[0].score * 0.4 + bands[1].score * 0.3 + bands[2].score * 0.3)
  const grade = overall >= 78 ? 'A' : overall >= 62 ? 'B' : overall >= 45 ? 'C' : 'D'
  return { overall, grade, bands }
}
