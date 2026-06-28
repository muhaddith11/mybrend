import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Maxfiylik siyosati',
  description: "ZYFF maxfiylik siyosati — qanday ma'lumotlar yig'iladi va ulardan qanday foydalaniladi.",
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Maxfiylik siyosati</h1>
      <p className={styles.updated}>Oxirgi yangilanish: 2026-yil 28-iyun</p>

      <p className={styles.lead}>
        ZYFF (&laquo;biz&raquo;, &laquo;platforma&raquo;) &mdash; Qo&apos;qon shahridagi kiyim
        do&apos;konlarini bitta joyga jamlagan onlayn marketplace. Ushbu siyosat siz ZYFF veb-sayti
        va mobil ilovasidan foydalanganingizda qanday shaxsiy ma&apos;lumotlar yig&apos;ilishini,
        ulardan qanday foydalanishimizni va ularni qanday himoya qilishimizni tushuntiradi.
      </p>

      <div className={styles.section}>
        <h2 className={styles.h2}>1. Biz yig&apos;adigan ma&apos;lumotlar</h2>
        <ul>
          <li>Ism va telefon raqami (ro&apos;yxatdan o&apos;tish va buyurtma berishda);</li>
          <li>Yetkazib berish manzili va xaritadagi joylashuv (faqat yetkazib berish uchun);</li>
          <li>Buyurtma tarixi va savatdagi mahsulotlar;</li>
          <li>Bot orqali to&apos;lov tanlangan bo&apos;lsa &mdash; Telegram hisobingiz (chat) va to&apos;lov cheki rasmi.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>2. Ma&apos;lumotlardan foydalanish</h2>
        <p>Yig&apos;ilgan ma&apos;lumotlar quyidagi maqsadlarda ishlatiladi:</p>
        <ul>
          <li>Buyurtmalarni qabul qilish, qayta ishlash va yetkazib berish;</li>
          <li>Buyurtma holati to&apos;g&apos;risida SMS va Telegram orqali xabar berish;</li>
          <li>Qo&apos;llab-quvvatlash va xizmat sifatini yaxshilash.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>3. Ma&apos;lumotlarni uchinchi tomonlar bilan ulashish</h2>
        <p>
          Buyurtma bergan do&apos;konga (sotuvchiga) buyurtmani bajarish uchun zarur ma&apos;lumotlar
          (ism, telefon, manzil) yetkaziladi. SMS xabarlari operator (Eskiz.uz) orqali, Telegram
          xabarlari Telegram orqali yuboriladi. Biz sizning shaxsiy ma&apos;lumotlaringizni hech
          kimga <strong>sotmaymiz</strong> va reklama maqsadida uchinchi tomonlarga bermaymiz.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>4. To&apos;lov ma&apos;lumotlari</h2>
        <p>
          Bot orqali karta o&apos;tkazmasida pul to&apos;g&apos;ridan-to&apos;g&apos;ri sotuvchining
          kartasiga o&apos;tkaziladi. Biz sizning <strong>karta raqamingizni saqlamaymiz</strong> va
          to&apos;lovni o&apos;zimiz qayta ishlamaymiz &mdash; faqat to&apos;lov chekini sotuvchiga
          tasdiqlash uchun yetkazamiz.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>5. Ma&apos;lumotlarni saqlash va xavfsizlik</h2>
        <p>
          Ma&apos;lumotlar himoyalangan serverlarda saqlanadi va ularni himoya qilish uchun zarur
          texnik choralar ko&apos;riladi. Shunga qaramay, internet orqali uzatishning 100% xavfsizligi
          kafolatlanmaydi.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>6. Sizning huquqlaringiz</h2>
        <p>
          Siz o&apos;zingiz haqingizdagi ma&apos;lumotlarni ko&apos;rish, tuzatish yoki o&apos;chirishni
          so&apos;rashingiz mumkin. Buning uchun quyidagi aloqa orqali bizga murojaat qiling.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>7. Bolalar</h2>
        <p>
          Xizmatimiz 18 yoshga to&apos;lmagan shaxslarga mo&apos;ljallanmagan va biz ataylab bolalardan
          ma&apos;lumot yig&apos;maymiz.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.h2}>8. O&apos;zgartirishlar</h2>
        <p>
          Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin. Yangilangan versiya shu sahifada
          e&apos;lon qilinadi.
        </p>
      </div>

      <div className={styles.contact}>
        <p>
          Savollaringiz bo&apos;lsa bog&apos;laning:{' '}
          <a href="mailto:info@zyff.uz">info@zyff.uz</a> &nbsp;&middot;&nbsp;{' '}
          <a href="https://t.me/zyff_uz" target="_blank" rel="noopener noreferrer">Telegram: @zyff_uz</a>
        </p>
      </div>
    </div>
  )
}
