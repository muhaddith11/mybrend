'use client'
import Link from 'next/link'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from '../stub.module.css'

export default function DeliveryPage() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.icon}>🚚</div>
          <h1 className={styles.title}>{tr.delivery}</h1>
          <p className={styles.text}>
            {lang === 'ru'
              ? 'Бесплатная доставка при заказе от 300 000 сум. Доставка по всему Узбекистану.'
              : lang === 'en'
              ? 'Free delivery on orders over 300,000 UZS. Delivery across Uzbekistan.'
              : "300 000 so'mdan yuqori xaridlarga bepul yetkazib berish. O'zbekiston bo'ylab yetkazib berish."}
          </p>
          <Link href="/" className={styles.btn}>{tr.home}</Link>
        </div>
      </div>
    </div>
  )
}
