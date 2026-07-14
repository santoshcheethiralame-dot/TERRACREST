import { Link } from 'react-router-dom'
import type { Listing } from '@/domain/types'
import { useLang } from '@/i18n/LanguageContext'
import { VERTICAL_KEY, STATUS_KEY } from '@/i18n/translations'

export function ListingCard({ listing }: { listing: Listing }) {
  const { t } = useLang()
  const isWarehouse = listing.vertical === 'warehouse'
  // Warehouses come to market either for sale or on a lease; a leased shell is
  // priced per month, everything else on a capital (crore) guidance.
  const isLease = isWarehouse && /rent|lease/i.test(listing.warehouse?.leaseType ?? '')
  const price = isLease
    ? `₹${listing.guidance.low}–${listing.guidance.high} ${t('listingCard.perMonth')}`
    : `₹${listing.guidance.low}–${listing.guidance.high} Cr`
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group relative flex flex-col border border-line bg-paper-raise/40 p-6 transition-colors duration-300 hover:border-[color:var(--line-accent)]"
    >
      <div className="flex items-center justify-between">
        <span className="mono text-[0.72rem] text-ink-dim">{listing.id}</span>
        <span className="label text-emerald-bright">● {t('listingCard.fullAccess')}</span>
      </div>

      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight2 text-ink">{listing.headline}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="label text-accent">{t(VERTICAL_KEY[listing.vertical])}</span>
        {isWarehouse && listing.warehouse?.leaseType && (
          <>
            <span className="text-ink-faint">·</span>
            <span className="label text-beam">{t(isLease ? 'listingCard.forRent' : 'listingCard.forSale')}</span>
          </>
        )}
        <span className="text-ink-faint">·</span>
        <span className="label text-ink-faint">{t(STATUS_KEY[listing.status])}</span>
      </div>

      <p className="mt-3 text-sm text-ink-dim">{listing.localityLabel}</p>
      <p className="mt-4 line-clamp-2 flex-1 text-[0.88rem] leading-relaxed text-ink-faint">
        “{listing.localityNote.split('.')[0]}.”
      </p>

      <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
        <div>
          <p className="label text-ink-faint">{t('listingCard.guidance')}</p>
          <p className="mono mt-1 text-lg text-ink">{price}</p>
        </div>
        <span className="text-ink-faint transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}
