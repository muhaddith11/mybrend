'use client'

import { motion } from 'framer-motion'

const sections = [
  {
    title: '1. Shartlarni qabul qilish',
    body: "One Pro saytidan foydalanish orqali siz ushbu foydalanish shartlariga rozilik bildirasiz. Agar shartlarga rozi bo'lmasangiz, saytdan foydalanmang.",
  },
  {
    title: '2. Mahsulotlar va narxlar',
    body: "Biz mahsulotlar va narxlarni oldindan ogohlantirmasdan o'zgartirish huquqini saqlab qolamiz. Barcha narxlar O'zbekiston so'mida ko'rsatilgan.",
  },
  {
    title: '3. Buyurtmalar',
    body: "Buyurtma berganingizdan so'ng, biz uni tasdiqlash uchun siz bilan bog'lanamiz. Mahsulot mavjud bo'lmasa, buyurtma bekor qilinishi mumkin.",
  },
  {
    title: '4. To\'lov',
    body: "To'lov naqd pul, plastik karta yoki yetkazib berishda amalga oshirilishi mumkin. Buyurtma to'lov tasdiqlangandan keyin qayta ishlanadi.",
  },
  {
    title: '5. Qaytarish va almashtirish',
    body: "Mahsulotni olganingizdan so'ng 14 kun ichida qaytarishingiz mumkin. Mahsulot ishlatilmagan va asl holatida bo'lishi kerak.",
  },
  {
    title: '6. Intellektual mulk',
    body: "Saytdagi barcha kontent — matnlar, rasmlar va logotiplar One Pro mulki hisoblanadi va ruxsatsiz foydalanish taqiqlanadi.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-5xl font-serif font-light tracking-wider text-foreground mb-12 text-center"
        >
          Foydalanish shartlari
        </motion.h1>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <h2 className="font-serif text-foreground text-xl mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

