'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MapPin, Phone, Clock, Send } from 'lucide-react'
import { fetchSettings, defaultSettings, StoreSettings } from '@/lib/boosner/settings'

const BASE = '/store/boosner'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const shopLinks = [
  { href: `${BASE}/collection`, label: 'Chegirmalar' },
  { href: `${BASE}/collection?category=bsn-krossovka`, label: 'Krossovkalar' },
  { href: `${BASE}/collection?category=bsn-futbolka`, label: 'Futbolkalar' },
  { href: `${BASE}/collection?category=bsn-kurtka`, label: 'Kurtkalar' },
  { href: `${BASE}/collection?category=bsn-aksessuar`, label: 'Aksessuarlar' },
]
const companyLinks = [
  { href: `${BASE}/about`, label: 'Biz haqimizda' },
  { href: `${BASE}/contact`, label: 'Aloqa' },
  { href: `${BASE}/delivery`, label: 'Yetkazib berish' },
]

export function Footer() {
  const [s, setS] = useState<StoreSettings>(defaultSettings)
  useEffect(() => { fetchSettings().then(setS).catch(() => {}) }, [])

  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="text-2xl font-extrabold tracking-tight">BOOSNER</span>
            <p className="text-sm text-background/60 mt-4 leading-relaxed">
              100% original mahsulotlar — eksklyuziv chegirmalar bilan. Adidas, Calvin Klein, New Balance va boshqa brendlar.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Do&apos;kon</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-background transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Kompaniya</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-background transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Aloqa</h4>
            <ul className="space-y-3 text-sm text-background/60">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {s.address || "Qo'qon shahri"}</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {s.phone || '+998 94 707-07-00'}</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {s.workingHours || defaultSettings.workingHours}</li>
            </ul>
            <div className="flex gap-3 mt-5">
              <a href={s.telegram ? (s.telegram.startsWith('http') ? s.telegram : `https://t.me/${s.telegram.replace(/^@/, '')}`) : '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-background/20 grid place-items-center hover:bg-background hover:text-foreground transition-colors" aria-label="Telegram">
                <Send className="w-4 h-4" />
              </a>
              <a href={s.instagram ? (s.instagram.startsWith('http') ? s.instagram : `https://instagram.com/${s.instagram.replace(/^@/, '')}`) : '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-background/20 grid place-items-center hover:bg-background hover:text-foreground transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 lg:px-8 py-5 text-center text-xs text-background/50">
          &copy; {new Date().getFullYear()} Boosner. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  )
}
