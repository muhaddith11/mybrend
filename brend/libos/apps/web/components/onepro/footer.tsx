'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Send, Phone, MapPin } from 'lucide-react'
import { ONEPRO_CATEGORIES } from '@/components/onepro/navigation'
import { fetchSettings, defaultSettings, StoreSettings } from '@/lib/onepro/settings'

const BASE = '/store/onepro'

function Instagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function Footer() {
  const [s, setS] = useState<StoreSettings>(defaultSettings)
  useEffect(() => { fetchSettings().then(setS).catch(() => {}) }, [])

  const tgHref = s.telegram ? (s.telegram.startsWith('http') ? s.telegram : `https://t.me/${s.telegram.replace(/^@/, '')}`) : '#'
  const igHref = s.instagram ? (s.instagram.startsWith('http') ? s.instagram : `https://instagram.com/${s.instagram.replace(/^@/, '')}`) : '#'

  return (
    <footer className="mt-20 border-t-2 border-foreground bg-foreground text-background">
      {/* Giant marquee */}
      <div className="border-b-2 border-[var(--volt)]/30 py-3 opb-marquee-wrap">
        <div className="opb-marquee">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="mx-4 font-display text-4xl text-[var(--volt)] lg:text-6xl whitespace-nowrap">
                  ONE PRO BOUTIQUE <span className="text-[var(--flame)]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 grid gap-10 py-12 md:grid-cols-4">
        <div>
          <span className="font-display text-3xl">ONE PRO</span>
          <span className="ml-1 inline-block bg-[var(--volt)] px-1.5 text-[10px] font-bold tracking-[0.3em] text-foreground">BOUTIQUE</span>
          <p className="mt-4 max-w-xs text-sm text-background/70">
            Zamonaviy erkak uchun kuchli uslub. Klassikadan streetwear gacha — bir joyda.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={igHref} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center border-2 border-background/30 transition-colors hover:border-[var(--volt)] hover:bg-[var(--volt)] hover:text-foreground" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href={tgHref} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center border-2 border-background/30 transition-colors hover:border-[var(--volt)] hover:bg-[var(--volt)] hover:text-foreground" aria-label="Telegram"><Send className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="opb-eyebrow text-[var(--volt)]">Kategoriyalar</h4>
          <ul className="mt-4 space-y-2 text-sm text-background/80">
            {ONEPRO_CATEGORIES.map((c) => (
              <li key={c.id}><Link href={`${BASE}/collection?category=${c.id}`} className="transition-colors hover:text-[var(--volt)]">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="opb-eyebrow text-[var(--volt)]">Ma&apos;lumot</h4>
          <ul className="mt-4 space-y-2 text-sm text-background/80">
            <li><Link href={`${BASE}/about`} className="transition-colors hover:text-[var(--volt)]">Biz haqimizda</Link></li>
            <li><Link href={`${BASE}/collection`} className="transition-colors hover:text-[var(--volt)]">Katalog</Link></li>
            <li><Link href={`${BASE}/profile`} className="transition-colors hover:text-[var(--volt)]">Mening profilim</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="opb-eyebrow text-[var(--volt)]">Bog&apos;lanish</h4>
          <ul className="mt-4 space-y-3 text-sm text-background/80">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--volt)]" /> {s.phone || '+998 90 123 45 67'}</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[var(--volt)]" /> {s.address || "Qo'qon shahri"}</li>
            <li className="text-background/60">{s.workingHours || defaultSettings.workingHours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t-2 border-background/10">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col items-center justify-between gap-2 py-5 text-xs text-background/50 sm:flex-row">
          <span>© {new Date().getFullYear()} One Pro Boutique. Barcha huquqlar himoyalangan.</span>
          <span>Qo&apos;qon · Toshkent · Farg&apos;ona · Samarqand</span>
        </div>
      </div>
    </footer>
  )
}
