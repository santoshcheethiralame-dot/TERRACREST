import { useState } from 'react'
import type { Vertical } from '@/domain/types'
import { useLang } from '@/i18n/LanguageContext'
import { VERTICAL_KEY } from '@/i18n/translations'

export interface SearchFilterState {
  query: string
  vertical: Vertical | ''
  sortBy: 'newest' | 'price-low' | 'price-high' | 'area'
}

const INITIAL: SearchFilterState = { query: '', vertical: '', sortBy: 'newest' }

const VERTICALS: Vertical[] = ['joint-development', 'warehouse', 'big-land']

export function SearchFilter({ value, onChange }: { value?: SearchFilterState; onChange: (state: SearchFilterState) => void }) {
  const { t } = useLang()
  const [state, setState] = useState<SearchFilterState>(value ?? INITIAL)

  const update = (patch: Partial<SearchFilterState>) => {
    const next = { ...state, ...patch }
    setState(next)
    onChange(next)
  }
  const clear = () => {
    setState(INITIAL)
    onChange(INITIAL)
  }
  const hasFilters = state.query || state.vertical || state.sortBy !== 'newest'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={state.query}
          onChange={(e) => update({ query: e.target.value })}
          placeholder={t('search.placeholder')}
          className="mono w-full border border-line bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-[color:var(--line-accent)]"
        />
      </div>

      <select
        value={state.vertical}
        onChange={(e) => update({ vertical: e.target.value as Vertical | '' })}
        className="mono border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]"
      >
        <option value="">{t('search.allVerticals')}</option>
        {VERTICALS.map((v) => (
          <option key={v} value={v}>
            {t(VERTICAL_KEY[v])}
          </option>
        ))}
      </select>

      <select
        value={state.sortBy}
        onChange={(e) => update({ sortBy: e.target.value as SearchFilterState['sortBy'] })}
        className="mono border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-[color:var(--line-accent)]"
      >
        <option value="newest">{t('search.newest')}</option>
        <option value="price-low">{t('search.priceLow')}</option>
        <option value="price-high">{t('search.priceHigh')}</option>
        <option value="area">{t('search.largestArea')}</option>
      </select>

      {hasFilters && (
        <button onClick={clear} className="label border border-line px-4 py-3 text-ink-faint transition-colors hover:text-ink">
          {t('search.clear')}
        </button>
      )}
    </div>
  )
}

/** Filter + sort a listing array by the current control state (pure, client-side). */
export function applyFilters<
  T extends { headline: string; localityLabel: string; vertical: string; guidance: { low: number; high: number }; landAreaSqft: number; createdAt?: string },
>(items: T[], filters: SearchFilterState): T[] {
  let result = [...items]

  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter((l) => l.headline.toLowerCase().includes(q) || l.localityLabel.toLowerCase().includes(q))
  }
  if (filters.vertical) {
    result = result.filter((l) => l.vertical === filters.vertical)
  }

  switch (filters.sortBy) {
    case 'price-low':
      result.sort((a, b) => a.guidance.low - b.guidance.low)
      break
    case 'price-high':
      result.sort((a, b) => b.guidance.high - a.guidance.high)
      break
    case 'area':
      result.sort((a, b) => b.landAreaSqft - a.landAreaSqft)
      break
    case 'newest':
    default:
      result.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      break
  }
  return result
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
