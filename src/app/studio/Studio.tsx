import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { ArchitectReview, FeasibilityInput, Listing, MlSnapshot, ModelCard as ModelCardData, PriceBook, ValuationContext, ValuationPrediction } from '@/domain/types'
import { useLang } from '@/i18n/LanguageContext'
import { MATERIAL_CATEGORY_KEY, VERTICAL_KEY } from '@/i18n/translations'
import { repo } from '@/data/repository'
import { computeGdv, defaultSelection, type MaterialSelection, type GdvResult } from '@/lib/gdv'
import { buildSitePlan, type SitePlan } from '@/lib/siteplan'
import { MATERIALS, TIERS, type Tier } from '@/lib/materials'
import { crFromRupees, sqft, pct, groupIN } from '@/lib/format'
import { useCountUp } from '@/lib/hooks'
import { Slider } from '@/components/Slider'
import { ModelCard } from '@/components/ModelCard'
import { EASE } from '@/lib/motion'

export function Studio() {
  const { id } = useParams()
  const { t } = useLang()
  const listingId = id ?? 'JD-BLR-2026-012'
  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    let alive = true
    repo.getListing(listingId).then((l) => alive && setListing(l ?? null))
    return () => {
      alive = false
    }
  }, [listingId])

  if (!listing) return <StudioLoading label={t('studio.loadingParcel')} />
  return <StudioInner listing={listing} />
}

function StudioLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper">
      <p className="label animate-pulse text-ink-faint">{label}</p>
    </div>
  )
}

