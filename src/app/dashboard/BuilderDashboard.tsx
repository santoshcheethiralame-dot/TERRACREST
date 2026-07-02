import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Listing, Nda } from '@/domain/types'
import { repo } from '@/data/repository'
import { useAuth } from '@/auth/AuthContext'
import { AppShell } from '@/components/AppShell'
import { ListingCard } from '@/components/ListingCard'
import { rise, stagger } from '@/lib/motion'

export function BuilderDashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [ndas, setNdas] = useState<Nda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let alive = true
    ;(async () => {
      try {
        const ls = await repo.listListings()
        const flags = await Promise.all(ls.map((l) => repo.isUnlocked(l.id, user.id)))
        const nd = await repo.ndasForBuilder(user.id)
        if (!alive) return
        setListings(ls)
        setUnlocked(new Set(ls.filter((_, i) => flags[i]).map((l) => l.id)))
        setNdas(nd)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [user])

  const byId = (id: string) => listings.find((l) => l.id === id)

  return (
    <AppShell nav={<BuilderNav />}>
      <section>
        <p className="label text-accent">Discovery</p>
        <h1 className="mt-4 font-display text-5xl text-ink md:text-6xl">Curated for you.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-dim">
          Parcels chosen by your relationship manager — not an algorithm. Location, ownership and documents stay sealed
          until a witnessed NDA is executed and logged by our desk.
        </p>
      </section>

      {/* Animate when the data lands, not on scroll — cards mounted after a slow
          fetch must never be stranded in the observer's consumed "hidden" state. */}
      <motion.div
        variants={stagger(0.1, 0.09)}
        initial="hidden"
        animate={loading ? 'hidden' : 'show'}
        className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : listings.length === 0 ? (
          <p className="label col-span-full border border-line px-6 py-10 text-center text-ink-faint">
            The desk is preparing your book — check back shortly.
          </p>
        ) : (
          listings.map((l) => (
            <motion.div key={l.id} variants={rise}>
              <ListingCard listing={l} unlocked={unlocked.has(l.id)} />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* NDA log */}
      <section className="mt-20" id="ndas">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl text-ink">NDA log</h2>
          <span className="label text-ink-faint">{ndas.length} on file</span>
        </div>
        <div className="mt-6 overflow-hidden border border-line">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-paper-raise/40">
                {['Property', 'Land owner', 'Signed', 'Witnessed by'].map((h) => (
                  <th key={h} className="label px-5 py-3.5 text-ink-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ndas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-faint">
                    No NDAs executed yet. Request an unlock on a parcel to begin.
                  </td>
                </tr>
              ) : (
                ndas.map((n) => (
                  <tr key={n.id} className="border-b border-line last:border-0">
                    <td className="mono px-5 py-4 text-sm text-ink">{byId(n.listingId)?.headline ?? n.listingId}</td>
                    <td className="px-5 py-4 text-sm text-ink-dim">{byId(n.listingId)?.sealed?.ownerName ?? '—'}</td>
                    <td className="mono px-5 py-4 text-sm text-ink-dim">{n.signedOn}</td>
                    <td className="px-5 py-4 text-sm text-ink-dim">{n.witnessedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}

function BuilderNav() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `label transition-colors ${isActive ? 'text-accent' : 'text-ink-faint hover:text-ink'}`
  return (
    <nav className="hidden items-center gap-7 md:flex">
      <NavLink to="/app" end className={linkCls}>
        Discovery
      </NavLink>
      <a href="#ndas" className="label text-ink-faint transition-colors hover:text-ink">
        NDA Log
      </a>
    </nav>
  )
}

function SkeletonCard() {
  return <div className="h-64 animate-pulse border border-line bg-paper-raise/30" />
}
