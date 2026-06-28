import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Foydalanish shartlari',
  description: 'ZYFF platformasidan foydalanish shartlari.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Foydalanish shartlari</h1>
      <p className={styles.updated}>Oxirgi yangilanish: 2026-yil 28-iyun</p>

      <p className={styles.lead}>
        ZYFF platformasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz. Iltimos
        ularni diqqat bilan o&apos;qing.
      </p>

      <div className={styles.section}>
        <h2 className={styles.h2}>1. Platforma roli</h2>
        <p>
          ZYFF &mdash; xaridorlar va do&apos;konlarni (sotuvchilarni) bog&apos;lovchi marketplace.
          Mahsulotlar do&apos;konlarga tegishli; oldi-sotdi shartnomasi xaridor va tegishli do&apos;kon
          o&apos;rtasida tuziladi. ZYFF mahsulot sifati yoki yetkazib berish uchun bevosita sotuvchi
          javobgar ekanini ta&apos;kidlaydi.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>2. Buyurtma va to&apos;lov</h2>
        <p>
          Buyurtmalar har do&apos;kon bo&apos;yicha alohida rasmiylashtiriladi. To&apos;lov naqd
          (yetkazib berishda) yoki karta orqali (bot vositasida to&apos;g&apos;ridan-to&apos;g&apos;ri
          sotuvchiga) amalga oshiriladi. To&apos;lov tasdig&apos;i sotuvchi tomonidan beriladi.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>3. Yetkazib berish</h2>
        <p>
          Yetkazib berish shartlari va muddatlari tegishli do&apos;kon tomonidan belgilanadi.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>4. Foydalanuvchi majburiyatlari</h2>
        <ul>
          <li>To&apos;g&apos;ri va haqqoniy ma&apos;lumot kiritish;</li>
          <li>Platformadan qonuniy maqsadlarda foydalanish;</li>
          <li>Boshqalarning huquqlarini buzmaslik.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>5. Javobgarlik</h2>
        <p>
          ZYFF platformaning uzluksiz ishlashiga harakat qiladi, lekin texnik uzilishlar yoki
          sotuvchilar harakati natijasidagi zararlar uchun javobgarlikni o&apos;z zimmasiga olmaydi.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>6. O&apos;zgartirishlar</h2>
        <p>Shartlar yangilanishi mumkin; yangilangan versiya shu sahifada e&apos;lon qilinadi.</p>
      </div>

      <div className={styles.contact}>
        <p>
          Aloqa:{' '}
          <a href="mailto:info@zyff.uz">info@zyff.uz</a> &nbsp;&middot;&nbsp;{' '}
          <a href="https://t.me/zyff_uz" target="_blank" rel="noopener noreferrer">Telegram: @zyff_uz</a>
        </p>
      </div>
    </div>
  )
}
