import { Link } from 'react-router-dom'
import type { Listing } from '@/domain/types'
import { VERTICAL_LABEL, STATUS_LABEL } from '@/domain/types'

export function ListingCard({ listing, unlocked }: { listing: Listing; unlocked: boolean }) {
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group relative flex flex-col border border-line bg-ink-raise/40 p-6 transition-colors duration-300 hover:border-[color:var(--line-accent)]"
    >
      <div className="flex items-center justify-between">
        <span className="mono text-[0.72rem] text-ivory-dim">{listing.id}</span>
        {unlocked ? (
          <span className="label text-emerald-bright">● Unlocked</span>
        ) : (
          <span className="label inline-flex items-center gap-1.5 text-ivory-faint">
            <LockGlyph /> Sealed
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight2 text-ivory">{listing.headline}</h3>

      <div className="mt-3 flex items-center gap-2">
        <span className="label text-accent">{VERTICAL_LABEL[listing.vertical]}</span>
        <span className="text-ivory-faint">·</span>
        <span className="label text-ivory-faint">{STATUS_LABEL[listing.status]}</span>
      </div>

      <p className="mt-3 text-sm text-ivory-dim">{listing.localityLabel}</p>
      <p className="mt-4 line-clamp-2 flex-1 text-[0.88rem] leading-relaxed text-ivory-faint">
        “{listing.localityNote.split('.')[0]}.”
      </p>

      <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
        <div>
          <p className="label text-ivory-faint">Guidance</p>
          <p className="mono mt-1 text-lg text-ivory">
            ₹{listing.guidance.low}–{listing.guidance.high} Cr
          </p>
        </div>
        <span className="text-ivory-faint transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}

function LockGlyph() {
  return (
    <svg width="10" height="12" viewBox="0 0 14 16" fill="none" aria-hidden>
      <rect x="1.5" y="6.5" width="11" height="8" rx="0.5" stroke="currentColor" />
      <path d="M4 6.5V4a3 3 0 0 1 6 0v2.5" stroke="currentColor" />
    </svg>
  )
}
