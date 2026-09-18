'use client'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from '../stub.module.css'

// Mobil Yordam ekrani (app/help.tsx) bilan bir xil — 4 ta aloqa usuli
// (avval faqat email bor edi).
const CONTACTS = [
  { icon: '📞', label: '+998 50 250 05 50', href: 'tel:+998502500550' },
  { icon: '✉️', label: 'info@zyff.uz', href: 'mailto:info@zyff.uz' },
  { icon: '✈️', label: 'Telegram: @zyff_uz', href: 'https://t.me/zyff_uz' },
  { icon: '📷', label: 'Instagram: @zyff.uz', href: 'https://instagram.com/zyff.uz' },
]

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
              ? 'Служба поддержки работает ежедневно с 9:00 до 22:00. Свяжитесь с нами одним из способов ниже:'
              : lang === 'en'
              ? 'Support is available daily from 9:00 to 22:00. Contact us in one of the ways below:'
              : "Qo'llab-quvvatlash xizmati har kuni 9:00 dan 22:00 gacha ishlaydi. Quyidagi usullardan biri orqali biz bilan bog'laning:"}
          </p>
          <div className={styles.list}>
            {CONTACTS.map(c => (
              <a key={c.href} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={styles.item}>
                <span className={styles.itemIcon}>{c.icon}</span>
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
