'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Send } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

const footerLinks = {
  shop: [
    { href: '/collection?category=suits', label: 'Kostyumlar' },
    { href: '/collection?category=coats', label: 'Paltolar' },
    { href: '/collection?category=shirts', label: 'Ko\'ylaklar' },
    { href: '/collection?category=accessories', label: 'Aksessuarlar' },
  ],
  company: [
    { href: '/about', label: 'Biz haqimizda' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/contact', label: 'Aloqa' },
    { href: '/delivery', label: 'Yetkazib berish' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-serif tracking-[0.3em] text-foreground">BOOSNER</span>
              <span className="block text-[10px] tracking-[0.5em] text-primary font-sans uppercase">
                Design
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Premium erkaklar kiyimi. Jahon brendlari darajasidagi sifat va dizayn bilan 
              Qo&apos;qon shahrida xizmat ko&apos;rsatamiz.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://t.me/muhaddith707"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://instagram.com/asmadesignofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="tel:+998502500550"
                className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Telefon"
              >
                <Phone className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.2em] uppercase text-foreground mb-6">
              Do&apos;kon
            </h3>
            <ul className="space-y-1">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center min-h-[44px] text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.2em] uppercase text-foreground mb-6">
              Kompaniya
            </h3>
            <ul className="space-y-1">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center min-h-[44px] text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.2em] uppercase text-foreground mb-6">
              Aloqa
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Qo&apos;qon shahri, Istiqbol ko&apos;chasi, 42-uy
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a
                  href="tel:+998502500550"
                  className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +998 50 250 05 50
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Har kuni: 09:00 - 21:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Boosner. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/store/boosner/privacy"
                className="inline-flex items-center min-h-[44px] text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Maxfiylik siyosati
              </Link>
              <Link
                href="/store/boosner/terms"
                className="inline-flex items-center min-h-[44px] text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Foydalanish shartlari
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}



