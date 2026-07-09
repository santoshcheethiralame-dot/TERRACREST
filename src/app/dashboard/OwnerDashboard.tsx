import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Engagement, Listing, Offer } from '@/domain/types'
import { useLang } from '@/i18n/LanguageContext'
import { VERTICAL_KEY } from '@/i18n/translations'
import { repo } from '@/data/repository'
import { useAuth } from '@/auth/AuthContext'
import { AppShell } from '@/components/AppShell'
import { rise, stagger, inView, EASE } from '@/lib/motion'

const PIPELINE_KEYS = ['pipeline.documents', 'pipeline.adminReview', 'pipeline.verified', 'pipeline.live', 'pipeline.inNegotiation', 'pipeline.closed']
const LEAVE_REASON_KEYS = ['leaveReason.priceLow', 'leaveReason.termsUnsuitable', 'leaveReason.profileMismatch', 'leaveReason.other']

function shortName(username: string, t: (k: string) => string): string {
  const [role, name] = username.split('_')
  const cap = name ? name[0].toUpperCase() + name.slice(1) : username
  const roleLabel = role === 'builder' ? t('role.builder') : role === 'landowner' ? t('role.ownerShort') : role === 'investor' ? t('role.investor') : role
  return `${cap} · ${roleLabel}`
}

export function OwnerDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const [properties, setProperties] = useState<Listing[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let alive = true
    repo.listingsForOwner(user.id).then((ls) => {
      if (!alive) return
      setProperties(ls)
      setActiveId(ls[0]?.id ?? null)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [user])

  useEffect(() => {
    if (!activeId) return
    let alive = true
    ;(async () => {
      const [e, o] = await Promise.all([repo.getEngagement(activeId), repo.getOffers(activeId)])
      if (!alive) return
      setEngagement(e ?? null)
      setOffers(o)
    })()
    return () => {
      alive = false
    }
  }, [activeId])

  const active = properties.find((p) => p.id === activeId) ?? null
  const negotiating = offers.some((o) => o.status === 'chosen')

  if (loading) {
    return (
      <AppShell>
        <p className="label animate-pulse py-20 text-center text-ink-faint">{t('owner.loadingDesk')}</p>
      </AppShell>
    )
  }

  if (!active) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <h1 className="font-display text-4xl text-ink">{t('owner.noListings')}</h1>
          <p className="mt-4 text-ink-dim">{t('owner.noListingsBody')}</p>
        </div>
      </AppShell>
    )
  }

  const onChoose = (offer: Offer) =>
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, status: 'chosen' } : { ...o, status: o.status === 'pending' ? 'declined' : o.status })))
  const onLeave = (offer: Offer) => setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, status: 'declined' } : o)))

  return (
    <AppShell>
      <motion.section variants={stagger()} initial="hidden" animate="show">
        <motion.p variants={rise} className="label text-accent">
          {t('owner.yourProperty')}
        </motion.p>
        <motion.h1 variants={rise} className="mt-4 font-display text-5xl leading-tight text-ink md:text-6xl">
          {active.headline}
        </motion.h1>
        <motion.div variants={rise} className="mt-4 flex items-center gap-3">
          <span className="label text-accent">{t(VERTICAL_KEY[active.vertical])}</span>
          <span className="text-ink-faint">·</span>
          <span className="text-sm text-ink-dim">{active.localityLabel}</span>
        </motion.div>
      </motion.section>

      <Pipeline status={active.status} negotiating={negotiating} />

      {/* engagement analytics — named, not anonymous */}
      <section className="mt-16">
        <h2 className="font-display text-3xl text-ink">{t('owner.whoWatching')}</h2>
        <p className="mt-2 text-sm text-ink-faint">{t('owner.whoWatchingDesc')}</p>
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden border border-line bg-[color:var(--line)] sm:grid-cols-3">
          <Metric n={engagement?.views.length ?? 0} label={t('owner.totalViews')} detail={engagement?.views.map((v) => `${shortName(v.by, t)} · ${v.at}`) ?? []} />
          <Metric n={engagement?.shortlists.length ?? 0} label={t('owner.shortlistAdds')} detail={(engagement?.shortlists ?? []).map((s) => shortName(s, t))} />
          <Metric n={engagement?.siteVisits.length ?? 0} label={t('owner.siteVisits')} detail={engagement?.siteVisits.map((v) => `${shortName(v.by, t)} · ${v.at}`) ?? []} />
        </div>
      </section>

      {/* offers */}
      <OffersTable offers={offers} negotiating={negotiating} onChoose={onChoose} onLeave={onLeave} />
    </AppShell>
  )
}

function Pipeline({ status, negotiating }: { status: Listing['status']; negotiating: boolean }) {
  const { t } = useLang()
  const current = negotiating
    ? 4
    : status === 'closed'
      ? 5
      : status === 'live' || status === 'under-offer'
        ? 3
        : status === 'verified'
          ? 2
          : status === 'under-review'
            ? 1
            : 0
  return (
    <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-3 border-y border-line py-6">
      {PIPELINE_KEYS.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <span
            className={`label ${i < current ? 'text-ink-faint' : i === current ? 'text-accent' : 'text-ink-faint/50'}`}
          >
            <span className="mono mr-2">{i <= current ? '●' : '○'}</span>
            {t(s)}
          </span>
          {i < PIPELINE_KEYS.length - 1 && <span className="text-ink-faint/30">—</span>}
        </div>
      ))}
    </div>
  )
}

