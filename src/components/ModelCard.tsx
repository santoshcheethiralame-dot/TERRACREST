import type { ModelCard as ModelCardData } from '@/domain/types'

/* The valuation model, laid bare — metrics, corpus provenance, and the learned
   feature importances. This is the transparency piece: nothing is a black box. */
export function ModelCard({ card, onRetrain, busy }: { card: ModelCardData; onRetrain?: () => void; busy?: boolean }) {
  const top = card.importances.slice(0, 8)
  const max = Math.max(...top.map((i) => i.weight), 1e-6)
  const when = fmt(card.trainedAt)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="label text-accent">Valuation Model</p>
          <p className="mono mt-1 text-[0.72rem] text-ivory-dim">{card.modelType}</p>
        </div>
        {onRetrain && (
          <button onClick={onRetrain} disabled={busy} className="label border border-[color:var(--line-accent)] px-4 py-2 text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50">
            {busy ? 'Retraining…' : 'Retrain'}
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden border border-line bg-[color:var(--line)]">
        <Stat k="R² (holdout)" v={card.metrics.r2.toFixed(2)} />
        <Stat k="Mean error" v={`${card.metrics.maePct.toFixed(1)}%`} />
        <Stat k="Corpus" v={String(card.nExamples)} sub={`${card.nReal} real · ${card.nSynthetic} synth`} />
      </div>

      <p className="label mt-6 text-ivory-faint">What the model learned drives value</p>
      <div className="mt-3 space-y-2.5">
        {top.map((f) => {
          const up = f.direction === 'raises'
          return (
            <div key={f.feature} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-[0.82rem] text-ivory-dim">{f.label}</span>
              <div className="relative h-2 flex-1 bg-[color:var(--line)]">
                <div className={`absolute inset-y-0 left-0 ${up ? 'bg-emerald-bright' : 'bg-accent'}`} style={{ width: `${(f.weight / max) * 100}%` }} />
              </div>
              <span className={`mono w-14 shrink-0 text-right text-[0.7rem] ${up ? 'text-emerald-bright' : 'text-accent'}`}>{up ? '↑' : '↓'} {f.weight.toFixed(3)}</span>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-[0.8rem] leading-relaxed text-ivory-faint">{card.provenance}</p>
      <p className="mono mt-3 text-[0.68rem] text-ivory-faint">Target: {card.target} · trained {when}</p>
    </div>
  )
}

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-ink-card p-4">
      <p className="label text-ivory-faint">{k}</p>
      <p className="mono mt-1.5 text-xl text-ivory">{v}</p>
      {sub && <p className="mono mt-0.5 text-[0.68rem] text-ivory-faint">{sub}</p>}
    </div>
  )
}

function fmt(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
