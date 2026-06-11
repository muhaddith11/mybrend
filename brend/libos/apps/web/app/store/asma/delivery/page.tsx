'use client'

import { motion } from 'framer-motion'
import { Truck, Clock, MapPin, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react'

const items = [
  {
    icon: Truck,
    title: 'Bepul yetkazib berish',
    text: "Qo'qon shahri bo'ylab barcha buyurtmalar bepul yetkazib beriladi.",
  },
  {
    icon: Clock,
    title: '2 soat ichida',
    text: "Buyurtmangizni shahar ichida 2 soat ichida qabul qilasiz.",
  },
  {
    icon: MapPin,
    title: 'Viloyatlarga',
    text: "Boshqa viloyatlarga pochta xizmati orqali 2-4 kun ichida yetkazamiz.",
  },
  {
    icon: CreditCard,
    title: "To'lov usullari",
    text: "Naqd pul, plastik karta yoki yetkazib berishda to'lash mumkin.",
  },
  {
    icon: RotateCcw,
    title: '14 kunlik qaytarish',
    text: "Mahsulot yoqmasa, 14 kun ichida qaytarib berishingiz mumkin.",
  },
  {
    icon: ShieldCheck,
    title: 'Sifat kafolati',
    text: "Barcha mahsulotlar 100% asl va sifat kafolati bilan.",
  },
]

export default function DeliveryPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
            Xizmatlar
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-wider text-foreground mt-4 mb-6">
            Yetkazib berish
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Tez, ishonchli va qulay yetkazib berish xizmati
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-card border border-border rounded p-8"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-foreground text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

