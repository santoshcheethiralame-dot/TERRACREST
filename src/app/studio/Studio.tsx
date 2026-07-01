import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { FeasibilityInput, Listing } from '@/domain/types'
import { VERTICAL_LABEL } from '@/domain/types'
import { repo } from '@/data/repository'
import { computeGdv, defaultSelection, type MaterialSelection, type GdvResult } from '@/lib/gdv'
import { buildSitePlan, type SitePlan } from '@/lib/siteplan'
import { MATERIALS, TIERS, TIER_LABEL, type Tier } from '@/lib/materials'
import { crFromRupees, sqft, pct, groupIN } from '@/lib/format'
import { useCountUp } from '@/lib/hooks'
import { Slider } from '@/components/Slider'
import { EASE } from '@/lib/motion'

export function Studio() {
  const { id } = useParams()
  const listingId = id ?? 'JD-BLR-2026-012'
  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    let alive = true
    repo.getListing(listingId).then((l) => alive && setListing(l ?? null))
    return () => {
      alive = false
    }
  }, [listingId])

  if (!listing) return <StudioLoading />
  return <StudioInner listing={listing} />
}

function StudioLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink">
      <p className="label animate-pulse text-ivory-faint">Loading parcel…</p>
    </div>
  )
}

function StudioInner({ listing }: { listing: Listing }) {
  const [feas, setFeas] = useState<FeasibilityInput>(listing.feasibility)
  const [selection, setSelection] = useState<MaterialSelection>(defaultSelection())
  const [engage, setEngage] = useState(false)

  const gdv = useMemo(() => computeGdv(feas, selection), [feas, selection])
  const plan = useMemo(() => buildSitePlan(feas, gdv.feas.footprintSqft), [feas, gdv.feas.footprintSqft])
  const set = (patch: Partial<FeasibilityInput>) => setFeas((f) => ({ ...f, ...patch }))

  return (
    <div className="flex min-h-screen flex-col bg-ink text-ivory lg:h-screen lg:overflow-hidden">
      <StudioBar listing={listing} onEngage={() => setEngage(true)} />

      <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[1.55fr_1fr]">
        {/* canvas + metrics */}
        <section className="blueprint relative flex min-h-[46vh] flex-col border-b border-line lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="relative min-h-0 flex-1 p-6 md:p-10">
            <SitePlanCanvas plan={plan} feas={feas} />
          </div>
          <MetricsStrip gdv={gdv} />
        </section>

        {/* controls */}
        <aside className="bg-ink-raise/40 px-6 py-7 md:px-8 lg:min-h-0 lg:overflow-y-auto">
          <Controls feas={feas} set={set} listing={listing} />
          <div className="hairline my-8" />
          <Materials selection={selection} onSelect={(k, t) => setSelection((s) => ({ ...s, [k]: t }))} finishesPsf={gdv.finishesPsf} />
        </aside>
      </div>

      <GdvTicker gdv={gdv} />

      <AnimatePresence>{engage && <EngageModal listing={listing} gdv={gdv} onClose={() => setEngage(false)} />}</AnimatePresence>
    </div>
  )
}

/* --------------------------------------------------------------- top bar */
function StudioBar({ listing, onEngage }: { listing: Listing; onEngage: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4 md:px-10">
      <div className="flex items-center gap-6">
        <Link to="/app" className="label text-ivory-faint transition-colors hover:text-ivory">
          ← Terracrest
        </Link>
        <div className="hidden h-4 w-px bg-[color:var(--line-strong)] sm:block" />
        <div className="hidden sm:block">
          <p className="label text-gold">Feasibility Studio</p>
          <p className="mono mt-1 text-[0.72rem] text-ivory-dim">
            {listing.id} · {VERTICAL_LABEL[listing.vertical]} · {listing.localityLabel.split('·')[0].trim()}
          </p>
        </div>
      </div>
      <button
        onClick={onEngage}
        className="label group inline-flex items-center gap-3 border border-[color:var(--line-gold)] px-5 py-3 text-gold transition-colors duration-500 hover:bg-gold hover:text-ink"
      >
        Confirm &amp; Engage Architect
        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
      </button>
    </header>
  )
}

