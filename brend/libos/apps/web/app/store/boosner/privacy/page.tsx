'use client'

import { motion } from 'framer-motion'

const sections = [
  {
    title: '1. Umumiy qoidalar',
    body: "Boosner (\"biz\") sizning shaxsiy ma'lumotlaringiz maxfiyligini hurmat qiladi. Ushbu siyosat saytdan foydalanganingizda qanday ma'lumotlar yig'ilishini va ulardan qanday foydalanishimizni tushuntiradi.",
  },
  {
    title: "2. Yig'iladigan ma'lumotlar",
    body: "Buyurtma berishda biz sizning ismingiz, telefon raqamingiz va yetkazib berish manzilingizni so'raymiz. Bu ma'lumotlar faqat buyurtmani bajarish uchun ishlatiladi.",
  },
  {
    title: "3. Ma'lumotlardan foydalanish",
    body: "Sizning ma'lumotlaringiz buyurtmalarni qayta ishlash, yetkazib berish va xizmat sifatini yaxshilash uchun ishlatiladi. Biz ularni uchinchi shaxslarga sotmaymiz.",
  },
  {
    title: '4. Xavfsizlik',
    body: "Biz sizning ma'lumotlaringizni himoya qilish uchun zarur choralarni ko'ramiz. Ammo internetda hech qanday uzatish 100% xavfsiz emasligini esda tuting.",
  },
  {
    title: '5. Bog\'lanish',
    body: "Maxfiylik siyosati bo'yicha savollaringiz bo'lsa, aloqa sahifasi orqali biz bilan bog'laning.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-5xl font-serif font-light tracking-wider text-foreground mb-12 text-center"
        >
          Maxfiylik siyosati
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

