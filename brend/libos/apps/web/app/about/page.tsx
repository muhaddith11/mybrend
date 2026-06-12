'use client'
import Link from 'next/link'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from '../stub.module.css'

export default function AboutPage() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.icon}>🏙️</div>
          <h1 className={styles.title}>{tr.aboutUs}</h1>
          <p className={styles.text}>
            {lang === 'ru'
              ? 'ZYFF — первая мультибрендовая платформа для одежды в Коканде. Мы объединяем лучшие магазины города в одном месте.'
              : lang === 'en'
              ? 'ZYFF is the first multi-brand fashion platform in Kokand. We bring the best stores in the city together in one place.'
              : "ZYFF — Qo'qondagi birinchi ko'p brendli kiyim platformasi. Biz shahardagi eng yaxshi do'konlarni bir joyda birlashtiramiz."}
          </p>
          <Link href="/" className={styles.btn}>{tr.home}</Link>
        </div>
      </div>
    </div>
  )
}
