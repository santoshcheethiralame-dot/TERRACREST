import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { ActivityEvent, ActivityKind, ArchitectReview, Deal, Listing, ListingStatus, ModelCard as ModelCardData, PriceBook, Role, User, Vertical } from '@/domain/types'
import { DEAL_STAGE_KEY, ROLE_KEY, STATUS_KEY, VERTICAL_KEY } from '@/i18n/translations'
import { useLang } from '@/i18n/LanguageContext'
import { repo } from '@/data/repository'
import { AppShell } from '@/components/AppShell'
import { ModelCard } from '@/components/ModelCard'

type Tab = 'listings' | 'new' | 'users' | 'pipeline' | 'prices' | 'architect' | 'model' | 'activity'

const ACTIVITY_SEEN_KEY = 'tc_admin_activity_seen'

const STATUS_FLOW: ListingStatus[] = ['draft', 'documents-uploaded', 'under-review', 'verified', 'live', 'under-offer', 'closed']

export function AdminDashboard() {
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>('listings')
  const [users, setUsers] = useState<User[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [reviews, setReviews] = useState<ArchitectReview[]>([])
  const [seenAt, setSeenAt] = useState<string>(() => localStorage.getItem(ACTIVITY_SEEN_KEY) ?? '')
  const [loading, setLoading] = useState(true)

  const TABS: { key: Tab; label: string }[] = [
    { key: 'listings', label: t('admin.tabListings') },
    { key: 'new', label: t('admin.tabNewParcel') },
    { key: 'users', label: t('admin.tabAccounts') },
    { key: 'pipeline', label: t('admin.tabPipeline') },
    { key: 'prices', label: t('admin.tabPrices') },
    { key: 'architect', label: t('admin.tabArchitect') },
    { key: 'model', label: t('admin.tabModel') },
    { key: 'activity', label: t('admin.tabActivity') },
  ]

  const reload = async () => {
    const [u, l, d, a, r] = await Promise.all([
      repo.adminListUsers(),
      repo.adminListListings(),
      repo.adminListDeals(),
      repo.adminActivity(),
      repo.adminArchitectReviews(),
    ])
    setUsers(u)
    setListings(l)
    setDeals(d)
    setActivity(a)
    setReviews(r)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  const unreadActivity = activity.filter((e) => e.createdAt > seenAt).length

  const openTab = (key: Tab) => {
    setTab(key)
    if (key === 'activity' && activity.length) {
      const newest = activity[0].createdAt
      setSeenAt(newest)
      localStorage.setItem(ACTIVITY_SEEN_KEY, newest)
    }
  }

  const pendingReviews = reviews.filter((r) => r.status === 'requested').length
  const counts: Record<Tab, number> = { listings: listings.length, users: users.length, pipeline: deals.length, new: 0, prices: 0, architect: reviews.length, model: 0, activity: activity.length }

  return (
    <AppShell>
      <header>
        <p className="label text-accent">{t('admin.eyebrow')}</p>
        <h1 className="mt-4 font-display text-5xl text-ink md:text-6xl">{t('admin.headline')}</h1>
        <p className="mt-4 max-w-2xl text-ink-dim">{t('admin.body')}</p>
      </header>

      <nav className="mt-10 flex flex-wrap gap-2 border-b border-line">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            onClick={() => openTab(tb.key)}
            className={`label -mb-px border-b-2 px-4 py-3 transition-colors ${
              tab === tb.key ? 'border-accent text-accent' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            {tb.label}
            {tb.key === 'activity' ? (
              unreadActivity > 0 && <NotifyBadge n={unreadActivity} />
            ) : tb.key === 'architect' ? (
              pendingReviews > 0 && <NotifyBadge n={pendingReviews} />
            ) : tb.key !== 'new' && tb.key !== 'prices' && tb.key !== 'model' ? (
              <span className="ml-1 text-ink-faint">{counts[tb.key]}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {loading ? (
          <p className="label animate-pulse py-16 text-center text-ink-faint">{t('admin.loadingDesk')}</p>
        ) : tab === 'listings' ? (
          <ListingsTab listings={listings} onChanged={reload} />
        ) : tab === 'users' ? (
          <UsersTab users={users} onCreated={reload} />
        ) : tab === 'new' ? (
          <NewParcelTab owners={users.filter((u) => u.role === 'landowner')} onCreated={reload} />
        ) : tab === 'prices' ? (
          <PricesTab />
        ) : tab === 'architect' ? (
          <ArchitectTab reviews={reviews} listings={listings} onDelivered={reload} />
        ) : tab === 'model' ? (
          <ModelTab />
        ) : tab === 'activity' ? (
          <ActivityTab events={activity} listings={listings} />
        ) : (
          <PipelineTab deals={deals} listings={listings} />
        )}
      </div>
    </AppShell>
  )
}

/* ------------------------------------------------------------- listings */
function ListingsTab({ listings, onChanged }: { listings: Listing[]; onChanged: () => void }) {
  const { t } = useLang()
  const change = async (id: string, status: ListingStatus) => {
    await repo.adminSetStatus(id, status)
    onChanged()
  }
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-line bg-paper-raise/40">
            {[t('admin.colParcel'), t('admin.colVertical'), t('admin.colLocality'), t('admin.colStatus')].map((h) => (
              <th key={h} className="label px-5 py-3.5 text-ink-faint">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b border-line last:border-0">
              <td className="px-5 py-4">
                <div className="mono text-[0.72rem] text-ink-dim">{l.id}</div>
                <div className="text-sm text-ink">{l.headline}</div>
              </td>
              <td className="px-5 py-4 text-sm text-ink-dim">{t(VERTICAL_KEY[l.vertical])}</td>
              <td className="px-5 py-4 text-sm text-ink-faint">{l.localityLabel}</td>
              <td className="px-5 py-4">
                <Select
                  value={l.status}
                  onChange={(v) => change(l.id, v as ListingStatus)}
                  options={STATUS_FLOW.map((s) => ({ value: s, label: t(STATUS_KEY[s]) }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------------------------------------- users */
function UsersTab({ users, onCreated }: { users: User[]; onCreated: () => void }) {
  const { t } = useLang()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<Role>('builder')
  const [office, setOffice] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [actionNote, setActionNote] = useState<string | null>(null)

  const resetPw = async (u: User) => {
    const r = await repo.adminResetPassword(u.id)
    setActionNote(t('admin.tempPasswordFor').replace('{username}', u.username).replace('{password}', r.tempPassword))
  }
  const toggleActive = async (u: User) => {
    await repo.adminSetActive(u.id, u.active === false)
    const status = u.active === false ? t('admin.reactivated') : t('admin.deactivatedWord')
    setActionNote(t('admin.memberStatusChanged').replace('{username}', u.username).replace('{status}', status))
    onCreated()
  }
  const toggleKyc = async (u: User) => {
    await repo.adminSetKyc(u.id, !u.kycVerified)
    onCreated()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !displayName.trim()) return
    setBusy(true)
    setMsg(null)
    try {
      await repo.adminCreateUser({ username: username.trim(), displayName: displayName.trim(), role, officeLocation: office.trim() || undefined })
      setMsg(t('admin.accountCreated').replace('{username}', username.trim().toLowerCase()))
      setUsername('')
      setDisplayName('')
      setOffice('')
      onCreated()
    } catch {
      setMsg(t('admin.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {actionNote && (
        <div className="mb-6 border border-[color:var(--line-accent)] bg-accent/5 px-5 py-3">
          <span className="mono text-sm text-accent">{actionNote}</span>
        </div>
      )}
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper-raise/40">
              {[t('admin.colMember'), t('admin.colRole'), t('admin.colKyc'), t('admin.colActions')].map((h) => (
                <th key={h} className="label px-5 py-3.5 text-ink-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`border-b border-line last:border-0 ${u.active === false ? 'opacity-45' : ''}`}>
                <td className="px-5 py-4">
                  <div className="text-sm text-ink">{u.displayName}</div>
                  <div className="mono text-[0.72rem] text-ink-faint">{u.username}</div>
                </td>
                <td className="px-5 py-4"><span className="label text-accent">{t(ROLE_KEY[u.role])}</span></td>
                <td className="px-5 py-4">{u.kycVerified ? <span className="label text-emerald-bright">● {t('admin.verified')}</span> : <span className="label text-ink-faint">{t('admin.pending')}</span>}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <button onClick={() => resetPw(u)} className="label text-accent transition-colors hover:text-accent-bright">{t('admin.resetPw')}</button>
                    <button onClick={() => toggleKyc(u)} className="label text-ink-faint transition-colors hover:text-ink">{t('admin.kyc')}</button>
                    <button onClick={() => toggleActive(u)} className="label text-ink-faint transition-colors hover:text-ink">
                      {u.active === false ? t('admin.activate') : t('admin.deactivate')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="border border-line bg-paper-raise/40 p-7">
        <p className="label text-accent">{t('admin.createAccount')}</p>
        <p className="mt-3 text-sm text-ink-dim">{t('admin.createAccountDesc')}</p>
        <div className="mt-6 space-y-5">
          <Field label={t('admin.username')}><Input value={username} onChange={setUsername} placeholder="builder_new_009" /></Field>
          <Field label={t('admin.displayName')}><Input value={displayName} onChange={setDisplayName} placeholder="Name · Firm" /></Field>
          <Field label={t('admin.role')}>
            <Select value={role} onChange={(v) => setRole(v as Role)} options={[
              { value: 'builder', label: t('role.builder') },
              { value: 'landowner', label: t('role.landowner') },
              { value: 'investor', label: t('role.investor') },
              { value: 'business_owner', label: t('role.businessOwner') },
              { value: 'admin', label: t('role.admin') },
            ]} />
          </Field>
          <Field label={t('admin.officeOptional')}><Input value={office} onChange={setOffice} placeholder="Koramangala, Bengaluru" /></Field>
        </div>
        <button type="submit" disabled={busy} className="label mt-7 w-full bg-accent py-3.5 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? t('admin.creating') : t('admin.createAccount')}
        </button>
        {msg && <p className="mt-5 text-[0.85rem] leading-snug text-emerald-bright">{msg}</p>}
      </form>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- pipeline */
function PipelineTab({ deals, listings }: { deals: Deal[]; listings: Listing[] }) {
  const { t } = useLang()
  const stages: Deal['stage'][] = ['new-lead', 'engaged', 'site-visit', 'term-sheet', 'closed']
  const label = (id: string) => listings.find((l) => l.id === id)?.headline ?? id
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stages.map((s) => {
        const col = deals.filter((d) => d.stage === s)
        return (
          <div key={s} className="border border-line bg-paper-raise/30">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="label text-ink-dim">{t(DEAL_STAGE_KEY[s])}</span>
              <span className="mono text-[0.72rem] text-ink-faint">{col.length}</span>
            </div>
            <div className="space-y-3 p-3">
              {col.length === 0 ? (
                <p className="px-1 py-4 text-center text-[0.72rem] text-ink-faint/60">—</p>
              ) : (
                col.map((d) => (
                  <div key={d.id} className="border border-line bg-paper p-3">
                    <div className="text-[0.82rem] leading-snug text-ink">{label(d.listingId)}</div>
                    <div className="mono mt-2 text-[0.72rem] text-accent">₹{(d.estCommission / 1e5).toFixed(1)} L {t('admin.pipelineEstCommission')}</div>
                    <div className="label mt-1 text-ink-faint">{t('admin.rmPrefix')} {d.rm}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------ new parcel */
function NewParcelTab({ owners, onCreated }: { owners: User[]; onCreated: () => void }) {
  const { t } = useLang()
  const [f, setF] = useState({
    id: 'JD-BLR-2026-020',
    vertical: 'joint-development',
    headline: '',
    localityLabel: '',
    areaLabel: '',
    landAreaSqft: '',
    zoning: 'Residential (BDA) · high-rise permissible',
    localityNote: '',
    ownerId: owners[0]?.id ?? '',
    guidanceLow: '',
    guidanceHigh: '',
    areaLat: '13.20',
    areaLng: '77.70',
    areaRadiusKm: '3',
    address: '',
    ownerName: '',
    surveyNos: '',
    contact: '+91 ••••• •••••',
    exactLat: '13.20',
    exactLng: '77.70',
    plotAreaSqft: '',
    fsi: '2.25',
    floors: '14',
    towers: '4',
    avgUnitSqft: '1400',
    baseSalePsf: '8000',
  })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await repo.adminCreateListing({
        id: f.id.trim(),
        vertical: f.vertical as Vertical,
        headline: f.headline,
        localityLabel: f.localityLabel,
        areaLabel: f.areaLabel,
        landAreaSqft: Number(f.landAreaSqft),
        zoning: f.zoning,
        localityNote: f.localityNote,
        ownerId: f.ownerId,
        guidanceLow: Number(f.guidanceLow),
        guidanceHigh: Number(f.guidanceHigh),
        areaLat: Number(f.areaLat),
        areaLng: Number(f.areaLng),
        areaRadiusKm: Number(f.areaRadiusKm),
        address: f.address,
        ownerName: f.ownerName,
        surveyNos: f.surveyNos,
        contact: f.contact,
        exactLat: Number(f.exactLat),
        exactLng: Number(f.exactLng),
        plotAreaSqft: Number(f.plotAreaSqft),
        fsi: Number(f.fsi),
        floors: Number(f.floors),
        towers: Number(f.towers),
        avgUnitSqft: Number(f.avgUnitSqft),
        baseSalePsf: Number(f.baseSalePsf),
      })
      setMsg({ ok: true, text: t('admin.parcelCreated').replace('{id}', f.id.trim()) })
      onCreated()
    } catch {
      setMsg({ ok: false, text: t('admin.parcelCreateFailed') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-4xl">
      <Section title={t('admin.newParcelBasics')}>
        <Field label={t('admin.parcelId')}><Input value={f.id} onChange={(v) => set('id', v)} placeholder="JD-BLR-2026-020" /></Field>
        <Field label={t('admin.vertical')}>
          <Select value={f.vertical} onChange={(v) => set('vertical', v)} options={[
            { value: 'joint-development', label: t('vertical.jointDevelopment') },
            { value: 'warehouse', label: t('vertical.warehouse') },
            { value: 'big-land', label: t('vertical.bigLand') },
          ]} />
        </Field>
        <Field label={t('admin.owner')}>
          <Select value={f.ownerId} onChange={(v) => set('ownerId', v)} options={owners.map((o) => ({ value: o.id, label: o.displayName.split('·')[0].trim() }))} />
        </Field>
        <Field label={t('admin.headlineField')}><Input value={f.headline} onChange={(v) => set('headline', v)} placeholder="North-corridor JD parcel…" /></Field>
        <Field label={t('admin.localityMasked')}><Input value={f.localityLabel} onChange={(v) => set('localityLabel', v)} placeholder="Sector 4, Devanahalli · Bengaluru N." /></Field>
        <Field label={t('admin.areaLabel')}><Input value={f.areaLabel} onChange={(v) => set('areaLabel', v)} placeholder="≈ 2.4 acres" /></Field>
        <Field label={t('admin.landArea')}><Input value={f.landAreaSqft} onChange={(v) => set('landAreaSqft', v)} placeholder="104444" /></Field>
        <Field label={t('admin.zoning')}><Input value={f.zoning} onChange={(v) => set('zoning', v)} /></Field>
        <Field label={t('admin.guidanceLow')}><Input value={f.guidanceLow} onChange={(v) => set('guidanceLow', v)} placeholder="85" /></Field>
        <Field label={t('admin.guidanceHigh')}><Input value={f.guidanceHigh} onChange={(v) => set('guidanceHigh', v)} placeholder="95" /></Field>
      </Section>

      <label className="mt-5 block">
        <span className="label text-ink-faint">{t('admin.localityNote')}</span>
        <div className="mt-2"><Input value={f.localityNote} onChange={(v) => set('localityNote', v)} placeholder="Personally inspected on…" /></div>
      </label>

      <Section title={t('admin.publicMapSection')}>
        <Field label={t('admin.areaLat')}><Input value={f.areaLat} onChange={(v) => set('areaLat', v)} /></Field>
        <Field label={t('admin.areaLng')}><Input value={f.areaLng} onChange={(v) => set('areaLng', v)} /></Field>
        <Field label={t('admin.radiusKm')}><Input value={f.areaRadiusKm} onChange={(v) => set('areaRadiusKm', v)} /></Field>
      </Section>

      <Section title={t('admin.fullDetailSection')}>
        <Field label={t('admin.exactAddress')}><Input value={f.address} onChange={(v) => set('address', v)} /></Field>
        <Field label={t('admin.ownerOfRecord')}><Input value={f.ownerName} onChange={(v) => set('ownerName', v)} /></Field>
        <Field label={t('admin.surveyNos')}><Input value={f.surveyNos} onChange={(v) => set('surveyNos', v)} placeholder="141/2B, 141/3" /></Field>
        <Field label={t('admin.contact')}><Input value={f.contact} onChange={(v) => set('contact', v)} /></Field>
        <Field label={t('admin.exactLat')}><Input value={f.exactLat} onChange={(v) => set('exactLat', v)} /></Field>
        <Field label={t('admin.exactLng')}><Input value={f.exactLng} onChange={(v) => set('exactLng', v)} /></Field>
      </Section>

      <Section title={t('admin.feasibilitySection')}>
        <Field label={t('admin.plotArea')}><Input value={f.plotAreaSqft} onChange={(v) => set('plotAreaSqft', v)} placeholder="104444" /></Field>
        <Field label="FSI"><Input value={f.fsi} onChange={(v) => set('fsi', v)} /></Field>
        <Field label={t('admin.floorsField')}><Input value={f.floors} onChange={(v) => set('floors', v)} /></Field>
        <Field label={t('admin.towersField')}><Input value={f.towers} onChange={(v) => set('towers', v)} /></Field>
        <Field label={t('admin.avgUnit')}><Input value={f.avgUnitSqft} onChange={(v) => set('avgUnitSqft', v)} /></Field>
        <Field label={t('admin.salePrice')}><Input value={f.baseSalePsf} onChange={(v) => set('baseSalePsf', v)} /></Field>
      </Section>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="label bg-accent px-8 py-3.5 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? t('admin.creating') : t('admin.createParcel')}
        </button>
        {msg && <span className={`text-[0.85rem] ${msg.ok ? 'text-emerald-bright' : 'text-oxblood-bright'}`}>{msg.text}</span>}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 border-t border-line pt-6">
      <p className="label mb-5 text-accent">{title}</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

/* --------------------------------------------------------------- badges */
function NotifyBadge({ n }: { n: number }) {
  return (
    <span className="ml-1.5 inline-flex min-w-[1.15rem] justify-center rounded-full bg-oxblood-bright px-1.5 text-[0.7rem] font-semibold leading-[1.15rem] text-paper">
      {n}
    </span>
  )
}

/* ------------------------------------------------------------- architect */
const cr = (rupees: number) => `₹${(rupees / 1e7).toFixed(1)} Cr`

function ArchitectTab({ reviews, listings, onDelivered }: { reviews: ArchitectReview[]; listings: Listing[]; onDelivered: () => void }) {
  const { t } = useLang()
  if (!reviews.length) return <p className="label py-16 text-center text-ink-faint">{t('admin.noArchitectEngagements')}</p>
  const parcel = (id: string) => listings.find((l) => l.id === id)?.headline ?? id
  const pending = reviews.filter((r) => r.status === 'requested')
  const done = reviews.filter((r) => r.status === 'delivered')
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="label text-accent">{t('admin.awaitingDesk')}{pending.length ? ` · ${pending.length}` : ''}</p>
        <p className="mt-2 text-sm text-ink-faint">{t('admin.recordArchitectDesc')}</p>
        {pending.length === 0 ? (
          <p className="mt-5 text-sm text-ink-dim">{t('admin.nothingAwaiting')}</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pending.map((r) => (
              <DeliverCard key={r.id} review={r} parcel={parcel(r.listingId)} onDelivered={onDelivered} />
            ))}
          </div>
        )}
      </div>
      {done.length > 0 && (
        <div>
          <p className="label text-ink-faint">{t('admin.delivered')}</p>
          <div className="mt-5 space-y-4">
            {done.map((r) => (
              <DeliveredCard key={r.id} review={r} parcel={parcel(r.listingId)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DeliverCard({ review, parcel, onDelivered }: { review: ArchitectReview; parcel: string; onDelivered: () => void }) {
  const { t } = useLang()
  const [name, setName] = useState('')
  const [gdvCr, setGdvCr] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !gdvCr) return
    setBusy(true)
    try {
      await repo.adminDeliverArchitectReview(review.id, {
        architectName: name.trim(),
        architectGdv: Math.round(Number(gdvCr) * 1e7),
        architectNotes: notes.trim(),
      })
      onDelivered()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-ink">{parcel}</p>
        <span className="mono text-xs text-ink-faint">{review.builderName}</span>
      </div>
      <p className="mono mt-2 text-xs text-ink-faint">
        {t('admin.studioEstimate')}: {cr(review.mlSnapshot.baseNet)} · {review.mlSnapshot.units} {t('admin.units')} · {t('admin.commissioned')} {fmtWhen(review.requestedAt)}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label={t('admin.architectNameField')}>
          <Input value={name} onChange={setName} />
        </Field>
        <Field label={t('admin.validatedGdv')}>
          <Input value={gdvCr} onChange={setGdvCr} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label={t('admin.architectsNoteField')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]"
          />
        </Field>
      </div>
      <button disabled={busy} className="label mt-4 bg-accent px-6 py-3 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
        {busy ? t('admin.recording') : t('admin.deliverValidation')}
      </button>
    </form>
  )
}

function DeliveredCard({ review, parcel }: { review: ArchitectReview; parcel: string }) {
  const { t } = useLang()
  const ml = review.mlSnapshot.baseNet
  const arch = review.architectGdv ?? ml
  const v = ml > 0 ? ((arch - ml) / ml) * 100 : 0
  return (
    <div className="border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-ink">{parcel}</p>
        <span className="mono text-xs text-ink-faint">{review.architectName}</span>
      </div>
      <div className="mono mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <span className="text-ink-dim">{t('admin.studioShort')} {cr(ml)}</span>
        <span className="text-accent">{t('admin.architectShort')} {cr(arch)}</span>
        <span className={v >= 0 ? 'text-emerald-bright' : 'text-oxblood-bright'}>
          {v >= 0 ? '+' : ''}
          {v.toFixed(1)}%
        </span>
      </div>
      {review.architectNotes && <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-dim">{review.architectNotes}</p>}
    </div>
  )
}

/* ----------------------------------------------------------------- model */
function ModelTab() {
  const { t } = useLang()
  const [card, setCard] = useState<ModelCardData | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    repo.getModelCard().then(setCard)
  }, [])

  const retrain = async () => {
    setBusy(true)
    try {
      setCard(await repo.adminRetrainModel())
    } finally {
      setBusy(false)
    }
  }

  if (!card) return <p className="label animate-pulse py-16 text-center text-ink-faint">{t('admin.loadingModel')}</p>
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ink-faint">{t('admin.modelDesc')}</p>
      <div className="mt-8 border border-line p-6">
        <ModelCard card={card} onRetrain={retrain} busy={busy} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- activity */
const KIND_META: Record<ActivityKind, { labelKey: string; cls: string }> = {
  login: { labelKey: 'activity.login', cls: 'text-ink-dim' },
  access: { labelKey: 'activity.access', cls: 'text-accent' },
  message: { labelKey: 'activity.dealRoom', cls: 'text-emerald-bright' },
  listing_created: { labelKey: 'activity.newParcel', cls: 'text-ink' },
  status_change: { labelKey: 'activity.status', cls: 'text-ink-dim' },
  document: { labelKey: 'activity.document', cls: 'text-oxblood-bright' },
  architect: { labelKey: 'activity.architect', cls: 'text-accent-bright' },
  reservation: { labelKey: 'activity.reservation', cls: 'text-beam' },
}

function fmtWhen(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
}

function ActivityTab({ events, listings }: { events: ActivityEvent[]; listings: Listing[] }) {
  const { t } = useLang()
  if (!events.length) return <p className="label py-16 text-center text-ink-faint">{t('admin.noActivity')}</p>
  const parcel = (id?: string) => (id ? listings.find((l) => l.id === id)?.id ?? id : null)
  return (
    <div className="max-w-3xl">
      <p className="text-sm text-ink-faint">{t('admin.activityDesc')}</p>
      <ol className="mt-8 border-l border-line">
        {events.map((e) => {
          const meta = KIND_META[e.kind] ?? KIND_META.login
          return (
            <li key={e.id} className="relative pb-7 pl-6 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`label rounded-full border border-[color:var(--line-strong)] px-2 py-0.5 text-[0.65rem] ${meta.cls}`}>{t(meta.labelKey)}</span>
                <span className="mono text-xs text-ink-faint">{fmtWhen(e.createdAt)}</span>
                {e.listingId && <span className="mono text-xs text-ink-faint">· {parcel(e.listingId)}</span>}
              </div>
              <p className="mt-2 text-sm text-ink">{e.summary}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------------------------------------------------------- prices */
const RATE_CATS: [string, string][] = [
  ['flooring', 'rate.flooring'],
  ['sanitary', 'rate.sanitary'],
  ['kitchen', 'rate.kitchen'],
  ['windows', 'rate.windows'],
  ['lift', 'rate.lift'],
  ['facade', 'rate.facade'],
]
const RATE_TIERS: [string, string][] = [
  ['budget', 'tier.budget'],
  ['mid', 'tier.mid'],
  ['premium', 'tier.premium'],
  ['luxury', 'tier.luxury'],
]

function PricesTab() {
  const { t } = useLang()
  const [pb, setPb] = useState<PriceBook | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    repo.getPriceBook().then(setPb)
  }, [])

  if (!pb) return <p className="label animate-pulse py-10 text-center text-ink-faint">{t('admin.loadingRates')}</p>

  const setRate = (key: string, v: string) => setPb({ ...pb, rates: { ...pb.rates, [key]: Number(v) || 0 } })
  const save = async () => {
    setBusy(true)
    setMsg(null)
    await repo.adminUpdatePriceBook(pb)
    setBusy(false)
    setMsg(t('admin.ratesSaved'))
  }

  return (
    <div className="max-w-4xl">
      <p className="text-sm text-ink-faint">{t('admin.pricesDesc')}</p>
      <div className="mt-6 max-w-xs">
        <Field label={t('admin.baseBuild')}>
          <Input value={String(pb.baseBuildPsf)} onChange={(v) => setPb({ ...pb, baseBuildPsf: Number(v) || 0 })} />
        </Field>
      </div>
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper-raise/40">
              <th className="label px-4 py-3 text-ink-faint">{t('admin.finishRate')}</th>
              {RATE_TIERS.map(([key, labelKey]) => (
                <th key={key} className="label px-4 py-3 text-ink-faint">{t(labelKey)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_CATS.map(([key, labelKey]) => (
              <tr key={key} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-sm text-ink">{t(labelKey)}</td>
                {RATE_TIERS.map(([tierKey]) => (
                  <td key={tierKey} className="px-4 py-2">
                    <input
                      value={pb.rates[`${key}:${tierKey}`] ?? ''}
                      onChange={(e) => setRate(`${key}:${tierKey}`, e.target.value)}
                      className="mono w-20 border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button onClick={save} disabled={busy} className="label bg-accent px-8 py-3.5 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? t('admin.saving') : t('admin.saveRates')}
        </button>
        {msg && <span className="text-[0.85rem] text-emerald-bright">{msg}</span>}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- inputs */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label text-ink-faint">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="mono w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-[color:var(--line-accent)]"
    />
  )
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mono w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
