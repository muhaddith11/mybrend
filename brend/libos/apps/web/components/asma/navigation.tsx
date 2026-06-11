'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Heart, Search, User, ArrowRight, LogIn } from 'lucide-react'
import { useStore, formatPrice } from '@/lib/asma/store'
import { fetchProducts } from '@/lib/asma/products'
import { PhoneAuthModal } from '@/components/asma/phone-auth-modal'
import { cn } from '@/lib/asma/utils'

const BASE = '/store/asma'
const navLinks = [
  { href: `${BASE}/collection`, label: 'Kolleksiya' },
  { href: `${BASE}/lookbook`, label: 'Lookbook' },
  { href: `${BASE}/about`, label: 'Biz haqimizda' },
  { href: `${BASE}/contact`, label: 'Aloqa' },
]

export function Navigation() {
  const pathname = usePathname()
  const isHomePage = pathname === '/store/asma'
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Awaited<ReturnType<typeof fetchProducts>>>([])
  const [loginOpen, setLoginOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isMenuOpen, setMenuOpen, setCartOpen, getCartCount, wishlist, authPhone } = useStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      fetchProducts().then(setAllProducts).catch(() => {})
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
    }
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const searchResults = searchQuery.trim().length > 1
    ? allProducts.filter((p) =>
        p.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : []

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'top-0 bg-background/95 backdrop-blur-md border-b border-border'
            : isHomePage
              ? 'top-10 bg-transparent'
              : 'top-10 bg-background/95 backdrop-blur-md border-b border-border'
        )}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Mobile menu + Logo */}
            <div className="flex items-center gap-1 lg:gap-0">
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-3 -ml-3 text-foreground hover:text-primary transition-colors"
                aria-label="Menyuni ochish"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/store/asma" className="flex flex-col group">
                <motion.span
                  className="text-2xl lg:text-3xl font-serif font-light tracking-[0.3em] text-foreground leading-none"
                  whileHover={{ letterSpacing: '0.4em' }}
                  transition={{ duration: 0.3 }}
                >
                  ASMA
                </motion.span>
                <span className="text-[10px] tracking-[0.5em] text-primary font-sans uppercase mt-1">
                  Design
                </span>
              </Link>
            </div>

            {/* Center-right: Desktop nav links */}
            <div className="hidden lg:flex items-center gap-8 ml-auto mr-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-[0.2em] uppercase text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center justify-center w-11 h-11 text-foreground/80 hover:text-primary transition-colors"
                aria-label="Qidirish"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/store/asma/wishlist"
                className="relative flex items-center justify-center w-11 h-11 text-foreground/80 hover:text-primary transition-colors"
                aria-label="Istaklar ro'yxati"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center w-11 h-11 text-foreground/80 hover:text-primary transition-colors"
                aria-label="Savat"
              >
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
              {authPhone ? (
                <Link
                  href="/store/asma/profile"
                  className="relative hidden lg:flex items-center justify-center w-11 h-11 text-foreground/80 hover:text-primary transition-colors"
                  aria-label="Profil"
                >
                  <User className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                </Link>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="hidden lg:flex items-center justify-center w-11 h-11 text-foreground/80 hover:text-primary transition-colors"
                  aria-label="Kirish"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      <PhoneAuthModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50"
          >
            <div className="container mx-auto px-4 lg:px-8 pt-8">
              {/* Search Input */}
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mahsulot qidirish..."
                  className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Results */}
              <div className="mt-6">
                {searchQuery.trim().length <= 1 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Qidirish uchun kamida 2 ta harf kiriting
                  </p>
                )}
                {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    &quot;{searchQuery}&quot; bo&apos;yicha hech narsa topilmadi
                  </p>
                )}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                      {searchResults.length} ta natija
                    </p>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/store/asma/product/${product.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 p-3 rounded hover:bg-muted transition-colors group"
                      >
                        <div className="relative w-14 h-18 bg-muted rounded overflow-hidden shrink-0" style={{ height: '72px' }}>
                          <Image
                            src={product.images[0] || '/asma/placeholder.jpg'}
                            alt={product.nameUz}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-foreground group-hover:text-primary transition-colors truncate">
                            {product.nameUz}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    ))}
                    <Link
                      href="/store/asma/collection"
                      onClick={() => setSearchOpen(false)}
                      className="block text-center text-sm text-primary hover:underline py-4"
                    >
                      Barcha mahsulotlarni ko&apos;rish →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-background z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="text-xl font-serif tracking-[0.2em]">MENYU</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-3 text-foreground hover:text-primary transition-colors"
                  aria-label="Menyuni yopish"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col justify-center p-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-4 text-2xl font-serif tracking-[0.1em] text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="p-8 border-t border-border">
                <Link
                  href="/store/asma/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm tracking-wider uppercase">Admin panel</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}


