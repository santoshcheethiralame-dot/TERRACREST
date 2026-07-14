import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Listing } from '@/domain/types'
import { repo } from '@/data/repository'
import { useAuth } from '@/auth/AuthContext'
import { useLang } from '@/i18n/LanguageContext'
import { AppShell } from '@/components/AppShell'
import { ListingCard } from '@/components/ListingCard'
import { SearchFilter, applyFilters, type SearchFilterState } from '@/components/SearchFilter'
import { rise, stagger } from '@/lib/motion'

export function BuilderDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFilterState>({ query: '', vertical: '', sortBy: 'newest' })

  useEffect(() => {
    if (!user) return
    let alive = true
    ;(async () => {
      try {
        const ls = await repo.listListings()
        if (!alive) return
        setListings(ls)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [user])

  const shown = useMemo(() => applyFilters(listings, filters), [listings, filters])

  return (
    <AppShell>
      <section>
        <p className="label text-accent">{t('nav.discovery')}</p>
        <h1 className="mt-4 font-display text-5xl text-ink md:text-6xl">{t('builder.headline')}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-dim">{t('builder.body')}</p>
      </section>

      {!loading && listings.length > 0 && (
        <div className="mt-10">
          <SearchFilter value={filters} onChange={setFilters} />
        </div>
      )}

      {/* Animate when the data lands, not on scroll — cards mounted after a slow
          fetch must never be stranded in the observer's consumed "hidden" state. */}
      <motion.div
        variants={stagger(0.1, 0.09)}
        initial="hidden"
        animate={loading ? 'hidden' : 'show'}
        className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : listings.length === 0 ? (
          <p className="label col-span-full border border-line px-6 py-10 text-center text-ink-faint">{t('builder.emptyBook')}</p>
        ) : shown.length === 0 ? (
          <p className="label col-span-full border border-line px-6 py-10 text-center text-ink-faint">{t('search.noMatch')}</p>
        ) : (
          shown.map((l) => (
            <motion.div key={l.id} variants={rise}>
              <ListingCard listing={l} />
            </motion.div>
          ))
        )}
      </motion.div>
    </AppShell>
  )
}

function SkeletonCard() {
  return <div className="h-64 animate-pulse border border-line bg-paper-raise/30" />
}
