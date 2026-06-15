'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Award, Users, Truck, Heart } from 'lucide-react'
import { Button } from '@/components/asma/ui/button'

const values = [
  {
    icon: Award,
    title: 'Sifat',
    description: 'Faqat eng yaxshi materiallar va ustozlik bilan ishlaymiz',
  },
  {
    icon: Users,
    title: 'Mijozlarga e\'tibor',
    description: 'Har bir mijoz bizning asosiy ustuvorligimiz',
  },
  {
    icon: Truck,
    title: 'Tez yetkazib berish',
    description: 'Qo\'qon bo\'ylab 2 soat ichida yetkazib beramiz',
  },
  {
    icon: Heart,
    title: 'Ishonch',
    description: '100% asl mahsulotlar kafolati',
  },
]

const timeline = [
  {
    year: '2024',
    title: 'Asma Design tashkil etildi',
    description: 'Qo\'qon shahrida premium erkaklar kiyimi brendi ochildi',
  },
  {
    year: '2024',
    title: 'Birinchi kolleksiya',
    description: 'Kuz/Qish kolleksiyasi taqdim etildi',
  },
  {
    year: '2024',
    title: 'Online do\'kon',
    description: 'Onlayn savdo platformasi ishga tushirildi',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Page Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
            Biz haqimizda
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-wider text-foreground mt-4 mb-6">
            Bizning hikoyamiz
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Premium erkaklar kiyimi. Qo&apos;qon shahrining yangi moda brendi.
          </p>
        </motion.div>
      </div>

      {/* Hero Image */}
      <div className="container mx-auto px-4 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[21/9] bg-muted overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&h=686&fit=crop&q=80"
            alt="Asma Design Atelier"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <p className="text-lg lg:text-xl font-serif text-foreground italic">
              &ldquo;Elegantlik - bu oddiylik va sifat uyg&apos;unligi&rdquo;
            </p>
          </div>
        </motion.div>
      </div>

      {/* Brand Story */}
      <div className="container mx-auto px-4 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-light text-foreground mb-6">
              Bizning Maqsadimiz
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Asma Design 2024-yilda Qo&apos;qon shahrida tashkil etilgan premium erkaklar 
                kiyimi brendi. Biz Zara, Farfetch va Massimo Dutti kabi jahon brendlari 
                darajasidagi sifat va dizaynni O&apos;zbekistonga olib keldik.
              </p>
              <p>
                Har bir kiyim g&apos;oyasi - bu Italiya ustaligi va mahalliy madaniyat 
                uyg&apos;unligi. Biz nafaqat kiyim sotmaymiz, balki hayot tarzini taqdim etamiz.
              </p>
              <p>
                Bizning kolleksiyalarimiz zamonaviy jentlmenlar uchun - professional, 
                o&apos;ziga ishongan va uslubga e&apos;tibor beradigan erkaklar uchun yaratilgan.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/5] bg-muted"
          >
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=80"
              alt="Asma Design Founder"
              fill
              className="object-cover"
            />
            <div className="absolute -bottom-4 -left-4 bg-card p-6 border border-border">
              <p className="text-sm text-muted-foreground">Asoschisi</p>
              <p className="font-serif text-foreground">Asma Design Team</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-card py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
              Qadriyatlarimiz
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-light text-foreground mt-4">
              Bizning qadriyatlarimiz
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-foreground text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container mx-auto px-4 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
            Tarixcha
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-light text-foreground mt-4">
            Bizning yo&apos;limiz
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex gap-6 mb-8 last:mb-0"
            >
              <div className="w-20 shrink-0">
                <span className="text-2xl font-serif text-primary">{item.year}</span>
              </div>
              <div className="flex-1 pb-8 border-l-2 border-border pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full" />
                <h3 className="font-serif text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-card border border-border p-12 lg:p-16"
        >
          <h2 className="text-2xl lg:text-3xl font-serif font-light text-foreground mb-4">
            Kolleksiyamizni kashf eting
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Premium erkaklar kiyimi bilan tanishing va o&apos;z uslubingizni toping
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/store/asma/collection" className="inline-flex items-center gap-2">
              Kolleksiyani ko&apos;rish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}


