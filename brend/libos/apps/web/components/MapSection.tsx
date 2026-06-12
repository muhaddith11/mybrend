'use client'
import dynamic from 'next/dynamic'
import type { Store } from '@libos/shared'
import styles from './MapSection.module.css'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>🗺️ Xarita yuklanmoqda...</div>,
})

interface Props {
  stores: Store[]
  lang: string
  title: string
}

export function MapSection({ stores, lang, title }: Props) {
  const withCoords = stores.filter(s => s.lat && s.lng)

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <h2 className={styles.title}>📍 {title}</h2>
          <p className={styles.sub}>
            {lang === 'ru'
              ? "Магазины на карте Коканда — нажмите для маршрута"
              : lang === 'en'
              ? "Stores on Kokand map — tap for directions"
              : "Qo'qon xaritasida do'konlar — bosing va yo'nalish oling"}
          </p>
        </div>
        <div className={styles.mapBox}>
          <LeafletMap stores={stores} lang={lang} />
          {withCoords.length === 0 && (
            <div className={styles.noCoords}>
              {lang === 'ru'
                ? "Координаты магазинов скоро будут добавлены"
                : lang === 'en'
                ? "Store coordinates coming soon"
                : "Do'kon joylashuvlari tez kunda qo'shiladi"}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
