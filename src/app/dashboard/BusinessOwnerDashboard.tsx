import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Listing, WarehouseReservation } from '@/domain/types'
import { repo } from '@/data/repository'
import { useAuth } from '@/auth/AuthContext'
import { useLang } from '@/i18n/LanguageContext'
import { AppShell } from '@/components/AppShell'
import { ListingCard } from '@/components/ListingCard'
import { rise, stagger } from '@/lib/motion'

export function BusinessOwnerDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const [reservations, setReservations] = useState<WarehouseReservation[]>([])
  const [warehouses, setWarehouses] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const load = async () => {
    if (!user) return
    const [res, ls] = await Promise.all([repo.getMyReservations(), repo.listListings()])
    setReservations(res)
    setWarehouses(ls.filter((l) => l.vertical === 'warehouse'))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const flash = (tone: 'ok' | 'error', text: string) => {
    setActionMsg({ tone, text })
    setTimeout(() => setActionMsg(null), 5000)
  }

  const handleReserve = async (listing: Listing) => {
    setBusyId(listing.id)
    try {
      const res = await repo.holdReservation(listing.id)
      setReservations((prev) => [res, ...prev])
      flash('ok', t('bizOwner.reservedToast').replace('{headline}', listing.headline))
    } catch {
      flash('error', t('bizOwner.reserveFailed'))
      load() // someone else may already hold it — resync the list
    } finally {
      setBusyId(null)
    }
  }

  const handleConfirm = async (id: string) => {
    setBusyId(id)
    try {
      const updated = await repo.confirmReservation(id)
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)))
      flash('ok', t('bizOwner.confirmedToast'))
    } finally {
      setBusyId(null)
    }
  }

  const handleRelease = async (id: string) => {
    setBusyId(id)
    try {
      const updated = await repo.releaseReservation(id)
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)))
      flash('ok', t('bizOwner.releasedToast'))
    } finally {
      setBusyId(null)
    }
  }

  const activeReservations = reservations.filter((r) => r.status === 'held' || r.status === 'confirmed')
  const reservedIds = useMemo(() => new Set(activeReservations.map((r) => r.listingId)), [activeReservations])
  const availableWarehouses = warehouses.filter((w) => !reservedIds.has(w.id))

  if (loading) {
    return (
      <AppShell>
        <p className="label animate-pulse py-20 text-center text-ink-faint">{t('bizOwner.loading')}</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <section>
        <p className="label text-accent">{t('bizOwner.eyebrow')}</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-ink md:text-6xl">{user?.displayName.split('·')[0].trim()}</h1>
      </section>

      {actionMsg && (
        <div
          className={`mt-6 border-l-2 py-3 pl-4 text-sm ${
            actionMsg.tone === 'ok' ? 'border-emerald-bright bg-emerald-bright/10 text-emerald-bright' : 'border-oxblood-bright bg-oxblood-bright/10 text-oxblood-bright'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* active reservations */}
      <section className="mt-14">
        <h2 className="font-display text-3xl text-ink">{t('bizOwner.activeReservations')}</h2>
        <p className="mt-2 text-sm text-ink-faint">{t('bizOwner.activeReservationsDesc')}</p>

        {activeReservations.length === 0 ? (
          <p className="label mt-8 border border-line px-6 py-10 text-center text-ink-faint">{t('bizOwner.noReservations')}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activeReservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                listing={warehouses.find((w) => w.id === r.listingId)}
                busy={busyId === r.id}
                onConfirm={() => handleConfirm(r.id)}
                onRelease={() => handleRelease(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* browse */}
      <section className="mt-16">
        <h2 className="font-display text-3xl text-ink">{t('bizOwner.browseWarehouses')}</h2>
        <p className="mt-2 text-sm text-ink-faint">{t('bizOwner.browseWarehousesDesc')}</p>

        {/* Animate when the data lands, not on scroll — see the discovery-board note
            elsewhere: a fetch slower than the scroll observer strands late cards. */}
        <motion.div variants={stagger(0.1, 0.09)} initial="hidden" animate="show" className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {availableWarehouses.length === 0 ? (
            <p className="label col-span-full border border-line px-6 py-10 text-center text-ink-faint">{t('bizOwner.noneAvailable')}</p>
          ) : (
            availableWarehouses.map((l) => (
              <motion.div key={l.id} variants={rise} className="group relative flex h-full flex-col">
                <ListingCard listing={l} />
                <button
                  onClick={() => handleReserve(l)}
                  disabled={busyId === l.id}
                  className="label absolute right-4 top-4 z-10 bg-accent px-4 py-2 text-paper opacity-0 shadow-md transition-opacity hover:bg-accent-bright group-hover:opacity-100 disabled:opacity-60"
                >
                  {busyId === l.id ? t('bizOwner.reserving') : t('bizOwner.reserve')}
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </AppShell>
  )
}

function ReservationCard({
  reservation,
  listing,
  busy,
  onConfirm,
  onRelease,
}: {
  reservation: WarehouseReservation
  listing?: Listing
  busy: boolean
  onConfirm: () => void
  onRelease: () => void
}) {
  const { t } = useLang()
  return (
    <div className="border border-line bg-paper-card p-6">
      <div className="flex items-center justify-between">
        <span className={`label ${reservation.status === 'confirmed' ? 'text-emerald-bright' : 'text-accent'}`}>
          {reservation.status === 'confirmed' ? t('bizOwner.statusConfirmed') : t('bizOwner.statusHeld')}
        </span>
        <span className="mono text-[0.72rem] text-ink-faint">
          {t('bizOwner.expires')} {fmtDate(reservation.expiresAt)}
        </span>
      </div>
      <h3 className="mt-4 font-display text-2xl leading-tight text-ink">{listing?.headline ?? reservation.listingId}</h3>
      <p className="mono mt-2 text-sm text-ink-faint">{reservation.listingId}</p>

      {reservation.status === 'held' && (
        <div className="mt-6 flex gap-3">
          <button onClick={onConfirm} disabled={busy} className="label flex-1 bg-accent py-3 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
            {t('bizOwner.confirmHold')}
          </button>
          <button onClick={onRelease} disabled={busy} className="label flex-1 border border-line py-3 text-ink-dim transition-colors hover:border-[color:var(--line-accent)] hover:text-ink disabled:opacity-50">
            {t('bizOwner.release')}
          </button>
        </div>
      )}

      {listing && (
        <Link to={`/listing/${listing.id}`} className="label mt-5 inline-flex items-center gap-2 text-accent transition-colors hover:text-accent-bright">
          {t('bizOwner.openDealRoom')} →
        </Link>
      )}
    </div>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
