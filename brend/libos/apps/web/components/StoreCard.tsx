import Link from 'next/link'
import Image from 'next/image'
import type { Store } from '@libos/shared'
import styles from './StoreCard.module.css'

// Mobil (apps/mobile/components/StoreCard.tsx) bilan bir xil gorizontal karta —
// halqali logotip, ochiq-nuqta, reyting/yangi belgi, yetkazish vaqti, ochiq/yopiq pill.
// Do'kon sahifalari (bosh sahifa "Do'konlar" bo'limi va /stores) ikkalasi ham
// shu bitta komponentdan foydalanadi — mobilda ham xuddi shunday.
export function StoreCard({ store, tr, lang, className }: {
  store: Store
  tr: Record<string, string>
  lang: 'uz' | 'ru' | 'en'
  className?: string
}) {
  const ring = store.themeColor || 'var(--brand)'
  const isOpen = !!store.isOpen
  const hasRating = !!store.reviewCount
  const newLabel = lang === 'ru' ? 'Новый' : lang === 'en' ? 'New' : 'Yangi'

  return (
    <Link href={`/store/${store.slug}`} className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.avatarWrap} style={{ background: store.themeBg || 'var(--brand-light)', borderColor: ring }}>
        {store.logo ? (
          <Image src={store.logo} alt={store.name} fill className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarInitial} style={{ color: ring }}>{store.name.charAt(0).toUpperCase()}</span>
        )}
        <span className={styles.statusDot} style={{ background: isOpen ? '#22C55E' : '#9CA3AF' }} />
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{store.name}</p>
        {store.address && (
          <p className={styles.addr}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {store.address}
          </p>
        )}

        <div className={styles.metaRow}>
          {hasRating ? (
            <span className={styles.ratingPill}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--highlight)">
                <path d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557L2.043 10.386a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              {(store.rating ?? 0).toFixed(1)}
            </span>
          ) : (
            <span className={styles.newBadge}>{newLabel}</span>
          )}
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaText}>{store._count?.products ?? 0} {tr.products}</span>
          {store.hasDelivery && !!store.deliveryTime && (
            <>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaText}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 100-2 1 1 0 000 2zm-9.5 11.5L9 10h5l3.5 4.5M9 10l3 4h4" />
                </svg>
                {store.deliveryTime} {tr.mMinutes}
              </span>
            </>
          )}
        </div>
      </div>

      <span className={styles.openBadge} data-open={isOpen}>
        <span className={styles.openDot} />
        {isOpen ? tr.open : tr.closed}
      </span>
    </Link>
  )
}

export function StoreCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skAvatar} />
      <div className={styles.skInfo}>
        <div className={styles.skLine} />
        <div className={styles.skShort} />
      </div>
    </div>
  )
}
