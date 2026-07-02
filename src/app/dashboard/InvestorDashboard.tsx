import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Listing } from '@/domain/types'
import { repo } from '@/data/repository'
import { AppShell } from '@/components/AppShell'
import { formatCr } from '@/lib/format'
import { rise, stagger, inView } from '@/lib/motion'

/** Illustrative existing holdings for the portfolio view. */
const PORTFOLIO = [
  { parcel: 'Sarjapur agri-belt', acquired: 2023, invested: 42, current: 61, note: 'ORR-east absorption; conversion filed' },
  { parcel: 'Devanahalli fringe', acquired: 2024, invested: 30, current: 38, note: 'Airport corridor; holding to 2027' },
]

export function InvestorDashboard() {
  const [opps, setOpps] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    repo.listListings().then((ls) => {
      if (!alive) return
      setOpps(ls.filter((l) => l.vertical === 'big-land'))
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const totalInvested = PORTFOLIO.reduce((s, h) => s + h.invested, 0)
  const totalCurrent = PORTFOLIO.reduce((s, h) => s + h.current, 0)
  const gain = totalInvested ? (totalCurrent - totalInvested) / totalInvested : 0

  return (
    <AppShell>
      <section>
        <p className="label text-accent">Big Land</p>
        <h1 className="mt-4 font-display text-5xl text-ivory md:text-6xl">Land, held for the long arc.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory-dim">
          Verified, contiguous parcels for patient capital — sized by investment, holding period and admin-assessed appreciation.
        </p>
      </section>

      {/* portfolio */}
      <section className="mt-14">
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-[color:var(--line)] sm:grid-cols-3">
          <Stat label="Invested" value={formatCr(totalInvested, 0)} />
          <Stat label="Current value" value={formatCr(totalCurrent, 0)} />
          <Stat label="Unrealised gain" value={`+${(gain * 100).toFixed(0)}%`} tone="text-emerald-bright" />
        </div>

        <h2 className="mt-12 font-display text-3xl text-ivory">Your portfolio</h2>
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line bg-ink-raise/40">
                {['Parcel', 'Acquired', 'Invested', 'Current', 'Admin note'].map((h) => (
                  <th key={h} className="label px-5 py-3.5 text-ivory-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PORTFOLIO.map((h) => (
                <tr key={h.parcel} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 text-sm text-ivory">{h.parcel}</td>
                  <td className="mono px-5 py-4 text-sm text-ivory-dim">{h.acquired}</td>
                  <td className="mono px-5 py-4 text-sm text-ivory-dim">{formatCr(h.invested, 0)}</td>
                  <td className="mono px-5 py-4 text-sm text-accent">{formatCr(h.current, 0)}</td>
                  <td className="px-5 py-4 text-[0.82rem] text-ivory-faint">{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* opportunities */}
      <section className="mt-16">
        <h2 className="font-display text-3xl text-ivory">Open opportunities</h2>
        <motion.div variants={stagger(0.1, 0.1)} initial="hidden" whileInView="show" viewport={inView} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {loading ? (
            <div className="h-56 animate-pulse border border-line bg-ink-raise/30" />
          ) : (
            opps.map((l) => (
              <motion.div key={l.id} variants={rise}>
                <Link
                  to={`/listing/${l.id}`}
                  className="group flex flex-col border border-line bg-ink-raise/40 p-7 transition-colors hover:border-[color:var(--line-accent)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-[0.72rem] text-ivory-dim">{l.id}</span>
                    <span className="label text-ivory-faint">Sealed</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl text-ivory">{l.headline}</h3>
                  <p className="mt-2 text-sm text-ivory-dim">{l.localityLabel}</p>

                  <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-5">
                    <MiniStat label="Investment" value={`₹${l.guidance.low}–${l.guidance.high} Cr`} />
                    <MiniStat label="Horizon" value={`${l.bigLand?.horizonYears ?? '—'} yrs`} />
                    <MiniStat label="Area" value={l.areaLabel.replace('≈ ', '')} />
                  </div>

                  {l.bigLand && <p className="mt-5 text-[0.88rem] leading-relaxed text-ivory-faint">“{l.bigLand.appreciationNote}.”</p>}
                  <span className="mt-5 self-end text-ivory-faint transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </AppShell>
  )
}

function Stat({ label, value, tone = 'text-beam' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-ink px-6 py-7 text-center">
      <div className={`font-display text-4xl md:text-5xl ${tone}`}>{value}</div>
      <div className="label mt-3 text-ivory-faint">{label}</div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label text-ivory-faint">{label}</div>
      <div className="mono mt-1 text-sm text-ivory">{value}</div>
    </div>
  )
}
