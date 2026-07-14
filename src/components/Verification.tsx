import { useEffect, useState, type FormEvent } from 'react'
import type { DocumentSummary, LawyerVerification } from '@/domain/types'
import { repo } from '@/data/repository'
import { useLang } from '@/i18n/LanguageContext'

/* Diligence panels shown on a listing: the desk's plain-language title/document
   summary and the empanelled advocate's legal verification. Both are recorded
   by a person on the desk — deliberately not dressed up as automated output. */
export function VerificationSection({ listingId, isAdmin }: { listingId: string; isAdmin: boolean }) {
  const { t } = useLang()
  const [lawyer, setLawyer] = useState<LawyerVerification | null | undefined>(undefined)
  const [doc, setDoc] = useState<DocumentSummary | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    repo.getLawyerVerification(listingId).then((v) => alive && setLawyer(v))
    repo.getDocumentSummary(listingId).then((d) => alive && setDoc(d))
    return () => {
      alive = false
    }
  }, [listingId])

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="font-display text-3xl text-ink">{t('verify.heading')}</h2>
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <DocumentSummaryPanel summary={doc} />
        <LawyerPanel lv={lawyer} />
      </div>

      {isAdmin && doc !== undefined && lawyer !== undefined && (
        <div className="mt-10 border-t border-line pt-8">
          <p className="label text-accent">{t('verify.deskEntry')}</p>
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <DocSummaryForm listingId={listingId} current={doc} onSaved={setDoc} />
            <LawyerForm listingId={listingId} current={lawyer} onSaved={setLawyer} />
          </div>
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------ read panels */
function DocumentSummaryPanel({ summary }: { summary?: DocumentSummary | null }) {
  const { t } = useLang()
  if (summary === undefined) return <PanelLoading />
  const rows: [string, string][] = summary
    ? [
        [t('verify.ownershipChain'), summary.ownershipChain],
        [t('verify.encumbrance'), summary.ecSummary],
        [t('verify.taxHistory'), summary.taxHistory],
        [t('verify.katha'), summary.kathaDetails],
      ]
    : []
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="label text-accent">{t('verify.docTitle')}</p>
          <p className="mt-1 text-sm text-ink-faint">{t('verify.docSubtitle')}</p>
        </div>
        {summary && <span className="label shrink-0 text-emerald-bright">● {t('verify.deskReviewed')}</span>}
      </div>
      {summary ? (
        <div className="mt-5 space-y-3">
          {rows.map(([label, content]) =>
            content ? (
              <div key={label} className="border border-line bg-paper-raise/40 p-4">
                <p className="label text-accent">{label}</p>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink">{content}</p>
              </div>
            ) : null,
          )}
          <p className="mono text-[0.7rem] text-ink-faint">{summary.preparedBy} · {fmtDate(summary.updatedAt)}</p>
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink-faint">{t('verify.noSummary')}</p>
      )}
    </div>
  )
}

function LawyerPanel({ lv }: { lv?: LawyerVerification | null }) {
  const { t } = useLang()
  if (lv === undefined) return <PanelLoading />
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="label text-accent">{t('verify.legalTitle')}</p>
          <p className="mt-1 text-sm text-ink-faint">{t('verify.legalSubtitle')}</p>
        </div>
        {lv && (
          <span className={`label shrink-0 ${lv.verified ? 'text-emerald-bright' : 'text-oxblood-bright'}`}>
            {lv.verified ? `● ${t('verify.verified')}` : `✕ ${t('verify.issuesFound')}`}
          </span>
        )}
      </div>
      {lv ? (
        <div className="mt-5 border border-line bg-paper-raise/40 p-5">
          <dl className="divide-y divide-[color:var(--line)]">
            <Row k={t('verify.advocate')} v={lv.lawyerName} />
            <Row k={t('verify.barCouncil')} v={lv.barCouncilNo} mono />
            <Row k={t('verify.date')} v={fmtDate(lv.verificationDate)} mono />
            <div className="py-3">
              <dt className="label text-ink-faint">{t('verify.remarks')}</dt>
              <dd className="mt-2 text-[0.88rem] leading-relaxed text-ink">{lv.remarks}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink-faint">{t('verify.noLegal')}</p>
      )}
    </div>
  )
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="label shrink-0 text-ink-faint">{k}</dt>
      <dd className={`text-right text-sm text-ink ${mono ? 'mono' : ''}`}>{v}</dd>
    </div>
  )
}

