'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useAuthStore } from '../../store/auth'
import { useThemeStore } from '../../store/theme'
import { useLangStore, type Lang } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from './page.module.css'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  )
}

function ProfileContent() {
  const { isLoggedIn, user, logout, openLogin } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const tr = useT(lang)

  if (!isLoggedIn) {
    return (
      <div className={styles.center}>
        <div className={styles.avatar}>👤</div>
        <p className={styles.guestText}>{tr.loginToProfile}</p>
        <button className={styles.loginBtn} onClick={openLogin}>{tr.login}</button>
      </div>
    )
  }

  const initial = (user?.name ?? user?.phone ?? 'U').charAt(0).toUpperCase()

  return (
    <div className={styles.page}>
      {/* Profile header */}
      <div className={styles.header}>
        <div className={styles.avatarCircle}>{initial}</div>
        <div>
          <div className={styles.name}>{user?.name ?? tr.user}</div>
          <div className={styles.phone}>{user?.phone}</div>
        </div>
      </div>

      {/* Menu */}
      <div className={styles.section}>
        <Link href="/orders" className={styles.menuItem}>
          <span className={styles.menuIcon}>📦</span>
          <span className={styles.menuLabel}>{tr.myOrders}</span>
          <svg className={styles.menuArrow} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <Link href="/?sale=true" className={styles.menuItem}>
          <span className={styles.menuIcon}>❤️</span>
          <span className={styles.menuLabel}>{tr.wishlist}</span>
          <svg className={styles.menuArrow} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Settings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{tr.settings}</div>

        {/* Dark mode toggle */}
        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>{dark ? '🌙' : '☀️'}</span>
          <span className={styles.menuLabel}>{dark ? tr.darkMode : tr.lightMode}</span>
          <button className={`${styles.toggle} ${dark ? styles.toggleOn : ''}`} onClick={toggle}>
            <span className={styles.toggleThumb} />
          </button>
        </div>

        {/* Language selector */}
        <div className={styles.langItem}>
          <span className={styles.menuIcon}>🌐</span>
          <span className={styles.menuLabel}>{tr.language}</span>
          <div className={styles.langBtns}>
            {LANGS.map(l => (
              <button
                key={l.code}
                className={`${styles.langBtn} ${lang === l.code ? styles.langActive : ''}`}
                onClick={() => setLang(l.code)}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className={styles.section}>
        <button className={styles.logoutBtn} onClick={logout}>
          <span>🚪</span> {tr.logout}
        </button>
      </div>
    </div>
  )
}
