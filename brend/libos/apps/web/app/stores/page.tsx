'use client'
import { Suspense, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useCityStore } from '../../store/city'
import { CITIES_WITH_STORES } from '../../lib/cities'
import { useT } from '../../lib/i18n'
import { StoreCard, StoreCardSkeleton } from '../../components/StoreCard'
import styles from './page.module.css'

// Mobil "Barcha do'konlar" ekrani (app/(tabs)/stores.tsx) bilan bir xil:
// sarlavha + qidiruv + vertikal ro'yxat (grid emas).
function StoresPageInner() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const city = useCityStore(s => s.city)
  const cityHasStores = CITIES_WITH_STORES.has(city)

  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['all-stores', debounced, city],
    queryFn: () => api.stores.list({ search: debounced, city, limit: 100 }),
    staleTime: 60_000,
  })

  const stores = data?.stores ?? []

  return (
    <div className={styles.page}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 className={styles.heading}>{tr.mAllStores}</h1>

        <div className={styles.searchBar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={styles.searchIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder={tr.mSearchStoreName}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {!isLoading && !cityHasStores ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            {tr.mOtherCitiesSoon}
          </div>
        ) : (
          <div className={styles.list}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <StoreCardSkeleton key={i} />)
              : stores.map(s => <StoreCard key={s.id} store={s} tr={tr} lang={lang} />)
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default function StoresPage() {
  return (
    <Suspense>
      <StoresPageInner />
    </Suspense>
  )
}