/* ----------------------------------------------------------- site plan */
function SitePlanCanvas({ plan, feas }: { plan: SitePlan; feas: FeasibilityInput }) {
  const { plot } = plan
  const padX = plot.w * 0.17
  const padY = plot.h * 0.13
  const road = plot.h * 0.13
  const vb = `${-padX} ${-padY} ${plot.w + 2 * padX} ${plot.h + padY + road + padY}`
  const U = plot.w
  const sw = Math.max(1.4, U * 0.005)
  const fs = U * 0.03

  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="Live parcel massing schematic">
      {/* road along frontage (bottom) */}
      <g>
        <rect x={0} y={plot.h + road * 0.35} width={plot.w} height={road * 0.5} fill="#726d61" fillOpacity="0.08" stroke="#726d61" strokeOpacity="0.4" strokeWidth={sw * 0.7} />
        <text x={plot.w / 2} y={plot.h + road * 0.72} textAnchor="middle" fill="#726d61" fontFamily="'IBM Plex Mono', monospace" fontSize={fs * 0.82} letterSpacing={fs * 0.03}>
          {feas.roadWidthFt} FT ROAD · FRONTAGE
        </text>
      </g>

      {/* parcel boundary */}
      <rect x={0} y={0} width={plot.w} height={plot.h} fill="none" stroke="#c9a227" strokeOpacity="0.7" strokeWidth={sw} />
      {/* setback envelope */}
      <rect
        x={plan.buildable.x}
        y={plan.buildable.y}
        width={plan.buildable.w}
        height={plan.buildable.h}
        fill="none"
        stroke="#c9a227"
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
          fill="#c9a227"
          fillOpacity="0.13"
          stroke="#c9a227"
          strokeOpacity="0.62"
          strokeWidth={sw}
        />
      ))}

      {/* dimension — frontage */}
      <g stroke="#726d61" strokeWidth={sw * 0.6} fill="#726d61">
        <line x1={0} y1={-padY * 0.5} x2={plot.w} y2={-padY * 0.5} strokeOpacity="0.5" />
        <line x1={0} y1={-padY * 0.62} x2={0} y2={-padY * 0.38} strokeOpacity="0.5" />
        <line x1={plot.w} y1={-padY * 0.62} x2={plot.w} y2={-padY * 0.38} strokeOpacity="0.5" />
        <text x={plot.w / 2} y={-padY * 0.62} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={fs * 0.82} stroke="none" fillOpacity="0.9">
          ≈ {groupIN(plan.frontageFt)} ft
        </text>
      </g>
      {/* dimension — depth */}
      <g stroke="#726d61" strokeWidth={sw * 0.6} fill="#726d61">
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
      <g transform={`translate(${plot.w + padX * 0.45} ${padY * 0.2})`} stroke="#726d61" strokeWidth={sw * 0.8} fill="none">
        <path d={`M0 ${fs * 1.6} L0 0 M${-fs * 0.35} ${fs * 0.4} L0 0 L${fs * 0.35} ${fs * 0.4}`} />
        <text x={0} y={fs * 2.6} textAnchor="middle" fill="#726d61" stroke="none" fontFamily="'IBM Plex Mono', monospace" fontSize={fs * 0.9}>
          N
        </text>
      </g>
    </svg>
  )
}

