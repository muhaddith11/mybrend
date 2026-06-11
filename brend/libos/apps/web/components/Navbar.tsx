'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import styles from './Navbar.module.css'

export function Navbar() {
  const pathname = usePathname()
  const count = useCartStore(s => s.totalCount())
  const openCart = useCartStore(s => s.openCart)
  const { isLoggedIn, user, logout, openLogin } = useAuthStore()

  // Asma do'koni sahifalarida Libos navbarini yashirish
  if (pathname?.startsWith('/store/asma')) return null

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>L</span>
            <span className={styles.logoText}>Li<em>bos</em></span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.nav}>
            <Link href="/?gender=MEN" className={styles.navLink}>👔 Erkaklar</Link>
            <Link href="/?gender=WOMEN" className={styles.navLink}>👗 Ayollar</Link>
            <Link href="/?gender=KIDS" className={styles.navLink}>🧒 Bolalar</Link>
          </nav>

          {/* O'ng qism */}
          <div className={styles.right}>
            <button className={styles.cartBtn} onClick={openCart} aria-label="Savat">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
            </button>

            {isLoggedIn ? (
              <div className={styles.userMenu}>
                <button className={styles.avatarBtn}>
                  {(user?.name ?? user?.phone ?? 'U').charAt(0).toUpperCase()}
                </button>
                <div className={styles.dropdown}>
                  <Link href="/orders" className={styles.dropItem}>📦 Buyurtmalarim</Link>
                  <button className={styles.dropItem} onClick={logout}>🚪 Chiqish</button>
                </div>
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={openLogin}>Kirish</button>
            )}
          </div>
        </div>
      </header>

      {/* Mobil pastki navigatsiya */}
      <nav className={styles.mobileNav}>
        <Link href="/" className={styles.mobileNavItem}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Bosh
        </Link>
        <Link href="/?gender=MEN" className={styles.mobileNavItem}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Erkaklar
        </Link>
        <Link href="/?gender=WOMEN" className={styles.mobileNavItem}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Ayollar
        </Link>
        <button className={styles.mobileNavItem} onClick={openCart}>
          <div style={{ position: 'relative' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -6,
                background: '#ef4444', color: '#fff',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: 'grid', placeItems: 'center',
              }}>{count > 9 ? '9+' : count}</span>
            )}
          </div>
          Savat
        </button>
        {isLoggedIn ? (
          <Link href="/orders" className={styles.mobileNavItem}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Buyurtma
          </Link>
        ) : (
          <button className={styles.mobileNavItem} onClick={openLogin}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Kirish
          </button>
        )}
      </nav>
    </>
  )
}
