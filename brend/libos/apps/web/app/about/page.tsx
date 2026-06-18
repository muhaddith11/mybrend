'use client'
import Link from 'next/link'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from '../stub.module.css'

export default function AboutPage() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)

  const intro = lang === 'ru'
    ? 'ZYFF — мультибрендовая платформа одежды в городе Коканд. Мы объединяем лучшие магазины города в одном месте: ищите, сравнивайте и заказывайте напрямую.'
    : lang === 'en'
    ? 'ZYFF is a multi-brand clothing marketplace in Kokand, Uzbekistan. We bring the city’s best stores together in one place — search, compare and order directly.'
    : "ZYFF — Qo'qon shahridagi ko'p brendli kiyim marketplace platformasi. Biz shahardagi eng yaxshi do'konlarni bir joyda birlashtiramiz: qidiring, solishtiring va to'g'ridan-to'g'ri buyurtma bering."

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner} style={{ maxWidth: 720 }}>
          <div className={styles.icon}>🛍️</div>
          <h1 className={styles.title}>ZYFF haqida</h1>
          <p className={styles.text}>{intro}</p>

          <div style={{ textAlign: 'left', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Bizning do'konlarimiz</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                Platformamizda <strong>Asma Design</strong> (premium erkaklar kiyimi),{' '}
                <strong>Boosner</strong> (100% original brendlar — Adidas, Calvin Klein, New Balance) va{' '}
                <strong>One Pro Boutique</strong> (zamonaviy erkaklar kiyimi) kabi do'konlar mavjud. Har bir do'kon o'z sahifasiga,
                mahsulotlariga va yetkazib berish xizmatiga ega.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Qanday ishlaydi</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                Mahsulotni qidiring → do'konni tanlang → savatga qo'shing → buyurtma bering. To'lov naqd, karta yoki online (Click/Payme)
                orqali. O'zbekiston bo'ylab yetkazib berish mavjud.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Joylashuv va aloqa</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                📍 Qo'qon shahri, O'zbekiston<br />
                🌐 zyff.uz · 📷 Instagram: @zyff.uz
              </p>
            </div>
          </div>

          <Link href="/stores" className={styles.btn} style={{ marginTop: '1.5rem' }}>Do'konlarni ko'rish</Link>
        </div>
      </div>
    </div>
  )
}
