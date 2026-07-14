import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Document, Listing, Message, DealShare, RiskScore } from '@/domain/types'
import { repo } from '@/data/repository'
import { useAuth } from '@/auth/AuthContext'
import { useLang } from '@/i18n/LanguageContext'
import { VERTICAL_KEY, STATUS_KEY } from '@/i18n/translations'
import { AppShell } from '@/components/AppShell'
import { Seal } from '@/components/Seal'
import { ParcelMap } from '@/components/ParcelMap'
import { OcrScanner } from '@/components/OcrScanner'
import { VerificationSection } from '@/components/Verification'
import { rise, stagger } from '@/lib/motion'

const TODAY = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const VAULT_CATEGORIES = [
  { kind: 'deed', key: 'vault.titleDeed' },
  { kind: 'certificate', key: 'vault.encumbrance' },
  { kind: 'survey', key: 'vault.survey' },
  { kind: 'receipt', key: 'vault.tax' },
]

export function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLang()
  const [listing, setListing] = useState<Listing | null | undefined>(undefined)
  const [docs, setDocs] = useState<Document[]>([])
  const [msgs, setMsgs] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [risk, setRisk] = useState<RiskScore | null>(null)

  useEffect(() => {
    let alive = true
    repo.getListing(id ?? '').then((l) => alive && setListing(l ?? null))
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    if (!listing) {
      setDocs([])
      return
    }
    let alive = true
    repo.getDocuments(listing.id).then((d) => alive && setDocs(d))
    return () => {
      alive = false
    }
  }, [listing])

  useEffect(() => {
    if (!listing) {
      setMsgs([])
      return
    }
    let alive = true
    repo.getMessages(listing.id).then((m) => alive && setMsgs(m))
    return () => {
      alive = false
    }
  }, [listing])

  // Risk reads only public parcel attributes — safe to load as soon as the parcel does.
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
      { label: t('listing.exactLocation'), value: s?.address ?? '' },
      { label: t('listing.gps'), value: s ? `${s.coords.lat.toFixed(4)}°N, ${s.coords.lng.toFixed(4)}°E` : '' },
      { label: t('listing.ownerOfRecord'), value: s?.ownerName ?? '' },
      { label: t('listing.surveyNumbers'), value: s?.surveyNos.join(', ') ?? '' },
      { label: t('listing.contactHistory'), value: s?.contact ?? '' },
    ]
  }, [listing, t])

  if (listing === undefined) {
    return (
      <AppShell>
        <p className="label animate-pulse py-20 text-center text-ink-faint">{t('listing.retrieving')}</p>
      </AppShell>
    )
  }
  if (listing === null) {
    return (
      <AppShell nav={<BackNav />}>
        <div className="py-24 text-center">
          <h1 className="font-display text-4xl text-ink">{t('listing.notFound')}</h1>
          <Link to="/app" className="label mt-6 inline-block text-accent">
            ← {t('listing.backToDiscovery')}
          </Link>
        </div>
      </AppShell>
    )
  }

  const openDoc = async (doc: Document) => {
    const url = await repo.documentUrl(listing.id, doc.id)
    window.open(url, '_blank', 'noopener')
  }

  const sendMessage = async (body: string, opts?: { meetingTime?: string; dealShare?: DealShare }) => {
    setSending(true)
    const m = await repo.postMessage(listing.id, body, opts)
    setSending(false)
    setMsgs((prev) => [...prev, m])
  }

  return (
    <AppShell nav={<BackNav />}>
      <motion.div variants={stagger(0.08, 0.08)} initial="hidden" animate="show" className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ---------- overview ---------- */}
        <motion.div variants={rise}>
          <div className="flex items-center gap-3">
            <span className="mono text-[0.72rem] text-ink-dim">{listing.id}</span>
            <span className="text-ink-faint">·</span>
            <span className="label text-accent">{t(VERTICAL_KEY[listing.vertical])}</span>
            <span className="text-ink-faint">·</span>
            <span className="label text-ink-faint">{t(STATUS_KEY[listing.status])}</span>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-tight text-ink md:text-5xl">{listing.headline}</h1>
          <p className="mt-4 text-lg text-ink-dim">{listing.localityLabel}</p>

          <div className="mt-8 flex items-start gap-5 border-y border-line py-6">
            <Seal size={58} text={t('listing.verifiedSeal')} />
            <div>
              <p className="border-l-2 border-[color:var(--line-accent)] pl-4 text-[0.98rem] leading-relaxed text-ink">“{listing.localityNote}”</p>
              <p className="label mt-3 text-ink-faint">
                {listing.verification.by} · {listing.verification.on}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <ParcelMap area={listing.publicArea} exact={listing.sealed.coords} />
          </div>

          <Specs listing={listing} />
          <Comps listing={listing} />
          <RiskScorecard risk={risk} />
        </motion.div>

        {/* ---------- the dossier ---------- */}
        <motion.div variants={rise}>
          <div className="sticky top-24">
            <div className="relative overflow-hidden border border-line bg-paper-raise/50 p-7 shadow-deep">
              {/* watermark — every view is traceable to the member who saw it */}
              {user && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="mono -rotate-45 select-none whitespace-nowrap text-[0.7rem] tracking-widest text-ink-faint/20">
                    CONFIDENTIAL · {user.username.toUpperCase()} · {TODAY}
                  </span>
                </div>
              )}

              <div className="relative flex items-center justify-between">
                <p className="label text-ink-faint">{t('listing.fullDossier')}</p>
                <span className="label text-emerald-bright">● {t('nav.memberAccess')}</span>
              </div>

              <dl className="relative mt-5">
                {sealedFields.map((f) => (
                  <DossierField key={f.label} label={f.label} value={f.value} />
                ))}
              </dl>

              {/* document vault */}
              <div className="relative mt-5 border-t border-line pt-5">
                <p className="label text-ink-faint">{t('listing.documentVault')}</p>
                <div className="mt-3 space-y-2">
                  {VAULT_CATEGORIES.map((cat) => (
                    <VaultRow key={cat.kind} name={t(cat.key)} doc={docs.find((d) => d.kind === cat.kind)} onOpen={openDoc} />
                  ))}
                </div>
                <OcrScanner className="mt-4" />
              </div>

              {/* action */}
              <div className="relative mt-7 space-y-3">
                <p className="text-[0.82rem] leading-relaxed text-ink-faint">{t('listing.watermarkNotice')}</p>
                {listing.vertical === 'joint-development' && (
                  <Link
                    to={`/studio/${listing.id}`}
                    className="label group flex items-center justify-center gap-3 bg-accent py-4 text-paper transition-colors hover:bg-accent-bright"
                  >
                    {t('listing.openStudio')}
                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <VerificationSection listingId={listing.id} isAdmin={user?.role === 'admin'} />

      <DealRoom currentUserId={user?.id} currentUserRole={user?.role} msgs={msgs} onSend={sendMessage} sending={sending} />
    </AppShell>
  )
}

