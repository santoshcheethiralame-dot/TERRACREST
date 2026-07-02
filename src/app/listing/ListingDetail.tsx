import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Document, Listing, Message, RiskScore } from '@/domain/types'
import { VERTICAL_LABEL, STATUS_LABEL } from '@/domain/types'
import { repo } from '@/data/repository'
import { useAuth } from '@/auth/AuthContext'
import { AppShell } from '@/components/AppShell'
import { Seal } from '@/components/Seal'
import { ParcelMap } from '@/components/ParcelMap'
import { rise, stagger } from '@/lib/motion'

const TODAY = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const VAULT_CATEGORIES = [
  { kind: 'deed', name: 'Title deed' },
  { kind: 'certificate', name: 'Encumbrance certificate' },
  { kind: 'survey', name: 'Boundary survey' },
  { kind: 'receipt', name: 'Tax receipts' },
]

export function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null | undefined>(undefined)
  const [unlocked, setUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [docs, setDocs] = useState<Document[]>([])
  const [msgs, setMsgs] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [risk, setRisk] = useState<RiskScore | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const l = await repo.getListing(id ?? '')
      if (!alive) return
      setListing(l ?? null)
      if (l && user) setUnlocked(await repo.isUnlocked(l.id, user.id))
    })()
    return () => {
      alive = false
    }
  }, [id, user])

  useEffect(() => {
    if (!listing || !unlocked) {
      setDocs([])
      return
    }
    let alive = true
    repo.getDocuments(listing.id).then((d) => alive && setDocs(d))
    return () => {
      alive = false
    }
  }, [listing, unlocked])

  useEffect(() => {
    if (!listing || !unlocked) {
      setMsgs([])
      return
    }
    let alive = true
    repo.getMessages(listing.id).then((m) => alive && setMsgs(m))
    return () => {
      alive = false
    }
  }, [listing, unlocked])

  // Risk is masked-safe (public attributes only) — load it as soon as the parcel does.
  useEffect(() => {
    if (!listing) return
    let alive = true
    repo.getListingRisk(listing.id).then((r) => alive && setRisk(r)).catch(() => {})
    return () => {
      alive = false
    }
  }, [listing])

  const sealedFields = useMemo(() => {
    const s = listing?.sealed
    return [
      { label: 'Exact location', value: s?.address ?? '' },
      { label: 'GPS', value: s ? `${s.coords.lat.toFixed(4)}°N, ${s.coords.lng.toFixed(4)}°E` : '' },
      { label: 'Owner of record', value: s?.ownerName ?? '' },
      { label: 'Survey numbers', value: s?.surveyNos.join(', ') ?? '' },
      { label: 'Contact history', value: s?.contact ?? '' },
    ]
  }, [listing])

  if (listing === undefined) {
    return (
      <AppShell>
        <p className="label animate-pulse py-20 text-center text-ivory-faint">Retrieving parcel…</p>
      </AppShell>
    )
  }
  if (listing === null) {
    return (
      <AppShell nav={<BackNav />}>
        <div className="py-24 text-center">
          <h1 className="font-display text-4xl text-ivory">Parcel not found</h1>
          <Link to="/app" className="label mt-6 inline-block text-gold">
            ← Back to discovery
          </Link>
        </div>
      </AppShell>
    )
  }

  const unlock = async () => {
    if (!user) return
    setUnlocking(true)
    await repo.logNda(listing.id, user.id) // stands in for the admin logging a witnessed NDA
    const fresh = await repo.getListing(listing.id) // in API mode this now returns the unsealed parcel
    setUnlocking(false)
    if (fresh) setListing(fresh)
    setUnlocked(true)
  }

  const openDoc = async (doc: Document) => {
    const url = await repo.documentUrl(listing.id, doc.id)
    window.open(url, '_blank', 'noopener')
  }

  const sendMessage = async (body: string) => {
    setSending(true)
    const m = await repo.postMessage(listing.id, body)
    setSending(false)
    setMsgs((prev) => [...prev, m])
  }

  return (
    <AppShell nav={<BackNav />}>
      <motion.div variants={stagger(0.08, 0.08)} initial="hidden" animate="show" className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ---------- public / masked-safe ---------- */}
        <motion.div variants={rise}>
          <div className="flex items-center gap-3">
            <span className="mono text-[0.72rem] text-ivory-dim">{listing.id}</span>
            <span className="text-ivory-faint">·</span>
            <span className="label text-gold">{VERTICAL_LABEL[listing.vertical]}</span>
            <span className="text-ivory-faint">·</span>
            <span className="label text-ivory-faint">{STATUS_LABEL[listing.status]}</span>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-tight text-ivory md:text-5xl">{listing.headline}</h1>
          <p className="mt-4 text-lg text-ivory-dim">{listing.localityLabel}</p>

          <div className="mt-8 flex items-start gap-5 border-y border-line py-6">
            <Seal size={58} text="· PHYSICALLY VERIFIED · TERRACREST " />
            <div>
              <p className="font-display text-lg italic leading-snug text-ivory">“{listing.localityNote}”</p>
              <p className="label mt-3 text-ivory-faint">
                {listing.verification.by} · {listing.verification.on}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <ParcelMap area={listing.publicArea} exact={unlocked ? listing.sealed?.coords : undefined} />
          </div>

          <Specs listing={listing} />
          <Comps listing={listing} />
          <RiskScorecard risk={risk} />
        </motion.div>

        {/* ---------- the sealed dossier ---------- */}
        <motion.div variants={rise}>
          <div className="sticky top-24">
            <div className="relative overflow-hidden border border-line bg-ink-raise/50 p-7 shadow-deep">
              {/* watermark on unlock */}
              {unlocked && user && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="mono -rotate-45 select-none whitespace-nowrap text-[0.7rem] tracking-widest text-ivory-faint/20">
                    CONFIDENTIAL · {user.username.toUpperCase()} · {TODAY}
                  </span>
                </div>
              )}

              <div className="relative flex items-center justify-between">
                <p className="label text-ivory-faint">Sealed dossier</p>
                {unlocked ? (
                  <span className="label text-emerald-bright">● Unlocked</span>
                ) : (
                  <span className="label text-ivory-faint">◆ NDA required</span>
                )}
              </div>

              <dl className="relative mt-5">
                {sealedFields.map((f) => (
                  <SealedField key={f.label} label={f.label} value={f.value} unlocked={unlocked} />
                ))}
              </dl>

              {/* document vault */}
              <div className="relative mt-5 border-t border-line pt-5">
                <p className="label text-ivory-faint">Document vault</p>
                <div className="mt-3 space-y-2">
                  {VAULT_CATEGORIES.map((cat) => (
                    <VaultRow
                      key={cat.kind}
                      name={cat.name}
                      unlocked={unlocked}
                      doc={docs.find((d) => d.kind === cat.kind)}
                      onOpen={openDoc}
                    />
                  ))}
                </div>
              </div>

              {/* action */}
              <div className="relative mt-7">
                {unlocked ? (
                  <div className="space-y-3">
                    <p className="text-[0.82rem] leading-relaxed text-ivory-faint">
                      NDA on file — witnessed by Adv. Meera Krishnan. Every view and download is watermarked and logged.
                    </p>
                    {listing.vertical === 'joint-development' && (
                      <Link
                        to={`/studio/${listing.id}`}
                        className="label group flex items-center justify-center gap-3 bg-gold py-4 text-ink transition-colors hover:bg-gold-bright"
                      >
                        Open Feasibility Studio
                        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                      </Link>
                    )}
                    <button
                      onClick={() => setUnlocked(false)}
                      className="label w-full border border-line py-3 text-ivory-faint transition-colors hover:text-ivory"
                    >
                      ⟲ Re-seal (demo)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[0.82rem] leading-relaxed text-ivory-faint">
                      Full location, ownership and the document vault unseal only after a physical NDA is signed before
                      our lawyer and logged by the desk.
                    </p>
                    <button disabled className="label w-full cursor-not-allowed border border-line py-3.5 text-ivory-faint opacity-50">
                      Request Unlock · NDA required
                    </button>
                    <button
                      onClick={unlock}
                      disabled={unlocking}
                      className="label group flex w-full items-center justify-center gap-3 border border-[color:var(--line-gold)] py-3.5 text-gold transition-colors duration-500 hover:bg-gold hover:text-ink disabled:opacity-50"
                    >
                      {unlocking ? 'Desk logging NDA…' : '▶ Simulate executed NDA (demo)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {unlocked && <DealRoom currentUserId={user?.id} msgs={msgs} onSend={sendMessage} sending={sending} />}
    </AppShell>
  )
}

function RiskScorecard({ risk }: { risk: RiskScore | null }) {
  if (!risk) return null
  const gradeColor = risk.grade === 'A' ? 'text-emerald-bright' : risk.grade === 'B' ? 'text-gold' : 'text-oxblood-bright'
  return (
    <div className="mt-10 border-t border-line pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="label text-gold">Risk Scorecard</p>
          <p className="mt-1.5 text-[0.82rem] text-ivory-faint">Transparent and rules-based — every point is an auditable factor, not a black box.</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="mono text-3xl text-ivory">{risk.overall}</span>
          <span className={`font-display text-3xl ${gradeColor}`}>{risk.grade}</span>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {risk.bands.map((b) => (
          <div key={b.key}>
            <div className="flex items-center justify-between">
              <span className="text-[0.9rem] text-ivory-dim">{b.label}</span>
              <span className="mono text-sm text-ivory">{b.score}</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-[color:var(--line)]">
              <div className="h-full bg-gold" style={{ width: `${b.score}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {b.factors.map((f, i) => (
                <span
                  key={i}
                  className={`mono border border-[color:var(--line-strong)] px-1.5 py-0.5 text-[0.66rem] ${f.delta >= 0 ? 'text-emerald-bright' : 'text-oxblood-bright'}`}
                >
                  {f.delta >= 0 ? '+' : ''}
                  {f.delta} {f.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DealRoom({
  currentUserId,
  msgs,
  onSend,
  sending,
}: {
  currentUserId?: string
  msgs: Message[]
  onSend: (body: string) => void
  sending: boolean
}) {
  const [draft, setDraft] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim()) {
      onSend(draft.trim())
      setDraft('')
    }
  }
  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-3xl text-ivory">Deal Room</h2>
        <span className="label text-ivory-faint">logged · admin-visible</span>
      </div>
      <p className="mt-2 text-sm text-ivory-faint">Correspondence with the counterparty — not real-time. Every message is logged; the platform stays the principal.</p>
      <div className="mt-6 max-w-3xl space-y-4">
        {msgs.length === 0 && <p className="text-sm text-ivory-faint">No messages yet — start the conversation below.</p>}
        {msgs.map((m) => {
          const mine = m.authorId === currentUserId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] border px-4 py-3 ${mine ? 'border-[color:var(--line-gold)] bg-gold/10' : 'border-line bg-ink-raise/50'}`}>
                <div className="label text-ivory-faint">
                  {m.authorName.split('·')[0].trim()} · {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ivory">{m.body}</p>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={submit} className="mt-6 flex max-w-3xl gap-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          className="mono flex-1 border border-line bg-ink px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory-faint focus:border-[color:var(--line-gold)]"
        />
        <button type="submit" disabled={sending || !draft.trim()} className="label bg-gold px-6 py-3 text-ink transition-colors hover:bg-gold-bright disabled:opacity-50">
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </section>
  )
}

/* -------- the unseal: cover unmounts on unlock (correct in every environment) -------- */
function SealedField({ label, value, unlocked }: { label: string; value: string; unlocked: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
      <dt className="label shrink-0 text-ivory-faint">{label}</dt>
      <dd className="relative min-h-[1.35em] flex-1 text-right text-[0.92rem] text-ivory">
        <span>{value}</span>
        {!unlocked && (
          <span
            aria-label="Redacted"
            className="redaction absolute right-0 top-0 flex h-full items-center justify-end px-1"
            style={{ minWidth: '10ch' }}
          >
            {value}
          </span>
        )}
      </dd>
    </div>
  )
}

function VaultRow({ name, unlocked, doc, onOpen }: { name: string; unlocked: boolean; doc?: Document; onOpen: (doc: Document) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[0.86rem] text-ivory-dim">{name}</span>
      {unlocked && doc ? (
        <button onClick={() => onOpen(doc)} className="label text-gold transition-colors hover:text-gold-bright">
          View ↓
        </button>
      ) : (
        <span className="label text-ivory-faint">● Sealed</span>
      )}
    </div>
  )
}

function Specs({ listing }: { listing: Listing }) {
  const rows: [string, string][] = []
  if (listing.jd) {
    rows.push(
      ['Approved FSI', listing.jd.fsi.toFixed(2)],
      ['Approvals', listing.jd.approval],
      ['Road width', `${listing.jd.roadWidthFt} ft frontage`],
      ['Suggested JD model', listing.jd.suggestedModel],
      ['Timeline', `${listing.jd.timelineMonths} months`],
    )
  } else if (listing.warehouse) {
    rows.push(
      ['Clear height', `${listing.warehouse.clearHeightM} m`],
      ['Dock doors', String(listing.warehouse.docks)],
      ['Power', `${listing.warehouse.powerKw} kW · 3-phase`],
      ['Floor load', `${listing.warehouse.floorLoadTonM2} t/m²`],
      ['Lease type', listing.warehouse.leaseType],
    )
  } else if (listing.bigLand) {
    rows.push(
      ['Soil', listing.bigLand.soil],
      ['Water table', listing.bigLand.waterTable],
      ['Disputes', listing.bigLand.disputes],
      ['Horizon', `${listing.bigLand.horizonYears} years`],
      ['Appreciation', listing.bigLand.appreciationNote],
    )
  }
  return (
    <div className="mt-8">
      <p className="label text-gold">Development potential</p>
      <dl className="mt-4 divide-y divide-[color:var(--line)] border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 py-3">
            <dt className="label text-ivory-faint">{k}</dt>
            <dd className="text-right text-[0.92rem] text-ivory">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Comps({ listing }: { listing: Listing }) {
  return (
    <div className="mt-8">
      <p className="label text-gold">Comparable sales — admin-maintained</p>
      <div className="mt-4 overflow-hidden border border-line">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-ink-raise/40">
              {['Project', 'Distance', 'Rate', 'Year'].map((h) => (
                <th key={h} className="label px-4 py-3 text-ivory-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listing.comps.map((c) => (
              <tr key={c.project} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-sm text-ivory">
                  {c.project}
                  <span className="mt-0.5 block text-[0.72rem] text-ivory-faint">{c.note}</span>
                </td>
                <td className="mono px-4 py-3 text-sm text-ivory-dim">{c.distanceKm} km</td>
                <td className="mono px-4 py-3 text-sm text-ivory">₹{c.psf.toLocaleString('en-IN')}/sq ft</td>
                <td className="mono px-4 py-3 text-sm text-ivory-dim">{c.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BackNav() {
  return (
    <Link to="/app" className="label text-ivory-faint transition-colors hover:text-ivory">
      ← Discovery
    </Link>
  )
}
