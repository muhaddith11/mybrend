'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@libos/shared'
import type { Store } from '@libos/shared'
import styles from './page.module.css'

type Gender = 'ALL' | 'MEN' | 'WOMEN' | 'KIDS'

const TABS: { id: Gender; label: string; emoji: string }[] = [
  { id: 'ALL', label: 'Hammasi', emoji: '🏪' },
  { id: 'MEN', label: 'Erkaklar', emoji: '👔' },
  { id: 'WOMEN', label: 'Ayollar', emoji: '👗' },
  { id: 'KIDS', label: 'Bolalar', emoji: '🧒' },
]

export default function HomePage() {
  const [gender, setGender] = useState<Gender>('ALL')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['stores', gender, search],
    queryFn: () => api.stores.list({
      gender: gender === 'ALL' ? undefined : gender,
      search: search || undefined,
      limit: 50,
    }),
    staleTime: 30_000,
  })

  const stores: Store[] = data?.stores ?? []

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Samarqanddagi barcha<br />
            <span>kiyim do'konlari</span> bir joyda
          </h1>
          <p className={styles.heroSub}>
            Erkaklar, ayollar va bolalar kiyimlarini toping. Online buyurtma bering yoki eshikda to'lang.
          </p>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Do'kon yoki mahsulot qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <div className={`container ${styles.tabs}`}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${gender === t.id ? styles.tabActive : ''}`}
              onClick={() => setGender(t.id)}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Store grid */}
      <div className="container">
        <div className={styles.grid}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <StoreSkeleton key={i} />)
          ) : stores.length === 0 ? (
            <div className={styles.empty}>
              <p>Do'kon topilmadi</p>
            </div>
          ) : (
            stores.map(store => <StoreCard key={store.id} store={store} />)
          )}
        </div>
      </div>
    </div>
  )
}

function StoreCard({ store }: { store: Store }) {
  const theme = store.themeColor ?? '#534AB7'
  const bg = store.themeBg ?? '#EEEDFE'

  return (
    <Link href={`/store/${store.slug}`} className={styles.card}>
      {/* Cover */}
      <div className={styles.cardCover} style={{ background: bg }}>
        {store.banner ? (
          <Image src={store.banner!} alt={store.name} fill className={styles.coverImg} />
        ) : (
          <div className={styles.coverPlaceholder} style={{ color: theme }}>
            {store.name.charAt(0)}
          </div>
        )}
        {/* Gender badges */}
        <div className={styles.genders}>
          {(store.genders ?? []).map((g: string) => (
            <span key={g} className={styles.genderBadge}>
              {g === 'MEN' ? '👔' : g === 'WOMEN' ? '👗' : '🧒'}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className={styles.cardBody}>
        {store.logo && (
          <Image src={store.logo} alt="" width={36} height={36} className={styles.storeLogo} />
        )}
        <div className={styles.cardInfo}>
          <h3 className={styles.cardName}>{store.name}</h3>
          {store.address && <p className={styles.cardAddr}>📍 {store.address}</p>}
        </div>
        <div className={styles.cardArrow} style={{ background: theme }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
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
