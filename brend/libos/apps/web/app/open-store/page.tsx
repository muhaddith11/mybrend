'use client'
import Link from 'next/link'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from '../stub.module.css'

export default function OpenStorePage() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.icon}>🏪</div>
          <h1 className={styles.title}>{tr.openStore}</h1>
          <p className={styles.text}>
            {lang === 'ru'
              ? 'Хотите открыть магазин на ZYFF? Напишите нам — мы поможем вам начать продажи онлайн уже сегодня.'
              : lang === 'en'
              ? 'Want to open a store on ZYFF? Contact us — we will help you start selling online today.'
              : "ZYFF'da do'kon ochmoqchimisiz? Biz bilan bog'laning — bugun onlayn savdoni boshlab yuborishingizga yordam beramiz."}
          </p>
          <a href="mailto:info@zyff.uz" className={styles.btn}>
            {lang === 'ru' ? 'Написать нам' : lang === 'en' ? 'Contact us' : "Bog'lanish"}
          </a>
        </div>
      </div>
    </div>
  )
}
