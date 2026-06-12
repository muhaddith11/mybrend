'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import type { Store } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from './page.module.css'

function StoresPageInner() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)

  const { data, isLoading } = useQuery({
    queryKey: ['stores-all'],
    queryFn: () => api.stores.list({ limit: 100 }),
    staleTime: 60_000,
  })

  const stores = data?.stores ?? []

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.heading}>{tr.storesSection}</h1>
        <p className={styles.sub}>{tr.topStores}</p>

        <div className={styles.grid}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <StoreSkeleton key={i} />)
            : stores.map(s => <StoreCard key={s.id} store={s} tr={tr} />)
          }
        </div>
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

function StoreCard({ store, tr }: { store: Store; tr: Record<string, string> }) {
  const bg = store.themeBg ?? '#EEF2FF'
  const color = store.themeColor ?? '#2563EB'

  return (
    <Link href={`/store/${store.slug}`} className={styles.card}>
      <div className={styles.cover} style={{ background: bg }}>
        {store.banner ? (
          <Image src={store.banner} alt={store.name} fill className={styles.coverImg} />
        ) : store.logo ? (
          <Image src={store.logo} alt={store.name} fill className={styles.coverImg} />
        ) : (
          <div className={styles.initial} style={{ color }}>{store.name.charAt(0)}</div>
        )}
        {store.isOpen !== undefined && (
          <span className={store.isOpen ? styles.openBadge : styles.closedBadge}>
            {store.isOpen ? tr.open : tr.closed}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.storeName}>{store.name}</div>
        {store.address && <div className={styles.address}>📍 {store.address}</div>}
        <div className={styles.meta}>
          {store.rating && <span className={styles.rating}>★ {store.rating.toFixed(1)}</span>}
          {store._count && <span className={styles.count}>{store._count.products} {tr.products}</span>}
        </div>
      </div>
    </Link>
  )
}

function StoreSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skCover} />
      <div className={styles.skBody}>
        <div className={styles.skLine} />
        <div className={styles.skShort} />
      </div>
    </div>
  )
}
