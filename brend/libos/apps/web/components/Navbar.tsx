'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { useWishlistStore } from '../store/wishlist'
import { useLangStore } from '../store/lang'
import { useT } from '../lib/i18n'
import styles from './Navbar.module.css'

function NavInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const count = useCartStore(s => s.totalCount())
  const openCart = useCartStore(s => s.openCart)
  const wishlistCount = useWishlistStore(s => s.items.length)
  const { isLoggedIn, user, logout, openLogin, openProfile } = useAuthStore()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const [search, setSearch] = useState('')
  const [cityOpen, setCityOpen] = useState(false)

  if (pathname?.startsWith('/store/asma')) return null

  const gender = searchParams.get('gender')
  const sale = searchParams.get('sale')

  const CATEGORIES = [
    { id: 'ALL',    label: tr.all,         href: '/' },
    { id: 'MEN',    label: tr.men,         href: '/?gender=MEN' },
    { id: 'WOMEN',  label: tr.women,       href: '/?gender=WOMEN' },
    { id: 'KIDS',   label: tr.kids,        href: '/?gender=KIDS' },
    { id: 'SHOES',  label: tr.shoes,       href: '/?gender=MEN&category=shoes' },
    { id: 'ACC',    label: tr.accessories, href: '/?category=accessories' },
    { id: 'SALE',   label: tr.sales,       href: '/?sale=true', red: true },
    { id: 'BRANDS', label: tr.brands,      href: '/stores' },
  ]

  function getActiveId() {
    if (sale) return 'SALE'
    if (gender === 'MEN') return 'MEN'
    if (gender === 'WOMEN') return 'WOMEN'
    if (gender === 'KIDS') return 'KIDS'
    if (pathname === '/stores') return 'BRANDS'
    return 'ALL'
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) router.push(`/?search=${encodeURIComponent(search.trim())}`)
    else router.push('/')
  }

  return (
    <header className={styles.header}>
      {/* Top utility bar */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topInner}`}>
          <span>{tr.deliveryAcross}</span>
          <div className={styles.topRight}>
            <Link href="/open-store" className={styles.topLink}>{tr.openStore}</Link>
            <span className={styles.topDot}>·</span>
            <Link href="/help" className={styles.topLink}>{tr.help}</Link>
            <span className={styles.topDot}>·</span>
            <Link href="/app" className={styles.topLink}>{tr.downloadApp}</Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className={styles.mainBar}>
        <div className={`container ${styles.mainInner}`}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>Z</div>
            <span className={styles.logoText}>ZYFF</span>
          </Link>

          <div className={styles.cityWrap}>
            <button className={styles.cityBtn} onClick={() => setCityOpen(o => !o)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Qo'qon</span>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {cityOpen && (
              <>
                <div className={styles.cityOverlay} onClick={() => setCityOpen(false)} />
                <div className={styles.cityDropdown}>
                  <div className={styles.cityItem} onClick={() => setCityOpen(false)}>
                    <span className={styles.cityCheck}>✓</span> Qo'qon
                  </div>
                  <div className={`${styles.cityItem} ${styles.citySoon}`}>
                    <span className={styles.citySoonBadge}>Tez kunda</span> Toshkent
                  </div>
                  <div className={`${styles.cityItem} ${styles.citySoon}`}>
                    <span className={styles.citySoonBadge}>Tez kunda</span> Farg'ona
                  </div>
                  <div className={`${styles.cityItem} ${styles.citySoon}`}>
                    <span className={styles.citySoonBadge}>Tez kunda</span> Samarqand
                  </div>
                </div>
              </>
            )}
          </div>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                className={styles.searchInput}
                placeholder={tr.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.searchBtn}>{tr.search}</button>
          </form>

          <div className={styles.navRight}>
            <Link href="/wishlist" className={styles.iconBtn}>
              <div className={styles.iconWrap}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
              </div>
              <span className={styles.iconLabel}>{tr.saved}</span>
            </Link>

            <button className={styles.iconBtn} onClick={openCart}>
              <div className={styles.iconWrap}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
              </div>
              <span className={styles.iconLabel}>{tr.cart}</span>
            </button>

            {isLoggedIn ? (
              <button className={styles.iconBtn} onClick={openProfile}>
                <div className={styles.avatar}>
                  {user?.avatar ?? (user?.name ?? user?.phone ?? 'U').charAt(0).toUpperCase()}
                </div>
                <span className={styles.iconLabel}>{tr.profile}</span>
              </button>
            ) : (
              <button className={styles.iconBtn} onClick={openLogin}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={styles.iconLabel}>{tr.login}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className={styles.catBar}>
        <div className={`container ${styles.catInner}`}>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={cat.href}
              className={`${styles.catLink} ${getActiveId() === cat.id ? styles.catActive : ''} ${(cat as any).red ? styles.catRed : ''}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        <Link href="/" className={`${styles.mobileItem} ${pathname === '/' ? styles.mobileActive : ''}`}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>{tr.home}</span>
        </Link>
        <Link href="/stores" className={`${styles.mobileItem} ${pathname === '/stores' ? styles.mobileActive : ''}`}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>{tr.stores}</span>
        </Link>
        <button className={styles.mobileItem} onClick={openCart}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && <span className={styles.mobileBadge}>{count}</span>}
          </div>
          <span>{tr.cart}</span>
        </button>
        {isLoggedIn ? (
          <button className={styles.mobileItem} onClick={openProfile}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{tr.profile}</span>
          </button>
        ) : (
          <button className={styles.mobileItem} onClick={openLogin}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{tr.login}</span>
          </button>
        )}
      </nav>
    </header>
  )
}

export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavInner />
    </Suspense>
  )
}
