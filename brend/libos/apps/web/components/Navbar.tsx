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
  )
}