/* ----------------------------------------------------------- metrics */
function MetricsStrip({ gdv }: { gdv: GdvResult }) {
  const m = gdv.feas
  const cells = [
    { k: 'Built-up', v: sqft(m.builtUpAreaSqft) },
    { k: 'Saleable', v: sqft(m.saleableAreaSqft) },
    { k: 'Units', v: String(m.unitCount) },
    { k: 'Parking', v: String(m.parkingCount) },
    { k: 'Efficiency', v: pct(m.efficiencyPct) },
    { k: 'Open / green', v: pct(m.greenPct) },
  ]
  return (
    <div className="grid grid-cols-3 border-t border-line md:grid-cols-6">
      {cells.map((c, i) => (
        <div key={c.k} className={`px-4 py-4 ${i % 3 !== 2 ? 'border-r border-line' : ''} ${i < 3 ? 'border-b border-line md:border-b-0' : ''} md:border-r`}>
          <div className="label text-ivory-faint">{c.k}</div>
          <div className="mono mt-1.5 text-sm text-ivory">{c.v}</div>
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------- controls */
function Controls({ feas, set, listing }: { feas: FeasibilityInput; set: (p: Partial<FeasibilityInput>) => void; listing: Listing }) {
  const fsiCap = listing.jd?.fsi
  return (
    <div>
      <p className="label text-gold">Design Parameters</p>
      <div className="mt-6 space-y-6">
        <Slider label="Towers" value={feas.towers} min={1} max={6} onChange={(v) => set({ towers: v })} />
        <Slider label="Floors (G +)" value={feas.floors} min={2} max={24} onChange={(v) => set({ floors: v })} format={(v) => `G+${v}`} />
        <Slider
          label="FSI"
          value={feas.fsi}
          min={1}
          max={3.5}
          step={0.05}
          onChange={(v) => set({ fsi: v })}
          format={(v) => v.toFixed(2)}
          hint={fsiCap ? `By-law sanction: ${fsiCap.toFixed(2)}` : undefined}
        />
        <Slider label="Floor-plate efficiency" value={feas.floorPlateEfficiency} min={0.68} max={0.88} step={0.01} onChange={(v) => set({ floorPlateEfficiency: v })} format={(v) => pct(v)} />
        <Slider label="Avg unit size" value={feas.avgUnitSqft} min={800} max={2400} step={50} onChange={(v) => set({ avgUnitSqft: v })} format={(v) => `${groupIN(v)} sq ft`} />
        <Slider label="Market sale price" value={feas.baseSalePsf} min={4000} max={13000} step={100} onChange={(v) => set({ baseSalePsf: v })} format={(v) => `₹${groupIN(v)}/sq ft`} hint="Anchored to admin-verified comparables" />
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- materials */
function Materials({ selection, onSelect, finishesPsf }: { selection: MaterialSelection; onSelect: (key: string, tier: Tier) => void; finishesPsf: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="label text-gold">Material Specification</p>
        <span className="mono text-xs text-ivory-dim">finishes +₹{groupIN(finishesPsf)}/sq ft</span>
      </div>
      <div className="mt-6 space-y-5">
        {MATERIALS.map((cat) => {
          const tier = selection[cat.key]
          return (
            <div key={cat.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.9rem] text-ivory-dim">{cat.name}</span>
                <span className="mono text-[0.72rem] text-ivory-faint">{cat.options[tier].label}</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {TIERS.map((t) => {
                  const active = t === tier
                  return (
                    <button
                      key={t}
                      onClick={() => onSelect(cat.key, t)}
                      className={`label border px-2 py-2 text-[0.58rem] transition-colors duration-300 ${
                        active ? 'border-[color:var(--line-gold)] bg-gold/10 text-gold' : 'border-line text-ivory-faint hover:text-ivory'
                      }`}
                    >
                      {TIER_LABEL[t]}
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
function GdvTicker({ gdv }: { gdv: GdvResult }) {
  const { bear, base, bull } = gdv.zones
  const baseNet = useCountUp(base.netValue)
  const cost = useCountUp(base.constructionCost)
  const span = Math.max(1, bull.netValue - bear.netValue)
  const basePos = ((base.netValue - bear.netValue) / span) * 100

  return (
    <footer className="sticky bottom-0 z-30 border-t border-line bg-ink-raise/80 px-6 py-5 backdrop-blur-md md:px-10 lg:static lg:backdrop-blur-none">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.4fr_0.9fr]">
        {/* headline net value */}
        <div>
          <p className="label text-ivory-faint">Net Development Value · Market</p>
          <p className="font-display text-4xl text-gilt md:text-5xl">{crFromRupees(baseNet)}</p>
        </div>

        {/* three-zone bar */}
        <div className="px-1">
          <div className="relative h-[3px] w-full bg-[color:var(--line-strong)]">
            <div className="absolute inset-y-0 left-0 bg-gold/40" style={{ width: `${basePos}%` }} />
            <Tick pos={0} tone="oxblood" />
            <Tick pos={basePos} tone="gold" />
            <Tick pos={100} tone="emerald" />
          </div>
          <div className="mt-3 flex justify-between">
            <ZoneLabel tone="text-oxblood-bright" name="Bear" value={crFromRupees(bear.netValue)} />
            <ZoneLabel tone="text-gold" name="Base" value={crFromRupees(base.netValue)} center />
            <ZoneLabel tone="text-emerald-bright" name="Bull" value={crFromRupees(bull.netValue)} right />
          </div>
        </div>

        {/* construction cost */}
        <div className="lg:text-right">
          <p className="label text-ivory-faint">Construction Cost</p>
          <p className="mono mt-1 text-xl text-ivory">{crFromRupees(cost)}</p>
          <p className="mono mt-1 text-[0.72rem] text-ivory-faint">₹{groupIN(gdv.constructionPsfBase)}/sq ft built-up</p>
        </div>
      </div>
    </footer>
  )
}

function Tick({ pos, tone }: { pos: number; tone: 'oxblood' | 'gold' | 'emerald' }) {
  const color = tone === 'oxblood' ? '#bd6552' : tone === 'emerald' ? '#5c9b80' : '#c9a227'
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
      <div className="mono mt-1 text-[0.82rem] text-ivory-dim">{value}</div>
    </div>
  )
}

/* ----------------------------------------------------------- engage modal */
function EngageModal({ listing, gdv, onClose }: { listing: Listing; gdv: GdvResult; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative w-full max-w-lg border border-[color:var(--line-gold)] bg-ink-card p-8 shadow-deep"
      >
        <p className="label text-gold">Stage Two · Original Architecture</p>
        <h3 className="mt-4 font-display text-3xl text-ivory">Engage the empanelled architect</h3>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-ivory-dim">
          Your feasibility on <span className="mono text-ivory">{listing.id}</span> — {gdv.feas.unitCount} units, {sqft(gdv.feas.saleableAreaSqft)} saleable, a
          market Net Development Value of <span className="text-gold">{crFromRupees(gdv.zones.base.netValue)}</span> — will be handed to our internal architect for
          stamped, buildable drawings validated against this model.
        </p>
        <div className="mt-6 flex items-baseline justify-between border-y border-line py-4">
          <span className="label text-ivory-faint">Engagement fee</span>
          <span className="mono text-lg text-ivory">₹2,50,000</span>
        </div>
        <p className="mt-3 text-[0.78rem] text-ivory-faint">Adjustable against Terracrest commission on closure.</p>
        <div className="mt-7 flex gap-3">
          <button onClick={onClose} className="label flex-1 border border-line py-3.5 text-ivory-dim transition-colors hover:text-ivory">
            Not yet
          </button>
          <button onClick={onClose} className="label flex-1 bg-gold py-3.5 text-ink transition-colors hover:bg-gold-bright">
            Proceed →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
