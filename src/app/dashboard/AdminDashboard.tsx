import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { ActivityEvent, ActivityKind, ArchitectReview, Deal, Listing, ListingStatus, ModelCard as ModelCardData, Nda, PriceBook, Role, User, Vertical } from '@/domain/types'
import { DEAL_STAGE_LABEL, STATUS_LABEL, VERTICAL_LABEL } from '@/domain/types'
import { repo } from '@/data/repository'
import { AppShell } from '@/components/AppShell'
import { ModelCard } from '@/components/ModelCard'

type Tab = 'ndas' | 'listings' | 'new' | 'users' | 'pipeline' | 'prices' | 'architect' | 'model' | 'activity'

const TABS: { key: Tab; label: string }[] = [
  { key: 'ndas', label: 'NDA Desk' },
  { key: 'listings', label: 'Listings' },
  { key: 'new', label: 'New Parcel' },
  { key: 'users', label: 'Accounts' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'prices', label: 'Prices' },
  { key: 'architect', label: 'Architect' },
  { key: 'model', label: 'Model' },
  { key: 'activity', label: 'Activity' },
]

const ACTIVITY_SEEN_KEY = 'tc_admin_activity_seen'

const STATUS_FLOW: ListingStatus[] = ['draft', 'documents-uploaded', 'under-review', 'verified', 'live', 'under-offer', 'closed']

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('ndas')
  const [users, setUsers] = useState<User[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [ndas, setNdas] = useState<Nda[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [reviews, setReviews] = useState<ArchitectReview[]>([])
  const [seenAt, setSeenAt] = useState<string>(() => localStorage.getItem(ACTIVITY_SEEN_KEY) ?? '')
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    const [u, l, n, d, a, r] = await Promise.all([
      repo.adminListUsers(),
      repo.adminListListings(),
      repo.adminListNdas(),
      repo.adminListDeals(),
      repo.adminActivity(),
      repo.adminArchitectReviews(),
    ])
    setUsers(u)
    setListings(l)
    setNdas(n)
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
  const counts: Record<Tab, number> = { ndas: ndas.length, listings: listings.length, users: users.length, pipeline: deals.length, new: 0, prices: 0, architect: reviews.length, model: 0, activity: activity.length }

  return (
    <AppShell>
      <header>
        <p className="label text-accent">Operations Centre</p>
        <h1 className="mt-4 font-display text-5xl text-ivory md:text-6xl">The desk.</h1>
        <p className="mt-4 max-w-2xl text-ivory-dim">Create accounts after offline KYC, verify parcels before they go live, and log the witnessed NDAs that unseal them.</p>
      </header>

      <nav className="mt-10 flex flex-wrap gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => openTab(t.key)}
            className={`label -mb-px border-b-2 px-4 py-3 transition-colors ${
              tab === t.key ? 'border-accent text-accent' : 'border-transparent text-ivory-faint hover:text-ivory'
            }`}
          >
            {t.label}
            {t.key === 'activity' ? (
              unreadActivity > 0 && <NotifyBadge n={unreadActivity} />
            ) : t.key === 'architect' ? (
              pendingReviews > 0 && <NotifyBadge n={pendingReviews} />
            ) : t.key !== 'new' && t.key !== 'prices' && t.key !== 'model' ? (
              <span className="ml-1 text-ivory-faint">{counts[t.key]}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {loading ? (
          <p className="label animate-pulse py-16 text-center text-ivory-faint">Loading the desk…</p>
        ) : tab === 'ndas' ? (
          <NdaDesk users={users} listings={listings} ndas={ndas} onLogged={reload} />
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

/* ------------------------------------------------------------- NDA desk */
function NdaDesk({ users, listings, ndas, onLogged }: { users: User[]; listings: Listing[]; ndas: Nda[]; onLogged: () => void }) {
  const builders = users.filter((u) => u.role === 'builder')
  const [builderId, setBuilderId] = useState('')
  const [listingId, setListingId] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const label = (id: string) => listings.find((l) => l.id === id)?.headline ?? id
  const who = (id: string) => users.find((u) => u.id === id)?.displayName.split('·')[0].trim() ?? id

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!builderId || !listingId) return
    setBusy(true)
    setMsg(null)
    try {
      await repo.adminLogNda(builderId, listingId)
      setMsg(`NDA logged — ${who(builderId)} can now unseal ${label(listingId)}.`)
      onLogged()
    } catch {
      setMsg('Could not log the NDA.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="border border-line bg-ink-raise/40 p-7">
        <p className="label text-accent">Log a witnessed NDA</p>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">This is the gate. Once logged, the builder’s view of the parcel unseals — exact location, ownership and the document vault.</p>
        <div className="mt-6 space-y-5">
          <Field label="Builder">
            <Select value={builderId} onChange={setBuilderId} placeholder="Select builder…" options={builders.map((b) => ({ value: b.id, label: b.displayName.split('·')[0].trim() }))} />
          </Field>
          <Field label="Parcel">
            <Select value={listingId} onChange={setListingId} placeholder="Select parcel…" options={listings.map((l) => ({ value: l.id, label: `${l.id} — ${l.headline}` }))} />
          </Field>
        </div>
        <button type="submit" disabled={busy || !builderId || !listingId} className="label mt-7 w-full bg-accent py-3.5 text-ink transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? 'Logging…' : 'Log executed NDA'}
        </button>
        {msg && <p className="mt-5 text-[0.85rem] leading-snug text-emerald-bright">{msg}</p>}
      </form>

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ivory">NDA register</h2>
          <span className="label text-ivory-faint">{ndas.length} on file</span>
        </div>
        <div className="mt-5 overflow-x-auto border border-line">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-line bg-ink-raise/40">
                {['Parcel', 'Builder', 'Signed'].map((h) => (
                  <th key={h} className="label px-4 py-3 text-ivory-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ndas.map((n) => (
                <tr key={n.id} className="border-b border-line last:border-0">
                  <td className="mono px-4 py-3 text-sm text-ivory">{n.listingId}</td>
                  <td className="px-4 py-3 text-sm text-ivory-dim">{who(n.builderId)}</td>
                  <td className="mono px-4 py-3 text-sm text-ivory-faint">{n.signedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- listings */
function ListingsTab({ listings, onChanged }: { listings: Listing[]; onChanged: () => void }) {
  const change = async (id: string, status: ListingStatus) => {
    await repo.adminSetStatus(id, status)
    onChanged()
  }
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-line bg-ink-raise/40">
            {['Parcel', 'Vertical', 'Locality', 'Status'].map((h) => (
              <th key={h} className="label px-5 py-3.5 text-ivory-faint">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b border-line last:border-0">
              <td className="px-5 py-4">
                <div className="mono text-[0.72rem] text-ivory-dim">{l.id}</div>
                <div className="text-sm text-ivory">{l.headline}</div>
              </td>
              <td className="px-5 py-4 text-sm text-ivory-dim">{VERTICAL_LABEL[l.vertical]}</td>
              <td className="px-5 py-4 text-sm text-ivory-faint">{l.localityLabel}</td>
              <td className="px-5 py-4">
                <Select
                  value={l.status}
                  onChange={(v) => change(l.id, v as ListingStatus)}
                  options={STATUS_FLOW.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
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
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<Role>('builder')
  const [office, setOffice] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [actionNote, setActionNote] = useState<string | null>(null)

  const resetPw = async (u: User) => {
    const r = await repo.adminResetPassword(u.id)
    setActionNote(`Temporary password for ${u.username}: ${r.tempPassword}`)
  }
  const toggleActive = async (u: User) => {
    await repo.adminSetActive(u.id, u.active === false)
    setActionNote(`${u.username} ${u.active === false ? 'reactivated' : 'deactivated'}.`)
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
      setMsg(`Account “${username.trim().toLowerCase()}” created with a temporary password.`)
      setUsername('')
      setDisplayName('')
      setOffice('')
      onCreated()
    } catch {
      setMsg('Could not create — the username may already exist.')
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
            <tr className="border-b border-line bg-ink-raise/40">
              {['Member', 'Role', 'KYC', 'Actions'].map((h) => (
                <th key={h} className="label px-5 py-3.5 text-ivory-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`border-b border-line last:border-0 ${u.active === false ? 'opacity-45' : ''}`}>
                <td className="px-5 py-4">
                  <div className="text-sm text-ivory">{u.displayName}</div>
                  <div className="mono text-[0.72rem] text-ivory-faint">{u.username}</div>
                </td>
                <td className="px-5 py-4"><span className="label text-accent">{u.role}</span></td>
                <td className="px-5 py-4">{u.kycVerified ? <span className="label text-emerald-bright">● Verified</span> : <span className="label text-ivory-faint">Pending</span>}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <button onClick={() => resetPw(u)} className="label text-accent transition-colors hover:text-accent-bright">Reset PW</button>
                    <button onClick={() => toggleKyc(u)} className="label text-ivory-faint transition-colors hover:text-ivory">KYC</button>
                    <button onClick={() => toggleActive(u)} className="label text-ivory-faint transition-colors hover:text-ivory">
                      {u.active === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="border border-line bg-ink-raise/40 p-7">
        <p className="label text-accent">Create account</p>
        <p className="mt-3 text-sm text-ivory-dim">After offline KYC. A temporary password is issued; the member changes it on first login.</p>
        <div className="mt-6 space-y-5">
          <Field label="Username"><Input value={username} onChange={setUsername} placeholder="builder_new_009" /></Field>
          <Field label="Display name"><Input value={displayName} onChange={setDisplayName} placeholder="Name · Firm" /></Field>
          <Field label="Role">
            <Select value={role} onChange={(v) => setRole(v as Role)} options={[
              { value: 'builder', label: 'Builder' },
              { value: 'landowner', label: 'Land Owner' },
              { value: 'investor', label: 'Investor' },
              { value: 'admin', label: 'Admin' },
            ]} />
          </Field>
          <Field label="Office (optional)"><Input value={office} onChange={setOffice} placeholder="Koramangala, Bengaluru" /></Field>
        </div>
        <button type="submit" disabled={busy} className="label mt-7 w-full bg-accent py-3.5 text-ink transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? 'Creating…' : 'Create account'}
        </button>
        {msg && <p className="mt-5 text-[0.85rem] leading-snug text-emerald-bright">{msg}</p>}
      </form>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- pipeline */
function PipelineTab({ deals, listings }: { deals: Deal[]; listings: Listing[] }) {
  const stages: Deal['stage'][] = ['new-lead', 'nda-signed', 'site-visit', 'term-sheet', 'closed']
  const label = (id: string) => listings.find((l) => l.id === id)?.headline ?? id
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stages.map((s) => {
        const col = deals.filter((d) => d.stage === s)
        return (
          <div key={s} className="border border-line bg-ink-raise/30">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="label text-ivory-dim">{DEAL_STAGE_LABEL[s]}</span>
              <span className="mono text-[0.72rem] text-ivory-faint">{col.length}</span>
            </div>
            <div className="space-y-3 p-3">
              {col.length === 0 ? (
                <p className="px-1 py-4 text-center text-[0.72rem] text-ivory-faint/60">—</p>
              ) : (
                col.map((d) => (
                  <div key={d.id} className="border border-line bg-ink p-3">
                    <div className="text-[0.82rem] leading-snug text-ivory">{label(d.listingId)}</div>
                    <div className="mono mt-2 text-[0.72rem] text-accent">₹{(d.estCommission / 1e5).toFixed(1)} L est.</div>
                    <div className="label mt-1 text-ivory-faint">RM {d.rm}</div>
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
      setMsg({ ok: true, text: `Parcel ${f.id.trim()} created (Verified). Publish it to Live from the Listings tab.` })
      onCreated()
    } catch {
      setMsg({ ok: false, text: 'Could not create — check the ID is unique and the numeric fields are filled.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-4xl">
      <Section title="Basics">
        <Field label="Parcel ID"><Input value={f.id} onChange={(v) => set('id', v)} placeholder="JD-BLR-2026-020" /></Field>
        <Field label="Vertical">
          <Select value={f.vertical} onChange={(v) => set('vertical', v)} options={[
            { value: 'joint-development', label: 'Joint Development' },
            { value: 'warehouse', label: 'Warehouse' },
            { value: 'big-land', label: 'Big Land' },
          ]} />
        </Field>
        <Field label="Owner">
          <Select value={f.ownerId} onChange={(v) => set('ownerId', v)} options={owners.map((o) => ({ value: o.id, label: o.displayName.split('·')[0].trim() }))} />
        </Field>
        <Field label="Headline"><Input value={f.headline} onChange={(v) => set('headline', v)} placeholder="North-corridor JD parcel…" /></Field>
        <Field label="Locality (masked)"><Input value={f.localityLabel} onChange={(v) => set('localityLabel', v)} placeholder="Sector 4, Devanahalli · Bengaluru N." /></Field>
        <Field label="Area label"><Input value={f.areaLabel} onChange={(v) => set('areaLabel', v)} placeholder="≈ 2.4 acres" /></Field>
        <Field label="Land area (sq ft)"><Input value={f.landAreaSqft} onChange={(v) => set('landAreaSqft', v)} placeholder="104444" /></Field>
        <Field label="Zoning"><Input value={f.zoning} onChange={(v) => set('zoning', v)} /></Field>
        <Field label="Guidance low (₹ Cr)"><Input value={f.guidanceLow} onChange={(v) => set('guidanceLow', v)} placeholder="85" /></Field>
        <Field label="Guidance high (₹ Cr)"><Input value={f.guidanceHigh} onChange={(v) => set('guidanceHigh', v)} placeholder="95" /></Field>
      </Section>

      <label className="mt-5 block">
        <span className="label text-ivory-faint">Locality note (admin assessment)</span>
        <div className="mt-2"><Input value={f.localityNote} onChange={(v) => set('localityNote', v)} placeholder="Personally inspected on…" /></div>
      </label>

      <Section title="Public map — coarse, shown before NDA">
        <Field label="Area latitude"><Input value={f.areaLat} onChange={(v) => set('areaLat', v)} /></Field>
        <Field label="Area longitude"><Input value={f.areaLng} onChange={(v) => set('areaLng', v)} /></Field>
        <Field label="Radius (km)"><Input value={f.areaRadiusKm} onChange={(v) => set('areaRadiusKm', v)} /></Field>
      </Section>

      <Section title="Sealed — revealed only after NDA">
        <Field label="Exact address"><Input value={f.address} onChange={(v) => set('address', v)} /></Field>
        <Field label="Owner of record"><Input value={f.ownerName} onChange={(v) => set('ownerName', v)} /></Field>
        <Field label="Survey nos (comma-sep)"><Input value={f.surveyNos} onChange={(v) => set('surveyNos', v)} placeholder="141/2B, 141/3" /></Field>
        <Field label="Contact"><Input value={f.contact} onChange={(v) => set('contact', v)} /></Field>
        <Field label="Exact latitude"><Input value={f.exactLat} onChange={(v) => set('exactLat', v)} /></Field>
        <Field label="Exact longitude"><Input value={f.exactLng} onChange={(v) => set('exactLng', v)} /></Field>
      </Section>

      <Section title="Feasibility — drives the Studio">
        <Field label="Plot area (sq ft)"><Input value={f.plotAreaSqft} onChange={(v) => set('plotAreaSqft', v)} placeholder="104444" /></Field>
        <Field label="FSI"><Input value={f.fsi} onChange={(v) => set('fsi', v)} /></Field>
        <Field label="Floors (G+)"><Input value={f.floors} onChange={(v) => set('floors', v)} /></Field>
        <Field label="Towers"><Input value={f.towers} onChange={(v) => set('towers', v)} /></Field>
        <Field label="Avg unit (sq ft)"><Input value={f.avgUnitSqft} onChange={(v) => set('avgUnitSqft', v)} /></Field>
        <Field label="Sale price (₹/sq ft)"><Input value={f.baseSalePsf} onChange={(v) => set('baseSalePsf', v)} /></Field>
      </Section>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="label bg-accent px-8 py-3.5 text-ink transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? 'Creating…' : 'Create parcel'}
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
    <span className="ml-1.5 inline-flex min-w-[1.15rem] justify-center rounded-full bg-oxblood-bright px-1.5 text-[0.7rem] font-semibold leading-[1.15rem] text-ivory">
      {n}
    </span>
  )
}

/* ------------------------------------------------------------- architect */
const cr = (rupees: number) => `₹${(rupees / 1e7).toFixed(1)} Cr`

function ArchitectTab({ reviews, listings, onDelivered }: { reviews: ArchitectReview[]; listings: Listing[]; onDelivered: () => void }) {
  if (!reviews.length) return <p className="label py-16 text-center text-ivory-faint">No architect engagements yet.</p>
  const parcel = (id: string) => listings.find((l) => l.id === id)?.headline ?? id
  const pending = reviews.filter((r) => r.status === 'requested')
  const done = reviews.filter((r) => r.status === 'delivered')
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="label text-accent">Awaiting the desk{pending.length ? ` · ${pending.length}` : ''}</p>
        <p className="mt-2 text-sm text-ivory-faint">Record the empanelled architect's stamped, validated figure. It lands back in the builder's Studio beside the ML estimate.</p>
        {pending.length === 0 ? (
          <p className="mt-5 text-sm text-ivory-dim">Nothing awaiting delivery.</p>
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
          <p className="label text-ivory-faint">Delivered</p>
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
        <p className="text-sm text-ivory">{parcel}</p>
        <span className="mono text-xs text-ivory-faint">{review.builderName}</span>
      </div>
      <p className="mono mt-2 text-xs text-ivory-faint">
        Studio estimate: {cr(review.mlSnapshot.baseNet)} · {review.mlSnapshot.units} units · commissioned {fmtWhen(review.requestedAt)}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Architect (name · CoA reg)">
          <Input value={name} onChange={setName} />
        </Field>
        <Field label="Validated GDV (₹ Cr)">
          <Input value={gdvCr} onChange={setGdvCr} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Architect's note">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition-colors focus:border-[color:var(--line-accent)]"
          />
        </Field>
      </div>
      <button disabled={busy} className="label mt-4 bg-accent px-6 py-3 text-ink transition-colors hover:bg-accent-bright disabled:opacity-50">
        {busy ? 'Recording…' : 'Deliver validation'}
      </button>
    </form>
  )
}

function DeliveredCard({ review, parcel }: { review: ArchitectReview; parcel: string }) {
  const ml = review.mlSnapshot.baseNet
  const arch = review.architectGdv ?? ml
  const v = ml > 0 ? ((arch - ml) / ml) * 100 : 0
  return (
    <div className="border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-ivory">{parcel}</p>
        <span className="mono text-xs text-ivory-faint">{review.architectName}</span>
      </div>
      <div className="mono mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <span className="text-ivory-dim">Studio {cr(ml)}</span>
        <span className="text-accent">Architect {cr(arch)}</span>
        <span className={v >= 0 ? 'text-emerald-bright' : 'text-oxblood-bright'}>
          {v >= 0 ? '+' : ''}
          {v.toFixed(1)}%
        </span>
      </div>
      {review.architectNotes && <p className="mt-3 text-[0.85rem] leading-relaxed text-ivory-dim">{review.architectNotes}</p>}
    </div>
  )
}

/* ----------------------------------------------------------------- model */
function ModelTab() {
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

  if (!card) return <p className="label animate-pulse py-16 text-center text-ivory-faint">Loading the model…</p>
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ivory-faint">
        The valuation model behind the Studio. Every architect delivery is a labelled example — retrain to fold the latest deliveries into the corpus and watch the numbers move.
      </p>
      <div className="mt-8 border border-line p-6">
        <ModelCard card={card} onRetrain={retrain} busy={busy} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- activity */
const KIND_META: Record<ActivityKind, { label: string; cls: string }> = {
  login: { label: 'Login', cls: 'text-ivory-dim' },
  nda: { label: 'NDA', cls: 'text-accent' },
  message: { label: 'Deal Room', cls: 'text-emerald-bright' },
  listing_created: { label: 'New Parcel', cls: 'text-ivory' },
  status_change: { label: 'Status', cls: 'text-ivory-dim' },
  document: { label: 'Document', cls: 'text-oxblood-bright' },
  architect: { label: 'Architect', cls: 'text-accent-bright' },
}

function fmtWhen(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
}

function ActivityTab({ events, listings }: { events: ActivityEvent[]; listings: Listing[] }) {
  if (!events.length) return <p className="label py-16 text-center text-ivory-faint">No activity recorded yet.</p>
  const parcel = (id?: string) => (id ? listings.find((l) => l.id === id)?.id ?? id : null)
  return (
    <div className="max-w-3xl">
      <p className="text-sm text-ivory-faint">
        Append-only audit trail. Every sign-in, NDA unlock, document view and Deal Room message is recorded here — nothing on this feed is editable.
      </p>
      <ol className="mt-8 border-l border-line">
        {events.map((e) => {
          const meta = KIND_META[e.kind] ?? KIND_META.login
          return (
            <li key={e.id} className="relative pb-7 pl-6 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-ink" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`label rounded-full border border-[color:var(--line-strong)] px-2 py-0.5 text-[0.65rem] ${meta.cls}`}>{meta.label}</span>
                <span className="mono text-xs text-ivory-faint">{fmtWhen(e.createdAt)}</span>
                {e.listingId && <span className="mono text-xs text-ivory-faint">· {parcel(e.listingId)}</span>}
              </div>
              <p className="mt-2 text-sm text-ivory">{e.summary}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------------------------------------------------------- prices */
const RATE_CATS: [string, string][] = [
  ['flooring', 'Flooring'],
  ['sanitary', 'Sanitaryware'],
  ['kitchen', 'Kitchen'],
  ['windows', 'Windows'],
  ['lift', 'Lifts'],
  ['facade', 'Façade'],
]
const RATE_TIERS = ['budget', 'mid', 'premium', 'luxury']

function PricesTab() {
  const [pb, setPb] = useState<PriceBook | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    repo.getPriceBook().then(setPb)
  }, [])

  if (!pb) return <p className="label animate-pulse py-10 text-center text-ivory-faint">Loading rates…</p>

  const setRate = (key: string, v: string) => setPb({ ...pb, rates: { ...pb.rates, [key]: Number(v) || 0 } })
  const save = async () => {
    setBusy(true)
    setMsg(null)
    await repo.adminUpdatePriceBook(pb)
    setBusy(false)
    setMsg('Rates saved — the Feasibility Studio now prices against these.')
  }

  return (
    <div className="max-w-4xl">
      <p className="text-sm text-ivory-faint">Monthly Bangalore rates. The Studio reads these live — change one and every builder's GDV recomputes.</p>
      <div className="mt-6 max-w-xs">
        <Field label="Base build ₹/sq ft (structure + MEP)">
          <Input value={String(pb.baseBuildPsf)} onChange={(v) => setPb({ ...pb, baseBuildPsf: Number(v) || 0 })} />
        </Field>
      </div>
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-line bg-ink-raise/40">
              <th className="label px-4 py-3 text-ivory-faint">Finish · ₹/sq ft</th>
              {RATE_TIERS.map((t) => (
                <th key={t} className="label px-4 py-3 text-ivory-faint">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_CATS.map(([key, name]) => (
              <tr key={key} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-sm text-ivory">{name}</td>
                {RATE_TIERS.map((t) => (
                  <td key={t} className="px-4 py-2">
                    <input
                      value={pb.rates[`${key}:${t}`] ?? ''}
                      onChange={(e) => setRate(`${key}:${t}`, e.target.value)}
                      className="mono w-20 border border-line bg-ink px-2 py-1.5 text-sm text-ivory outline-none transition-colors focus:border-[color:var(--line-accent)]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button onClick={save} disabled={busy} className="label bg-accent px-8 py-3.5 text-ink transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? 'Saving…' : 'Save rates'}
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
      <span className="label text-ivory-faint">{label}</span>
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
      className="mono w-full border border-line bg-ink px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory-faint focus:border-[color:var(--line-accent)]"
    />
  )
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mono w-full border border-line bg-ink px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-[color:var(--line-accent)]"
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
