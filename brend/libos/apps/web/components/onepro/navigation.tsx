'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronLeft } from 'lucide-react'
import { useStore } from '@/lib/onepro/store'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { PhoneAuthModal } from '@/components/onepro/phone-auth-modal'

const BASE = '/store/onepro'

export const ONEPRO_CATEGORIES = [
  { id: 'onp-kostyum', name: 'Kostyumlar', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80' },
  { id: 'onp-koylak', name: "Ko'ylaklar", image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop&q=80' },
  { id: 'onp-futbolka', name: 'Futbolkalar', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80' },
  { id: 'onp-shim', name: 'Shimlar', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop&q=80' },
  { id: 'onp-ustki', name: 'Ustki kiyim', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop&q=80' },
  { id: 'onp-poyabzal', name: 'Poyabzal', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=750&fit=crop&q=80' },
  { id: 'onp-aksessuar', name: 'Aksessuarlar', image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600&h=750&fit=crop&q=80' },
]

const NAV = [
  { label: 'SALE', href: `${BASE}/collection?sale=1`, accent: true },
  { label: 'YANGI', href: `${BASE}/collection?new=1`, accent: false },
  ...ONEPRO_CATEGORIES.map((c) => ({ label: c.name.toUpperCase(), href: `${BASE}/collection?category=${c.id}`, accent: false })),
]

const MARQUEE = ['BEPUL YETKAZIB BERISH', '100% ORIGINAL', '3 KUN ICHIDA QAYTARISH', 'YANGI KOLLEKSIYA', "O'ZBEKISTON BO'YLAB"]

export function Navigation() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { authPhone } = useStore()
  const openCart = useCartStore((s) => s.openCart)
  const count = useCartStore((s) => s.totalCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(search.trim() ? `${BASE}/collection?search=${encodeURIComponent(search.trim())}` : `${BASE}/collection`)
    setMenuOpen(false)
  }

  const Badge = ({ n }: { n: number }) => n > 0 ? (
    <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center border border-foreground bg-[var(--flame)] px-1 text-[10px] font-bold text-white">{n}</span>
  ) : null

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
      {/* Marketplace'ga qaytish */}
      <div className="border-b-2 border-foreground bg-[var(--cream)]">
        <div className="container mx-auto px-4 lg:px-8 h-8 flex items-center">
          <Link href="/stores" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-foreground hover:text-[var(--flame)] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Barcha do&apos;konlar
          </Link>
        </div>
      </div>
      {/* Marquee utility bar */}
      <div className="border-b-2 border-foreground bg-foreground text-[var(--volt)] opb-marquee-wrap">
        <div className="opb-marquee fast">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex">
              {MARQUEE.map((t, i) => (
                <span key={i} className="mx-6 flex items-center gap-3 py-1.5 text-[11px] font-bold tracking-[0.18em]">
                  {t} <span className="text-[var(--flame)]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
          <button onClick={() => setMenuOpen(true)} className="-ml-2 p-2 lg:hidden" aria-label="Menyu">
            <Menu className="h-7 w-7" />
          </button>

          <Link href={BASE} className="group shrink-0 leading-none">
            <span className="font-display text-3xl tracking-tight lg:text-4xl">ONE PRO</span>
            <span className="ml-0.5 inline-block bg-[var(--volt)] px-1.5 text-[10px] font-bold tracking-[0.3em] text-foreground transition-transform group-hover:-rotate-3">BOUTIQUE</span>
          </Link>

          <form onSubmit={submit} className="mx-auto hidden max-w-md flex-1 sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="QIDIRISH..."
                className="h-11 w-full border-2 border-foreground bg-background pl-12 pr-4 text-sm font-medium tracking-wide outline-none placeholder:text-foreground/40 focus:opb-shadow"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1">
            {authPhone ? (
              <Link href={`${BASE}/profile`} className="grid h-10 w-10 place-items-center transition-colors hover:bg-[var(--volt)]" aria-label="Profil"><User className="h-5 w-5" /></Link>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="grid h-10 w-10 place-items-center transition-colors hover:bg-[var(--volt)]" aria-label="Kirish"><User className="h-5 w-5" /></button>
            )}
            <Link href={`${BASE}/wishlist`} className="relative grid h-10 w-10 place-items-center transition-colors hover:bg-[var(--volt)]" aria-label="Sevimlilar">
              <Heart className="h-5 w-5" /><Badge n={wishlistCount} />
            </Link>
            <button onClick={() => openCart()} className="relative grid h-10 w-10 place-items-center transition-colors hover:bg-[var(--volt)]" aria-label="Savat">
              <ShoppingBag className="h-5 w-5" /><Badge n={count} />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="QIDIRISH..."
              className="h-11 w-full border-2 border-foreground bg-background pl-12 pr-4 text-sm font-medium outline-none placeholder:text-foreground/40"
            />
          </div>
        </form>
      </div>

      {/* Category strip */}
      <nav className="border-t-2 border-foreground bg-[var(--volt)]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-10 items-center gap-6 overflow-x-auto text-xs font-bold tracking-wide" style={{ scrollbarWidth: 'none' }}>
            {NAV.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className={`whitespace-nowrap transition-transform hover:-translate-y-0.5 ${c.accent ? 'bg-[var(--flame)] px-2 py-0.5 text-white' : 'text-foreground'}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r-2 border-foreground bg-background"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="flex h-16 items-center justify-between border-b-2 border-foreground px-4">
                <span className="font-display text-2xl">ONE PRO</span>
                <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Yopish"><X className="h-7 w-7" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {NAV.map((c) => (
                  <Link key={c.label} href={c.href} onClick={() => setMenuOpen(false)} className={`block border-b border-foreground/10 py-3 text-lg font-bold ${c.accent ? 'text-[var(--flame)]' : ''}`}>
                    {c.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PhoneAuthModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  )
}