function RiskScorecard({ risk }: { risk: RiskScore | null }) {
  const { t } = useLang()
  if (!risk) return null
  const gradeColor = risk.grade === 'A' ? 'text-emerald-bright' : risk.grade === 'B' ? 'text-accent' : 'text-oxblood-bright'
  return (
    <div className="mt-10 border-t border-line pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="label text-accent">{t('listing.riskScorecard')}</p>
          <p className="mt-1.5 text-[0.82rem] text-ink-faint">{t('listing.riskDesc')}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="mono text-3xl text-ink">{risk.overall}</span>
          <span className={`font-display text-3xl ${gradeColor}`}>{risk.grade}</span>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {risk.bands.map((b) => (
          <div key={b.key}>
            <div className="flex items-center justify-between">
              <span className="text-[0.9rem] text-ink-dim">{b.label}</span>
              <span className="mono text-sm text-ink">{b.score}</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-[color:var(--line)]">
              <div className="h-full bg-accent" style={{ width: `${b.score}%` }} />
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
  currentUserRole,
  msgs,
  onSend,
  sending,
}: {
  currentUserId?: string
  currentUserRole?: string
  msgs: Message[]
  onSend: (body: string, opts?: { meetingTime?: string; dealShare?: DealShare }) => void
  sending: boolean
}) {
  const { t } = useLang()
  const [draft, setDraft] = useState('')
  const [showMeeting, setShowMeeting] = useState(false)
  const [meetingTime, setMeetingTime] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [sharePct, setSharePct] = useState(60)

  const isAdmin = currentUserRole === 'admin'
  const isPrincipal = currentUserRole === 'builder' || currentUserRole === 'investor' || currentUserRole === 'landowner'

  const reset = () => {
    setDraft('')
    setMeetingTime('')
    setShowMeeting(false)
    setShowShare(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (showShare) {
      onSend(text || t('dealRoom.shareNote'), { dealShare: { builderPct: sharePct, landownerPct: 100 - sharePct } })
      reset()
    } else if (showMeeting) {
      if (!text || !meetingTime) return
      onSend(text, { meetingTime })
      reset()
    } else if (text) {
      onSend(text)
      reset()
    }
  }

  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-3xl text-ink">{t('listing.dealRoom')}</h2>
        <span className="label text-ink-faint">{t('listing.dealRoomTag')}</span>
      </div>
      <p className="mt-2 text-sm text-ink-faint">{t('listing.dealRoomDesc')}</p>
      <div className="mt-6 max-w-3xl space-y-4">
        {msgs.length === 0 && <p className="text-sm text-ink-faint">{t('listing.noMessages')}</p>}
        {msgs.map((m) => {
          const mine = m.authorId === currentUserId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] border px-4 py-3 ${mine ? 'border-[color:var(--line-accent)] bg-accent/10' : 'border-line bg-paper-raise/50'}`}>
                <div className="label text-ink-faint">
                  {m.authorName.split('·')[0].trim()} · {new Date(m.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                {m.meetingTime ? (
                  <MeetingBlock time={m.meetingTime} link={m.body} />
                ) : (
                  <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink">{m.body}</p>
                )}
                {m.dealShare && <DealShareCard share={m.dealShare} />}
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={submit} className="mt-6 max-w-3xl space-y-3">
        {(isAdmin || isPrincipal) && (
          <div className="flex flex-wrap gap-5">
            {isAdmin && (
              <button type="button" onClick={() => { setShowMeeting((v) => !v); setShowShare(false) }} className="label text-accent transition-colors hover:text-accent-bright">
                + {showMeeting ? t('dealRoom.cancelMeeting') : t('dealRoom.scheduleMeeting')}
              </button>
            )}
            {isPrincipal && (
              <button type="button" onClick={() => { setShowShare((v) => !v); setShowMeeting(false) }} className="label text-accent transition-colors hover:text-accent-bright">
                + {showShare ? t('dealRoom.cancelShare') : t('dealRoom.proposeShare')}
              </button>
            )}
          </div>
        )}

        {showMeeting && (
          <div className="flex flex-wrap items-center gap-3 border border-[color:var(--line-accent)] bg-accent/5 p-3">
            <span className="label text-accent">{t('dealRoom.meetingTime')}</span>
            <input
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="mono border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-[color:var(--line-accent)]"
            />
          </div>
        )}

        {showShare && (
          <div className="flex flex-col items-center gap-8 border border-[color:var(--line-accent)] bg-accent/5 p-6 md:flex-row md:justify-center">
            <SharePie pct={sharePct} onChange={setSharePct} />
            <div className="flex flex-col gap-4">
              <ShareInput label={t('role.builder')} color="var(--accent)" value={sharePct} onChange={setSharePct} />
              <ShareInput label={t('role.landowner')} color="var(--gold)" value={100 - sharePct} onChange={(v) => setSharePct(100 - v)} />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={showMeeting ? t('dealRoom.pasteMeetingLink') : t('listing.writeMessage')}
            className="mono flex-1 border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-[color:var(--line-accent)]"
          />
          <button
            type="submit"
            disabled={sending || (showMeeting ? !draft.trim() || !meetingTime : showShare ? false : !draft.trim())}
            className="label bg-accent px-6 py-3 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50"
          >
            {sending ? '…' : t('listing.send')}
          </button>
        </div>
      </form>
    </section>
  )
}

function SharePie({ pct, onChange }: { pct: number; onChange: (v: number) => void }) {
  const { t } = useLang()
  const drag = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const set = (ev: MouseEvent | React.MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = ev.clientX - r.left - r.width / 2
      const y = ev.clientY - r.top - r.height / 2
      let a = Math.atan2(y, x) * (180 / Math.PI) + 90
      if (a < 0) a += 360
      onChange(Math.max(0, Math.min(100, Math.round((a / 360) * 100))))
    }
    set(e)
    const move = (ev: MouseEvent) => set(ev)
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }
  return (
    <div
      onMouseDown={drag}
      className="relative h-44 w-44 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-paper-raise"
      style={{ background: `conic-gradient(var(--accent) ${pct}%, var(--gold) 0)` }}
    >
      <div className="pointer-events-none absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-paper">
        <span className="font-display text-2xl font-semibold text-ink">{pct}:{100 - pct}</span>
        <span className="label mt-1 text-ink-faint">{t('dealRoom.dragToTune')}</span>
      </div>
    </div>
  )
}

function ShareInput({ label, color, value, onChange }: { label: string; color: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <span className="label mb-1.5 flex items-center gap-2 text-ink-dim">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} /> {label}
      </span>
      <div className="flex items-center border border-line bg-paper focus-within:border-[color:var(--line-accent)]">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            onChange(Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0)
          }}
          className="w-20 bg-transparent py-2 text-center font-display text-xl text-ink outline-none"
        />
        <span className="pr-3 text-ink-dim">%</span>
      </div>
    </div>
  )
}

function DealShareCard({ share }: { share: DealShare }) {
  const { t } = useLang()
  return (
    <div className="mt-3 flex items-center gap-4 border border-[color:var(--line-accent)] bg-paper-raise/40 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full" style={{ background: `conic-gradient(var(--accent) ${share.builderPct}%, var(--gold) 0)` }}>
        <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-paper">
          <span className="font-display text-xs font-semibold text-ink">{share.builderPct}:{share.landownerPct}</span>
        </div>
      </div>
      <div>
        <p className="label text-ink-faint">{t('dealRoom.proposedShare')}</p>
        <ul className="mt-1.5 space-y-1 text-xs text-ink">
          <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-accent" /> {t('role.builder')} · {share.builderPct}%</li>
          <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--gold)' }} /> {t('role.landowner')} · {share.landownerPct}%</li>
        </ul>
      </div>
    </div>
  )
}

function MeetingBlock({ time, link }: { time: string; link: string }) {
  const { t } = useLang()
  const when = new Date(time)
  const label = isNaN(when.getTime()) ? time : when.toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const isUrl = /^https?:\/\//i.test(link.trim())
  return (
    <div className="mt-1.5">
      <p className="mono text-[0.82rem] text-beam">📅 {t('dealRoom.meetingScheduled')} · {label}</p>
      {isUrl ? (
        <a href={link.trim()} target="_blank" rel="noopener noreferrer" className="label mt-1.5 inline-block text-accent transition-colors hover:text-accent-bright">
          {t('dealRoom.joinMeeting')} →
        </a>
      ) : (
        <p className="mt-1 text-[0.92rem] text-ink">{link}</p>
      )}
    </div>
  )
}

function DossierField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
      <dt className="label shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-right text-[0.92rem] text-ink">{value}</dd>
    </div>
  )
}

function VaultRow({ name, doc, onOpen }: { name: string; doc?: Document; onOpen: (doc: Document) => void }) {
  const { t } = useLang()
  return (
    <div className="flex items-center justify-between">
      <span className="text-[0.86rem] text-ink-dim">{name}</span>
      {doc ? (
        <button onClick={() => onOpen(doc)} className="label text-accent transition-colors hover:text-accent-bright">
          {t('listing.vaultView')} ↓
        </button>
      ) : (
        <span className="label text-ink-faint">—</span>
      )}
    </div>
  )
}

function Specs({ listing }: { listing: Listing }) {
  const { t } = useLang()
  const rows: [string, string][] = []
  if (listing.jd) {
    rows.push(
      [t('spec.approvedFsi'), listing.jd.fsi.toFixed(2)],
      [t('spec.approvals'), listing.jd.approval],
      [t('spec.roadWidth'), `${listing.jd.roadWidthFt} ${t('unit.ftFrontage')}`],
      [t('spec.suggestedJdModel'), listing.jd.suggestedModel],
      [t('spec.timeline'), `${listing.jd.timelineMonths} ${t('unit.months')}`],
    )
  } else if (listing.warehouse) {
    rows.push(
      [t('spec.clearHeight'), `${listing.warehouse.clearHeightM} m`],
      [t('spec.dockDoors'), String(listing.warehouse.docks)],
      [t('spec.power'), `${listing.warehouse.powerKw} kW · ${t('unit.threePhase')}`],
      [t('spec.floorLoad'), `${listing.warehouse.floorLoadTonM2} t/m²`],
      [t('spec.leaseType'), listing.warehouse.leaseType],
    )
  } else if (listing.bigLand) {
    rows.push(
      [t('spec.soil'), listing.bigLand.soil],
      [t('spec.waterTable'), listing.bigLand.waterTable],
      [t('spec.disputes'), listing.bigLand.disputes],
      [t('spec.horizon'), `${listing.bigLand.horizonYears} ${t('unit.years')}`],
      [t('spec.appreciation'), listing.bigLand.appreciationNote],
    )
  }
  return (
    <div className="mt-8">
      <p className="label text-accent">{t('listing.developmentPotential')}</p>
      <dl className="mt-4 divide-y divide-[color:var(--line)] border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 py-3">
            <dt className="label text-ink-faint">{k}</dt>
            <dd className="text-right text-[0.92rem] text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Comps({ listing }: { listing: Listing }) {
  const { t } = useLang()
  const heads = [t('comps.project'), t('comps.distance'), t('comps.rate'), t('comps.year')]
  return (
    <div className="mt-8">
      <p className="label text-accent">{t('listing.comparableSales')}</p>
      <div className="mt-4 overflow-hidden border border-line">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-paper-raise/40">
              {heads.map((h) => (
                <th key={h} className="label px-4 py-3 text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listing.comps.map((c) => (
              <tr key={c.project} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-sm text-ink">
                  {c.project}
                  <span className="mt-0.5 block text-[0.72rem] text-ink-faint">{c.note}</span>
                </td>
                <td className="mono px-4 py-3 text-sm text-ink-dim">{c.distanceKm} km</td>
                <td className="mono px-4 py-3 text-sm text-ink">₹{c.psf.toLocaleString('en-IN')}/sq ft</td>
                <td className="mono px-4 py-3 text-sm text-ink-dim">{c.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BackNav() {
  const { t } = useLang()
  return (
    <Link to="/app" className="label text-ink-faint transition-colors hover:text-ink">
      ← {t('nav.discovery')}
    </Link>
  )
}
