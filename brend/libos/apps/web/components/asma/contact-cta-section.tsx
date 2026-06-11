'use client'

import { motion } from 'framer-motion'
import { Send, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/asma/ui/button'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

export function ContactCtaSection() {
  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
              Bog&apos;lanish
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-wider text-foreground mt-4 mb-6">
              Biz bilan bog&apos;laning
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-12">
              Savollaringiz bormi? Biz har doim yordam berishga tayyormiz. 
              Qulayingizcha muloqot usulini tanlang.
            </p>
          </motion.div>

          {/* Contact Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
            >
              <a
                href="https://t.me/asmadesign"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Telegram orqali yozish
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
            >
              <a
                href="https://instagram.com/asmadesign"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <InstagramIcon className="w-5 h-5" />
                Instagram
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a href="tel:+998901234567" className="inline-flex items-center gap-2">
                <Phone className="w-5 h-5" />
                +998 90 123 45 67
              </a>
            </Button>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-muted-foreground"
          >
            <MapPin className="w-5 h-5 text-primary" />
            <span>Qo&apos;qon shahri, Istiqbol ko&apos;chasi, 42-uy</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}