function StudioInner({ listing }: { listing: Listing }) {
  const [feas, setFeas] = useState<FeasibilityInput>(listing.feasibility)
  const [selection, setSelection] = useState<MaterialSelection>(defaultSelection())
  const [engage, setEngage] = useState(false)
  const [priceBook, setPriceBook] = useState<PriceBook | undefined>(undefined)
  const [review, setReview] = useState<ArchitectReview | null>(null)
  const [prediction, setPrediction] = useState<ValuationPrediction | null>(null)
  const [showModel, setShowModel] = useState(false)

  useEffect(() => {
    repo.getPriceBook().then(setPriceBook).catch(() => {})
  }, [])

  useEffect(() => {
    let alive = true
    repo
      .myArchitectReviews()
      .then((rs) => alive && setReview(rs.find((r) => r.listingId === listing.id) ?? null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [listing.id])

  const gdv = useMemo(() => computeGdv(feas, selection, priceBook), [feas, selection, priceBook])
  const plan = useMemo(() => buildSitePlan(feas, gdv.feas.footprintSqft), [feas, gdv.feas.footprintSqft])
  const set = (patch: Partial<FeasibilityInput>) => setFeas((f) => ({ ...f, ...patch }))

  const parametricNet = Math.round(gdv.zones.base.netValue)
  const valCtx = useMemo<ValuationContext>(
    () => ({
      vertical: listing.vertical,
      fsi: feas.fsi,
      floors: feas.floors,
      towers: feas.towers,
      plotAreaSqft: feas.plotAreaSqft,
      floorPlateEfficiency: feas.floorPlateEfficiency,
      avgUnitSqft: feas.avgUnitSqft,
      baseSalePsf: feas.baseSalePsf,
      roadWidthFt: feas.roadWidthFt,
      parametricNet,
    }),
    [listing.vertical, feas, parametricNet],
  )

  // Debounced so a slider drag doesn't hammer the model endpoint.
  useEffect(() => {
    const t = setTimeout(() => {
      repo.predictValuation(valCtx).then(setPrediction).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [valCtx])

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink lg:h-screen lg:overflow-hidden">
      <StudioBar listing={listing} review={review} onEngage={() => setEngage(true)} />

      <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[1.55fr_1fr]">
        {/* canvas + metrics */}
        <section className="blueprint relative flex min-h-[46vh] flex-col border-b border-line lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="relative min-h-0 flex-1 p-6 md:p-10">
            <SitePlanCanvas plan={plan} feas={feas} />
          </div>
          <MetricsStrip gdv={gdv} />
        </section>

        {/* controls */}
        <aside className="bg-paper-raise/40 px-6 py-7 md:px-8 lg:min-h-0 lg:overflow-y-auto">
          <Controls feas={feas} set={set} listing={listing} />
          <div className="hairline my-8" />
          <Materials selection={selection} onSelect={(k, t) => setSelection((s) => ({ ...s, [k]: t }))} finishesPsf={gdv.finishesPsf} />
        </aside>
      </div>

      <GdvTicker gdv={gdv} prediction={prediction} onModelCard={() => setShowModel(true)} />

      <AnimatePresence>
        {engage && <EngageModal listing={listing} gdv={gdv} review={review} onRequested={setReview} onClose={() => setEngage(false)} />}
        {showModel && <ModelCardModal onClose={() => setShowModel(false)} />}
      </AnimatePresence>
    </div>
  )
}

/* --------------------------------------------------------------- top bar */
function StudioBar({ listing, review, onEngage }: { listing: Listing; review: ArchitectReview | null; onEngage: () => void }) {
  const { t } = useLang()
  const delivered = review?.status === 'delivered'
  const requested = review?.status === 'requested'
  const label = delivered ? t('studio.architectValidated') : requested ? t('studio.validationRequested') : t('studio.confirmEngage')
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4 md:px-10">
      <div className="flex items-center gap-6">
        <Link to="/app" className="label text-ink-faint transition-colors hover:text-ink">
          ← {t('studio.terracrest')}
        </Link>
        <div className="hidden h-4 w-px bg-[color:var(--line-strong)] sm:block" />
        <div className="hidden sm:block">
          <p className="label text-accent">{t('studio.eyebrow')}</p>
          <p className="mono mt-1 text-[0.72rem] text-ink-dim">
            {listing.id} · {t(VERTICAL_KEY[listing.vertical])} · {listing.localityLabel.split('·')[0].trim()}
          </p>
        </div>
      </div>
      <button
        onClick={onEngage}
        className={`label group inline-flex items-center gap-3 border px-5 py-3 transition-colors duration-500 ${
          delivered
            ? 'border-emerald/50 text-emerald-bright hover:bg-emerald hover:text-paper'
            : 'border-[color:var(--line-accent)] text-accent hover:bg-accent hover:text-paper'
        }`}
      >
        {delivered && <span aria-hidden>✓</span>}
        {label}
        {!delivered && <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>}
      </button>
    </header>
  )
}

/* ----------------------------------------------------------- site plan */
function SitePlanCanvas({ plan, feas }: { plan: SitePlan; feas: FeasibilityInput }) {
  const { t } = useLang()
  const { plot } = plan
  const padX = plot.w * 0.17
  const padY = plot.h * 0.13
  const road = plot.h * 0.13
  const vb = `${-padX} ${-padY} ${plot.w + 2 * padX} ${plot.h + padY + road + padY}`
  const U = plot.w
  const sw = Math.max(1.4, U * 0.005)
  const fs = U * 0.03

  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label={t('a11y.massingSchematic')}>
      {/* road along frontage (bottom) */}
      <g>
        <rect x={0} y={plot.h + road * 0.35} width={plot.w} height={road * 0.5} fill="#7C857D" fillOpacity="0.08" stroke="#7C857D" strokeOpacity="0.4" strokeWidth={sw * 0.7} />
        <text x={plot.w / 2} y={plot.h + road * 0.72} textAnchor="middle" fill="#7C857D" fontFamily="'IBM Plex Mono', monospace" fontSize={fs * 0.82} letterSpacing={fs * 0.03}>
          {feas.roadWidthFt} {t('studio.roadFrontage')}
        </text>
      </g>

      {/* parcel boundary */}
      <rect x={0} y={0} width={plot.w} height={plot.h} fill="none" stroke="#1E4D3B" strokeOpacity="0.7" strokeWidth={sw} />
      {/* setback envelope */}
      <rect
        x={plan.buildable.x}
        y={plan.buildable.y}
        width={plan.buildable.w}
        height={plan.buildable.h}
        fill="none"
        stroke="#1E4D3B"
        strokeOpacity="0.32"
        strokeWidth={sw * 0.8}
        strokeDasharray={`${U * 0.02} ${U * 0.02}`}
      />

      {/* towers */}
      {plan.towers.map((t, i) => (
        <motion.rect
          key={i}
          initial={false}
          animate={{ x: t.x, y: t.y, width: t.w, height: t.h }}
          transition={{ duration: 0.6, ease: EASE }}
          fill="#1E4D3B"
          fillOpacity="0.13"
          stroke="#1E4D3B"
          strokeOpacity="0.62"
          strokeWidth={sw}
        />
      ))}

      {/* dimension — frontage */}
      <g stroke="#7C857D" strokeWidth={sw * 0.6} fill="#7C857D">
        <line x1={0} y1={-padY * 0.5} x2={plot.w} y2={-padY * 0.5} strokeOpacity="0.5" />
        <line x1={0} y1={-padY * 0.62} x2={0} y2={-padY * 0.38} strokeOpacity="0.5" />
        <line x1={plot.w} y1={-padY * 0.62} x2={plot.w} y2={-padY * 0.38} strokeOpacity="0.5" />
        <text x={plot.w / 2} y={-padY * 0.62} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={fs * 0.82} stroke="none" fillOpacity="0.9">
          ≈ {groupIN(plan.frontageFt)} ft
        </text>
      </g>
      {/* dimension — depth */}
      <g stroke="#7C857D" strokeWidth={sw * 0.6} fill="#7C857D">
        <line x1={-padX * 0.5} y1={0} x2={-padX * 0.5} y2={plot.h} strokeOpacity="0.5" />
        <text
          x={-padX * 0.62}
          y={plot.h / 2}
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={fs * 0.82}
          stroke="none"
          fillOpacity="0.9"
          transform={`rotate(-90 ${-padX * 0.62} ${plot.h / 2})`}
        >
          ≈ {groupIN(plan.depthFt)} ft
        </text>
      </g>

      {/* north arrow */}
      <g transform={`translate(${plot.w + padX * 0.45} ${padY * 0.2})`} stroke="#7C857D" strokeWidth={sw * 0.8} fill="none">
        <path d={`M0 ${fs * 1.6} L0 0 M${-fs * 0.35} ${fs * 0.4} L0 0 L${fs * 0.35} ${fs * 0.4}`} />
        <text x={0} y={fs * 2.6} textAnchor="middle" fill="#7C857D" stroke="none" fontFamily="'IBM Plex Mono', monospace" fontSize={fs * 0.9}>
          N
        </text>
      </g>
    </svg>
  )
}

/* ----------------------------------------------------------- metrics */
function MetricsStrip({ gdv }: { gdv: GdvResult }) {
  const { t } = useLang()
  const m = gdv.feas
  const cells = [
    { k: t('studio.builtUp'), v: sqft(m.builtUpAreaSqft) },
    { k: t('studio.saleable'), v: sqft(m.saleableAreaSqft) },
    { k: t('studio.units'), v: String(m.unitCount) },
    { k: t('studio.parking'), v: String(m.parkingCount) },
    { k: t('studio.efficiency'), v: pct(m.efficiencyPct) },
    { k: t('studio.openGreen'), v: pct(m.greenPct) },
  ]
  return (
    <div className="grid grid-cols-3 border-t border-line md:grid-cols-6">
      {cells.map((c, i) => (
        <div key={c.k} className={`px-4 py-4 ${i % 3 !== 2 ? 'border-r border-line' : ''} ${i < 3 ? 'border-b border-line md:border-b-0' : ''} md:border-r`}>
          <div className="label text-ink-faint">{c.k}</div>
          <div className="mono mt-1.5 whitespace-nowrap text-[0.82rem] text-ink">{c.v}</div>
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------- controls */
function Controls({ feas, set, listing }: { feas: FeasibilityInput; set: (p: Partial<FeasibilityInput>) => void; listing: Listing }) {
  const { t } = useLang()
  const fsiCap = listing.jd?.fsi
  return (
    <div>
      <p className="label text-accent">{t('studio.designParameters')}</p>
      <div className="mt-6 space-y-6">
        <Slider label={t('studio.towers')} value={feas.towers} min={1} max={6} onChange={(v) => set({ towers: v })} />
        <Slider label={t('studio.floors')} value={feas.floors} min={2} max={24} onChange={(v) => set({ floors: v })} format={(v) => `G+${v}`} />
        <Slider
          label={t('studio.fsi')}
          value={feas.fsi}
          min={1}
          max={3.5}
          step={0.05}
          onChange={(v) => set({ fsi: v })}
          format={(v) => v.toFixed(2)}
          hint={fsiCap ? `${t('studio.bylawSanction')}: ${fsiCap.toFixed(2)}` : undefined}
        />
        <Slider label={t('studio.floorPlateEfficiency')} value={feas.floorPlateEfficiency} min={0.68} max={0.88} step={0.01} onChange={(v) => set({ floorPlateEfficiency: v })} format={(v) => pct(v)} />
        <Slider label={t('studio.avgUnitSize')} value={feas.avgUnitSqft} min={800} max={2400} step={50} onChange={(v) => set({ avgUnitSqft: v })} format={(v) => `${groupIN(v)} sq ft`} />
        <Slider
          label={t('studio.marketSalePrice')}
          value={feas.baseSalePsf}
          min={4000}
          max={13000}
          step={100}
          onChange={(v) => set({ baseSalePsf: v })}
          format={(v) => `₹${groupIN(v)}/sq ft`}
          hint={t('studio.anchoredComps')}
        />
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- materials */
function Materials({ selection, onSelect, finishesPsf }: { selection: MaterialSelection; onSelect: (key: string, tier: Tier) => void; finishesPsf: number }) {
  const { t } = useLang()
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="label text-accent">{t('studio.materialSpec')}</p>
        <span className="mono text-xs text-ink-dim">{t('studio.finishes')} +₹{groupIN(finishesPsf)}/sq ft</span>
      </div>
      <div className="mt-6 space-y-5">
        {MATERIALS.map((cat) => {
          const tier = selection[cat.key]
          return (
            <div key={cat.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.9rem] text-ink-dim">{t(MATERIAL_CATEGORY_KEY[cat.key])}</span>
                <span className="mono text-[0.72rem] text-ink-faint">{cat.options[tier].label}</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {TIERS.map((tierOption) => {
                  const active = tierOption === tier
                  return (
                    <button
                      key={tierOption}
                      onClick={() => onSelect(cat.key, tierOption)}
                      className={`label border px-2 py-2 text-[0.58rem] transition-colors duration-300 ${
                        active ? 'border-[color:var(--line-accent)] bg-accent/10 text-accent' : 'border-line text-ink-faint hover:text-ink'
                      }`}
                    >
                      {t(`tier.${tierOption}`)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- GDV ticker */
function GdvTicker({ gdv, prediction, onModelCard }: { gdv: GdvResult; prediction: ValuationPrediction | null; onModelCard: () => void }) {
  const { t } = useLang()
  const { bear, base, bull } = gdv.zones
  const mlNet = prediction?.mlGdv ?? base.netValue
  const headline = useCountUp(mlNet)
  const cost = useCountUp(base.constructionCost)
  const span = Math.max(1, bull.netValue - bear.netValue)
  const basePos = ((base.netValue - bear.netValue) / span) * 100

  return (
    <footer className="sticky bottom-0 z-30 border-t border-line bg-paper-raise/80 px-6 py-5 backdrop-blur-md md:px-10 lg:static lg:backdrop-blur-none">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.4fr_0.9fr]">
        {/* headline — ML-adjusted net value with its calibrated band */}
        <div>
          <p className="label text-ink-faint">{t('studio.ndvLabel')}</p>
          <p className="font-display text-4xl font-semibold tracking-tight2 text-beam md:text-5xl">{crFromRupees(headline)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {prediction && (
              <span className="mono text-[0.72rem] text-ink-dim">
                P10–P90 {crFromRupees(prediction.p10)}–{crFromRupees(prediction.p90)}
              </span>
            )}
            {prediction && (
              <span className={`mono text-[0.72rem] ${prediction.adjustmentPct < 0 ? 'text-oxblood-bright' : 'text-emerald-bright'}`}>
                {prediction.adjustmentPct > 0 ? '+' : ''}
                {prediction.adjustmentPct}% {t('studio.vsParametric')} {crFromRupees(base.netValue)}
              </span>
            )}
            <button onClick={onModelCard} className="label text-accent transition-colors hover:text-accent-bright">
              {t('studio.modelCard')} ›
            </button>
          </div>
        </div>

        {/* three-zone bar */}
        <div className="px-1">
          <div className="relative h-[3px] w-full bg-[color:var(--line-strong)]">
            <div className="absolute inset-y-0 left-0 bg-accent/40" style={{ width: `${basePos}%` }} />
            <Tick pos={0} tone="oxblood" />
            <Tick pos={basePos} tone="accent" />
            <Tick pos={100} tone="emerald" />
          </div>
          <div className="mt-3 flex justify-between">
            <ZoneLabel tone="text-oxblood-bright" name={t('zone.bear')} value={crFromRupees(bear.netValue)} />
            <ZoneLabel tone="text-gold" name={t('zone.base')} value={crFromRupees(base.netValue)} center />
            <ZoneLabel tone="text-emerald-bright" name={t('zone.bull')} value={crFromRupees(bull.netValue)} right />
          </div>
        </div>

        {/* construction cost */}
        <div className="lg:text-right">
          <p className="label text-ink-faint">{t('studio.constructionCost')}</p>
          <p className="mono mt-1 text-xl text-ink">{crFromRupees(cost)}</p>
          <p className="mono mt-1 text-[0.72rem] text-ink-faint">
            ₹{groupIN(gdv.constructionPsfBase)}/{t('studio.builtUpSqft')}
          </p>
        </div>
      </div>
    </footer>
  )
}

function Tick({ pos, tone }: { pos: number; tone: 'oxblood' | 'accent' | 'emerald' }) {
  const color = tone === 'oxblood' ? '#C14E33' : tone === 'emerald' ? '#1F8A55' : '#A8842C'
  return (
    <span
      className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
      style={{ left: `${pos}%`, background: color, borderColor: color }}
    />
  )
}

function ZoneLabel({ name, value, tone, center, right }: { name: string; value: string; tone: string; center?: boolean; right?: boolean }) {
  return (
    <div className={center ? 'text-center' : right ? 'text-right' : ''}>
      <div className={`label ${tone}`}>{name}</div>
      <div className="mono mt-1 text-[0.82rem] text-ink-dim">{value}</div>
    </div>
  )
}

/* ----------------------------------------------------------- engage modal */
function EngageModal({
  listing,
  gdv,
  review,
  onRequested,
  onClose,
}: {
  listing: Listing
  gdv: GdvResult
  review: ArchitectReview | null
  onRequested: (r: ArchitectReview) => void
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)

  const proceed = async () => {
    setBusy(true)
    const snapshot: MlSnapshot = {
      units: gdv.feas.unitCount,
      saleableSqft: Math.round(gdv.feas.saleableAreaSqft),
      baseNet: Math.round(gdv.zones.base.netValue),
      constructionCost: Math.round(gdv.zones.base.constructionCost),
      salePsf: Math.round(gdv.zones.base.salePsf),
    }
    try {
      const r = await repo.requestArchitectReview(listing.id, snapshot)
      onRequested(r)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-paper/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto border border-[color:var(--line-accent)] bg-paper-card p-8 shadow-deep"
      >
        {review?.status === 'delivered' ? (
          <DeliveredView review={review} onClose={onClose} />
        ) : review?.status === 'requested' ? (
          <RequestedView review={review} listing={listing} onClose={onClose} />
        ) : (
          <RequestView listing={listing} gdv={gdv} busy={busy} onProceed={proceed} onClose={onClose} />
        )}
      </motion.div>
    </motion.div>
  )
}

function RequestView({ listing, gdv, busy, onProceed, onClose }: { listing: Listing; gdv: GdvResult; busy: boolean; onProceed: () => void; onClose: () => void }) {
  const { t } = useLang()
  const body = t('studio.engageBody')
    .replace('{id}', listing.id)
    .replace('{units}', String(gdv.feas.unitCount))
    .replace('{saleable}', sqft(gdv.feas.saleableAreaSqft))
    .replace('{ndv}', crFromRupees(gdv.zones.base.netValue))
  return (
    <div>
      <p className="label text-accent">{t('studio.stageTwoOriginal')}</p>
      <h3 className="mt-4 font-display text-3xl text-ink">{t('studio.engageArchitect')}</h3>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-dim">{body}</p>
      <div className="mt-6 flex items-baseline justify-between border-y border-line py-4">
        <span className="label text-ink-faint">{t('studio.engagementFee')}</span>
        <span className="mono text-lg text-ink">₹2,50,000</span>
      </div>
      <p className="mt-3 text-[0.78rem] text-ink-faint">{t('studio.adjustableCommission')}</p>
      <div className="mt-7 flex gap-3">
        <button onClick={onClose} disabled={busy} className="label flex-1 border border-line py-3.5 text-ink-dim transition-colors hover:text-ink disabled:opacity-50">
          {t('studio.notYet')}
        </button>
        <button onClick={onProceed} disabled={busy} className="label flex-1 bg-accent py-3.5 text-paper transition-colors hover:bg-accent-bright disabled:opacity-60">
          {busy ? t('studio.commissioning') : `${t('studio.proceed')} →`}
        </button>
      </div>
    </div>
  )
}

function RequestedView({ review, listing, onClose }: { review: ArchitectReview; listing: Listing; onClose: () => void }) {
  const { t } = useLang()
  const body = t('studio.validationBody').replace('{id}', listing.id)
  return (
    <div>
      <p className="label text-accent">{t('studio.stageTwoProgress')}</p>
      <h3 className="mt-4 font-display text-3xl text-ink">{t('studio.validationCommissioned')}</h3>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-dim">{body}</p>
      <div className="mt-6 space-y-3 border-y border-line py-4">
        <Row k={t('studio.commissioned')} v={fmtDate(review.requestedAt)} />
        <Row k={t('studio.mlEstimateMarket')} v={crFromRupees(review.mlSnapshot.baseNet)} />
        <Row k={t('studio.status')} v={t('studio.awaitingArchitect')} tone="text-accent" />
      </div>
      <button onClick={onClose} className="label mt-7 w-full border border-line py-3.5 text-ink-dim transition-colors hover:text-ink">
        {t('studio.close')}
      </button>
    </div>
  )
}

function DeliveredView({ review, onClose }: { review: ArchitectReview; onClose: () => void }) {
  const { t } = useLang()
  const ml = review.mlSnapshot.baseNet
  const arch = review.architectGdv ?? ml
  const variancePct = ml > 0 ? ((arch - ml) / ml) * 100 : 0
  const up = variancePct >= 0
  return (
    <div>
      <p className="label text-emerald-bright">{t('studio.stageTwoValidated')}</p>
      <h3 className="mt-4 font-display text-3xl text-ink">{t('studio.architectValidatedFeasibility')}</h3>
      <p className="mt-3 text-[0.88rem] text-ink-dim">{review.architectName}</p>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-line bg-[color:var(--line)]">
        <div className="bg-paper-card p-5">
          <p className="label text-ink-faint">{t('studio.studioAtCommission')}</p>
          <p className="mono mt-2 text-2xl text-ink">{crFromRupees(ml)}</p>
        </div>
        <div className="bg-paper-card p-5">
          <p className="label text-accent">{t('studio.architectValidatedLabel')}</p>
          <p className="mono mt-2 text-2xl text-beam">{crFromRupees(arch)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border border-line px-5 py-3">
        <span className="label text-ink-faint">{t('studio.varianceToModel')}</span>
        <span className={`mono text-sm ${up ? 'text-emerald-bright' : 'text-oxblood-bright'}`}>
          {up ? '+' : ''}
          {variancePct.toFixed(1)}%
        </span>
      </div>

      {review.architectNotes && (
        <div className="mt-5">
          <p className="label text-ink-faint">{t('studio.architectsNote')}</p>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-dim">{review.architectNotes}</p>
        </div>
      )}

      <p className="mono mt-5 text-[0.72rem] text-ink-faint">{t('studio.deliveredNote').replace('{date}', fmtDate(review.deliveredAt ?? review.requestedAt))}</p>
      <button onClick={onClose} className="label mt-6 w-full bg-accent py-3.5 text-paper transition-colors hover:bg-accent-bright">
        {t('studio.close')}
      </button>
    </div>
  )
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="label text-ink-faint">{k}</span>
      <span className={`mono text-sm ${tone ?? 'text-ink'}`}>{v}</span>
    </div>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ----------------------------------------------------------- model card */
function ModelCardModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  const [card, setCard] = useState<ModelCardData | null>(null)
  useEffect(() => {
    repo.getModelCard().then(setCard).catch(() => {})
  }, [])
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-paper/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto border border-[color:var(--line-accent)] bg-paper-card p-8 shadow-deep"
      >
        {card ? <ModelCard card={card} /> : <p className="label py-10 text-center text-ink-faint">{t('studio.loadingModel')}</p>}
        <button onClick={onClose} className="label mt-7 w-full border border-line py-3 text-ink-dim transition-colors hover:text-ink">
          {t('studio.close')}
        </button>
      </motion.div>
    </motion.div>
  )
}
