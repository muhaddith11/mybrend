'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Send, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/asma/ui/button'
import { Input } from '@/components/asma/ui/input'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', phone: '', email: '', message: '' })
    }, 3000)
  }

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
            Bog&apos;lanish
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-wider text-foreground mt-4 mb-6">
            Aloqa
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Savollaringiz bormi? Biz har doim yordam berishga tayyormiz
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-serif text-foreground mb-8">
              Biz bilan bog&apos;laning
            </h2>

            {/* Contact Cards */}
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4 p-6 bg-card border border-border rounded">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Manzil</h3>
                  <p className="text-muted-foreground text-sm">
                    Qo&apos;qon shahri, Istiqbol ko&apos;chasi, 42-uy
                  </p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Xaritada ko&apos;rish
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card border border-border rounded">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Telefon</h3>
                  <a
                    href="tel:+998901234567"
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    +998 90 123 45 67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card border border-border rounded">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Ish vaqti</h3>
                  <p className="text-muted-foreground text-sm">
                    Har kuni: 09:00 - 21:00
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <h3 className="text-sm tracking-wider uppercase text-foreground mb-4">
              Ijtimoiy tarmoqlar
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
              >
                <a
                  href="https://t.me/asmadesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </a>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
              >
                <a
                  href="https://instagram.com/asmadesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <InstagramIcon className="w-4 h-4" />
                  Instagram
                </a>
              </Button>
            </div>

            {/* Delivery Banner */}
            <div className="mt-12 p-6 bg-primary/10 border border-primary/20 rounded">
              <div className="flex items-center gap-3 mb-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Tez yetkazib berish</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Qo&apos;qon shahri bo&apos;ylab 2 soat ichida bepul yetkazib beramiz!
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-serif text-foreground mb-8">
              Xabar yuborish
            </h2>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-card border border-border rounded"
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-serif text-foreground mb-2">
                  Rahmat!
                </h3>
                <p className="text-muted-foreground">
                  Sizning xabaringiz qabul qilindi. Tez orada javob beramiz.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm tracking-wider uppercase text-foreground mb-2">
                    Ismingiz
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-card border-border focus:border-primary h-12"
                    placeholder="To'liq ismingiz"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm tracking-wider uppercase text-foreground mb-2">
                    Telefon raqami
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-card border-border focus:border-primary h-12"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm tracking-wider uppercase text-foreground mb-2">
                    Email (ixtiyoriy)
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-card border-border focus:border-primary h-12"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm tracking-wider uppercase text-foreground mb-2">
                    Xabar
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-3 bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                    placeholder="Sizning xabaringiz..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-sm tracking-wider uppercase"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Yuborish
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}