function PanelLoading() {
  const { t } = useLang()
  return <p className="label animate-pulse py-8 text-center text-ink-faint">{t('verify.loading')}</p>
}

/* -------------------------------------------------------------- admin forms */
function DocSummaryForm({ listingId, current, onSaved }: { listingId: string; current: DocumentSummary | null; onSaved: (d: DocumentSummary) => void }) {
  const { t } = useLang()
  const [ownership, setOwnership] = useState(current?.ownershipChain ?? '')
  const [ec, setEc] = useState(current?.ecSummary ?? '')
  const [tax, setTax] = useState(current?.taxHistory ?? '')
  const [katha, setKatha] = useState(current?.kathaDetails ?? '')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setSaved(false)
    const rec = await repo.adminSaveDocumentSummary(listingId, { ownershipChain: ownership.trim(), ecSummary: ec.trim(), taxHistory: tax.trim(), kathaDetails: katha.trim() })
    onSaved(rec)
    setBusy(false)
    setSaved(true)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="label text-ink-faint">{t('verify.docTitle')}</p>
      <Area label={t('verify.ownershipChain')} value={ownership} onChange={setOwnership} />
      <Area label={t('verify.encumbrance')} value={ec} onChange={setEc} />
      <Area label={t('verify.taxHistory')} value={tax} onChange={setTax} />
      <Area label={t('verify.katha')} value={katha} onChange={setKatha} />
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="label bg-accent px-6 py-3 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? t('verify.saving') : t('verify.saveDoc')}
        </button>
        {saved && <span className="label text-emerald-bright">{t('verify.saved')}</span>}
      </div>
    </form>
  )
}

function LawyerForm({ listingId, current, onSaved }: { listingId: string; current: LawyerVerification | null; onSaved: (v: LawyerVerification) => void }) {
  const { t } = useLang()
  const [name, setName] = useState(current?.lawyerName ?? '')
  const [barNo, setBarNo] = useState(current?.barCouncilNo ?? '')
  const [date, setDate] = useState(current?.verificationDate ?? new Date().toISOString().slice(0, 10))
  const [remarks, setRemarks] = useState(current?.remarks ?? '')
  const [verified, setVerified] = useState(current?.verified ?? true)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !barNo.trim()) return
    setBusy(true)
    setSaved(false)
    const rec = await repo.adminSaveLawyerVerification(listingId, { lawyerName: name.trim(), barCouncilNo: barNo.trim(), verificationDate: date, remarks: remarks.trim(), verified })
    onSaved(rec)
    setBusy(false)
    setSaved(true)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="label text-ink-faint">{t('verify.legalTitle')}</p>
      <Field label={t('verify.advocate')}>
        <Input value={name} onChange={setName} placeholder="Adv. Meera Krishnan" />
      </Field>
      <Field label={t('verify.barCouncil')}>
        <Input value={barNo} onChange={setBarNo} placeholder="KAR/2015/12345" />
      </Field>
      <Field label={t('verify.date')}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mono w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]" />
      </Field>
      <Field label={t('verify.remarks')}>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]" />
      </Field>
      <label className="flex items-center gap-3">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 accent-[color:var(--accent)]" />
        <span className="text-sm text-ink">{t('verify.titleClear')}</span>
      </label>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="label bg-accent px-6 py-3 text-paper transition-colors hover:bg-accent-bright disabled:opacity-50">
          {busy ? t('verify.saving') : t('verify.saveLegal')}
        </button>
        {saved && <span className="label text-emerald-bright">{t('verify.saved')}</span>}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
      className="mono w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-[color:var(--line-accent)]"
    />
  )
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label text-ink-faint">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]" />
    </label>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
