import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Deal, Listing, ListingStatus, Nda, Role, User } from '@/domain/types'
import { DEAL_STAGE_LABEL, STATUS_LABEL, VERTICAL_LABEL } from '@/domain/types'
import { repo } from '@/data/repository'
import { AppShell } from '@/components/AppShell'

type Tab = 'ndas' | 'listings' | 'users' | 'pipeline'

const TABS: { key: Tab; label: string }[] = [
  { key: 'ndas', label: 'NDA Desk' },
  { key: 'listings', label: 'Listings' },
  { key: 'users', label: 'Accounts' },
  { key: 'pipeline', label: 'Pipeline' },
]

const STATUS_FLOW: ListingStatus[] = ['draft', 'documents-uploaded', 'under-review', 'verified', 'live', 'under-offer', 'closed']

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('ndas')
  const [users, setUsers] = useState<User[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [ndas, setNdas] = useState<Nda[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    const [u, l, n, d] = await Promise.all([
      repo.adminListUsers(),
      repo.adminListListings(),
      repo.adminListNdas(),
      repo.adminListDeals(),
    ])
    setUsers(u)
    setListings(l)
    setNdas(n)
    setDeals(d)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  const counts: Record<Tab, number> = { ndas: ndas.length, listings: listings.length, users: users.length, pipeline: deals.length }

  return (
    <AppShell>
      <header>
        <p className="label text-gold">Operations Centre</p>
        <h1 className="mt-4 font-display text-5xl text-ivory md:text-6xl">The desk.</h1>
        <p className="mt-4 max-w-2xl text-ivory-dim">Create accounts after offline KYC, verify parcels before they go live, and log the witnessed NDAs that unseal them.</p>
      </header>

      <nav className="mt-10 flex flex-wrap gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`label -mb-px border-b-2 px-4 py-3 transition-colors ${
              tab === t.key ? 'border-gold text-gold' : 'border-transparent text-ivory-faint hover:text-ivory'
            }`}
          >
            {t.label} <span className="ml-1 text-ivory-faint">{counts[t.key]}</span>
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
        <p className="label text-gold">Log a witnessed NDA</p>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">This is the gate. Once logged, the builder’s view of the parcel unseals — exact location, ownership and the document vault.</p>
        <div className="mt-6 space-y-5">
          <Field label="Builder">
            <Select value={builderId} onChange={setBuilderId} placeholder="Select builder…" options={builders.map((b) => ({ value: b.id, label: b.displayName.split('·')[0].trim() }))} />
          </Field>
          <Field label="Parcel">
            <Select value={listingId} onChange={setListingId} placeholder="Select parcel…" options={listings.map((l) => ({ value: l.id, label: `${l.id} — ${l.headline}` }))} />
          </Field>
        </div>
        <button type="submit" disabled={busy || !builderId || !listingId} className="label mt-7 w-full bg-gold py-3.5 text-ink transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50">
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
    <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[480px] text-left">
          <thead>
            <tr className="border-b border-line bg-ink-raise/40">
              {['Member', 'Role', 'KYC'].map((h) => (
                <th key={h} className="label px-5 py-3.5 text-ivory-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-5 py-4">
                  <div className="text-sm text-ivory">{u.displayName}</div>
                  <div className="mono text-[0.72rem] text-ivory-faint">{u.username}</div>
                </td>
                <td className="px-5 py-4"><span className="label text-gold">{u.role}</span></td>
                <td className="px-5 py-4">{u.kycVerified ? <span className="label text-emerald-bright">● Verified</span> : <span className="label text-ivory-faint">Pending</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="border border-line bg-ink-raise/40 p-7">
        <p className="label text-gold">Create account</p>
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
        <button type="submit" disabled={busy} className="label mt-7 w-full bg-gold py-3.5 text-ink transition-colors hover:bg-gold-bright disabled:opacity-50">
          {busy ? 'Creating…' : 'Create account'}
        </button>
        {msg && <p className="mt-5 text-[0.85rem] leading-snug text-emerald-bright">{msg}</p>}
      </form>
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
                    <div className="mono mt-2 text-[0.72rem] text-gold">₹{(d.estCommission / 1e5).toFixed(1)} L est.</div>
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
      className="mono w-full border border-line bg-ink px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory-faint focus:border-[color:var(--line-gold)]"
    />
  )
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mono w-full border border-line bg-ink px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-[color:var(--line-gold)]"
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
