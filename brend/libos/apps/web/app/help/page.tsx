'use client'
import Link from 'next/link'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from '../stub.module.css'

export default function HelpPage() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.icon}>💬</div>
          <h1 className={styles.title}>{tr.help}</h1>
          <p className={styles.text}>
            {lang === 'ru'
              ? 'Служба поддержки работает ежедневно с 9:00 до 22:00. Напишите нам в Telegram или по email.'
              : lang === 'en'
              ? 'Support is available daily from 9:00 to 22:00. Contact us via Telegram or email.'
              : "Qo'llab-quvvatlash xizmati har kuni 9:00 dan 22:00 gacha ishlaydi. Telegram yoki email orqali murojaat qiling."}
          </p>
          <a href="mailto:info@zyff.uz" className={styles.btn}>info@zyff.uz</a>
        </div>
      </div>
    </div>
  )
}