function Metric({ n, label, detail }: { n: number; label: string; detail: string[] }) {
  return (
    <motion.div variants={rise} initial="hidden" whileInView="show" viewport={inView} className="bg-paper px-6 py-6">
      <div className="font-display text-5xl text-beam">{n}</div>
      <div className="label mt-3 text-ink-faint">{label}</div>
      <ul className="mt-3 space-y-1">
        {detail.length ? (
          detail.map((d) => (
            <li key={d} className="mono text-[0.72rem] text-ink-dim">
              {d}
            </li>
          ))
        ) : (
          <li className="mono text-[0.72rem] text-ink-faint/60">—</li>
        )}
      </ul>
    </motion.div>
  )
}

function OffersTable({
  offers,
  negotiating,
  onChoose,
  onLeave,
}: {
  offers: Offer[]
  negotiating: boolean
  onChoose: (o: Offer) => void
  onLeave: (o: Offer) => void
}) {
  const { t } = useLang()
  const [chooseFor, setChooseFor] = useState<Offer | null>(null)
  const [leaveFor, setLeaveFor] = useState<Offer | null>(null)
  const heads = [t('owner.colBuilder'), t('owner.colType'), t('owner.colQuote'), t('owner.colTerms'), t('owner.colStatus'), '']

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl text-ink">{t('owner.expressionsInterest')}</h2>
        {negotiating && <span className="label text-emerald-bright">● {t('owner.underDiscussion')}</span>}
      </div>
      <p className="mt-2 text-sm text-ink-faint">{t('owner.offersDesc')}</p>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper-raise/40">
              {heads.map((h, i) => (
                <th key={i} className="label px-5 py-3.5 text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-5 py-4 text-sm text-ink">{o.builder}</td>
                <td className="px-5 py-4 text-sm text-ink-dim">{o.type}</td>
                <td className="mono px-5 py-4 text-sm text-accent">{o.quote}</td>
                <td className="px-5 py-4 text-sm text-ink-dim">{o.terms}</td>
                <td className="px-5 py-4">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-5 py-4">
                  {o.status === 'pending' && !negotiating ? (
                    <div className="flex gap-2">
                      <button onClick={() => setChooseFor(o)} className="label bg-accent px-4 py-2 text-paper transition-colors hover:bg-accent-bright">
                        {t('owner.choose')}
                      </button>
                      <button
                        onClick={() => setLeaveFor(o)}
                        className="label border border-line px-4 py-2 text-ink-faint transition-colors hover:text-ink"
                      >
                        {t('owner.leave')}
                      </button>
                    </div>
                  ) : (
                    <span className="mono text-[0.72rem] text-ink-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {chooseFor && (
          <ConfirmModal
            title={t('owner.selectPreferred')}
            body={t('owner.selectPreferredBody').replace('{builder}', chooseFor.builder)}
            confirmLabel={t('owner.confirmSelection')}
            onConfirm={() => {
              onChoose(chooseFor)
              setChooseFor(null)
            }}
            onClose={() => setChooseFor(null)}
          />
        )}
        {leaveFor && (
          <LeaveModal
            builder={leaveFor.builder}
            onConfirm={() => {
              onLeave(leaveFor)
              setLeaveFor(null)
            }}
            onClose={() => setLeaveFor(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function StatusPill({ status }: { status: Offer['status'] }) {
  const { t } = useLang()
  if (status === 'chosen') return <span className="label text-emerald-bright">● {t('owner.preferred')}</span>
  if (status === 'declined') return <span className="label text-ink-faint">{t('owner.declined')}</span>
  return <span className="label text-accent">{t('owner.pending')}</span>
}

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-paper/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative w-full max-w-lg border border-[color:var(--line-accent)] bg-paper-card p-8 shadow-deep"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useLang()
  return (
    <ModalShell onClose={onClose}>
      <p className="label text-accent">{t('owner.confirm')}</p>
      <h3 className="mt-4 font-display text-3xl text-ink">{title}</h3>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-dim">{body}</p>
      <div className="mt-7 flex gap-3">
        <button onClick={onClose} className="label flex-1 border border-line py-3.5 text-ink-dim transition-colors hover:text-ink">
          {t('owner.cancel')}
        </button>
        <button onClick={onConfirm} className="label flex-1 bg-accent py-3.5 text-paper transition-colors hover:bg-accent-bright">
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  )
}

function LeaveModal({ builder, onConfirm, onClose }: { builder: string; onConfirm: () => void; onClose: () => void }) {
  const { t } = useLang()
  const [reason, setReason] = useState<string | null>(null)
  return (
    <ModalShell onClose={onClose}>
      <p className="label text-accent">{t('owner.decline')}</p>
      <h3 className="mt-4 font-display text-3xl text-ink">{t('owner.passOn').replace('{builder}', builder)}</h3>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-dim">{t('owner.declineBody')}</p>
      <div className="mt-6 space-y-2">
        {LEAVE_REASON_KEYS.map((rk) => {
          const r = t(rk)
          return (
            <button
              key={rk}
              onClick={() => setReason(r)}
              className={`label w-full border px-4 py-3 text-left transition-colors ${
                reason === r ? 'border-[color:var(--line-accent)] bg-accent/10 text-accent' : 'border-line text-ink-dim hover:text-ink'
              }`}
            >
              {r}
            </button>
          )
        })}
      </div>
      <div className="mt-7 flex gap-3">
        <button onClick={onClose} className="label flex-1 border border-line py-3.5 text-ink-dim transition-colors hover:text-ink">
          {t('owner.cancel')}
        </button>
        <button
          onClick={onConfirm}
          disabled={!reason}
          className="label flex-1 bg-accent py-3.5 text-paper transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('owner.confirmDecline')}
        </button>
      </div>
    </ModalShell>
  )
}
