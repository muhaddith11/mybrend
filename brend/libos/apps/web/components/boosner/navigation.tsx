'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { fetchSettings } from '@/lib/boosner/settings'

const BASE = '/store/boosner'

const categories = [
  { label: 'Chegirmalar', href: `${BASE}/collection?sale=1`, accent: true },
  { label: 'Yangi kolleksiya', href: `${BASE}/collection?new=1` },
  { label: 'Kiyimlar', href: `${BASE}/collection?category=bsn-futbolka`, caret: true },
  { label: 'Oyoq kiyim', href: `${BASE}/collection?category=bsn-krossovka`, caret: true },
  { label: 'Aksessuarlar', href: `${BASE}/collection?category=bsn-aksessuar`, caret: true },
  { label: 'Brendlar', href: `${BASE}/collection`, caret: true },
]

export function Navigation() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [logo, setLogo] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openLogin = useAuthStore((s) => s.openLogin)
  const openCart = useCartStore((s) => s.openCart)
  const cartCount = useCartStore((s) => s.totalCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)

  useEffect(() => {
    fetchSettings().then((s) => { if (s.logo) setLogo(s.logo) }).catch(() => {})
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchOpen(false)
    router.push(search.trim() ? `${BASE}/collection?search=${encodeURIComponent(search.trim())}` : `${BASE}/collection`)
  }

  const Badge = ({ n }: { n: number }) => (
    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full grid place-items-center font-bold">{n}</span>
  )

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top utility bar — marketplace'ga qaytish */}
      <div className="bg-foreground text-background text-xs">
        <div className="container mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
          <Link href="/stores" className="flex items-center gap-1 tracking-wide opacity-90 hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-3.5 h-3.5" />
            Barcha do&apos;konlar
          </Link>
          <span className="hidden sm:inline tracking-wide">100% original mahsulotlar</span>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="h-16 lg:h-20 flex items-center gap-4">
          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 -ml-2" aria-label="Menyu">
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href={BASE} className="shrink-0 flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="Boosner" className="h-8 lg:h-9 w-auto object-contain" />
            ) : (
              <>
                <span className="grid place-items-center w-8 h-8 rounded-full border-2 border-foreground font-extrabold text-sm">B</span>
                <span className="text-xl lg:text-2xl font-extrabold tracking-tight text-foreground">BOOSNER</span>
              </>
            )}
          </Link>

          {/* Centered nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-7 mx-auto">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className={cn_(
                  'flex items-center gap-1 text-[15px] font-medium transition-colors hover:text-accent',
                  c.accent ? 'text-accent' : 'text-foreground'
                )}
              >
                {c.label}
                {c.caret && <ChevronDown className="w-4 h-4 opacity-60" />}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 lg:gap-2 ml-auto lg:ml-0">
            <button onClick={() => setSearchOpen((v) => !v)} className="p-2.5 hover:text-accent transition-colors" aria-label="Qidirish">
              <Search className="w-5 h-5" />
            </button>
            {isLoggedIn ? (
              <Link href={`${BASE}/profile`} className="p-2.5 hover:text-accent transition-colors" aria-label="Profil"><User className="w-5 h-5" /></Link>
            ) : (
              <button onClick={() => openLogin()} className="p-2.5 hover:text-accent transition-colors" aria-label="Kirish"><User className="w-5 h-5" /></button>
            )}
            <Link href={`${BASE}/wishlist`} className="relative p-2.5 hover:text-accent transition-colors" aria-label="Sevimlilar">
              <Heart className="w-5 h-5" /><Badge n={wishlistCount} />
            </Link>
            <button onClick={() => openCart()} className="relative p-2.5 hover:text-accent transition-colors" aria-label="Savat">
              <ShoppingBag className="w-5 h-5" /><Badge n={cartCount} />
            </button>
          </div>
        </div>
      </div>

      {/* Search dropdown */}
      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={submitSearch} className="container mx-auto px-4 lg:px-8 py-3 flex gap-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot, brend qidirish..."
              className="flex-1 h-11 px-4 bg-secondary border border-border rounded-full text-sm outline-none focus:border-foreground"
            />
            <button type="submit" className="px-6 h-11 bg-foreground text-background rounded-full text-sm font-medium">Qidirish</button>
          </form>
        </div>
      )}

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 max-w-[80%] bg-background flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <span className="text-xl font-extrabold">BOOSNER</span>
              <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Yopish"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {categories.map((c) => (
                <Link key={c.label} href={c.href} onClick={() => setMenuOpen(false)}
                  className={cn_('py-3 text-base border-b border-border', c.accent ? 'text-accent font-semibold' : 'text-foreground')}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  )
}

function cn_(...c: (string | false)[]) { return c.filter(Boolean).join(' ') }
