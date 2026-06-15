'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useStore } from '@/lib/onepro/store'
import { fetchSettings } from '@/lib/onepro/settings'
import { PhoneAuthModal } from '@/components/onepro/phone-auth-modal'

const BASE = '/store/onepro'

const categories = [
  { label: 'Chegirmalar', href: `${BASE}/collection?sale=1`, accent: true },
  { label: 'Yangi kolleksiya', href: `${BASE}/collection?new=1` },
  { label: "Ko'ylaklar", href: `${BASE}/collection?category=onp-koylak` },
  { label: 'Futbolkalar', href: `${BASE}/collection?category=onp-futbolka` },
  { label: 'Shimlar', href: `${BASE}/collection?category=onp-shim` },
  { label: 'Ustki kiyim', href: `${BASE}/collection?category=onp-ustki` },
  { label: 'Aksessuarlar', href: `${BASE}/collection?category=onp-aksessuar` },
]

export function Navigation() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [logo, setLogo] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { setCartOpen, getCartCount, wishlist, authPhone } = useStore()

  useEffect(() => {
    fetchSettings().then((s) => { if (s.logo) setLogo(s.logo) }).catch(() => {})
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(search.trim() ? `${BASE}/collection?search=${encodeURIComponent(search.trim())}` : `${BASE}/collection`)
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top utility bar */}
      <div className="bg-foreground text-background text-xs">
        <div className="container mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
          <span className="tracking-wide">O&apos;zbekiston bo&apos;ylab yetkazib berish</span>
          <span className="hidden sm:inline tracking-wide">100% original mahsulotlar</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="h-16 lg:h-20 flex items-center gap-3 lg:gap-6">
          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 -ml-2" aria-label="Menyu">
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href={BASE} className="shrink-0">
            {logo ? (
              <img src={logo} alt="One Pro" className="h-8 lg:h-9 w-auto object-contain" />
            ) : (
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">ONEPRO</span>
            )}
          </Link>

          {/* Search */}
          <form onSubmit={submitSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mahsulot, brend qidirish..."
                className="w-full h-11 pl-12 pr-4 bg-secondary border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 lg:gap-2 ml-auto">
            {authPhone ? (
              <Link href={`${BASE}/profile`} className="p-2.5 hover:text-accent transition-colors" aria-label="Profil">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="p-2.5 hover:text-accent transition-colors" aria-label="Kirish">
                <User className="w-5 h-5" />
              </button>
            )}
            <Link href={`${BASE}/wishlist`} className="relative p-2.5 hover:text-accent transition-colors" aria-label="Sevimlilar">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full grid place-items-center font-bold">{wishlist.length}</span>
              )}
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative p-2.5 hover:text-accent transition-colors" aria-label="Savat">
              <ShoppingBag className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full grid place-items-center font-bold">{getCartCount()}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={submitSearch} className="sm:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="w-full h-11 pl-12 pr-4 bg-secondary border border-border rounded-full text-sm outline-none focus:border-foreground"
            />
          </div>
        </form>
      </div>

      {/* Category nav */}
      <nav className="border-t border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-5 lg:gap-7 overflow-x-auto h-11 text-sm font-medium scrollbar-none">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className={`whitespace-nowrap transition-colors hover:text-accent ${c.accent ? 'text-accent font-semibold' : 'text-foreground/80'}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 max-w-[80%] bg-background flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <span className="text-xl font-extrabold">ONEPRO</span>
              <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Yopish"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {categories.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-3 text-base border-b border-border ${c.accent ? 'text-accent font-semibold' : 'text-foreground'}`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <PhoneAuthModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  )
}
