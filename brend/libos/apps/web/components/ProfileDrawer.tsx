'use client'
import Link from 'next/link'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import { useLangStore, type Lang } from '../store/lang'
import { useT } from '../lib/i18n'
import styles from './ProfileDrawer.module.css'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

export function ProfileDrawer() {
  const { isLoggedIn, user, logout, openLogin, showProfileDrawer, closeProfile } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const tr = useT(lang)

  if (!showProfileDrawer) return null

  const initial = (user?.name ?? user?.phone ?? 'U').charAt(0).toUpperCase()

  function handleLogout() {
    logout()
    closeProfile()
  }

  function handleLoginClick() {
    closeProfile()
    openLogin()
  }

  return (
    <>
      <div className={`${styles.overlay} ${showProfileDrawer ? styles.visible : ''}`} onClick={closeProfile} />
      <aside className={`${styles.panel} ${showProfileDrawer ? styles.open : ''}`}>

        {/* Header */}
        <div className={styles.head}>
          <span className={styles.headTitle}>{tr.profile}</span>
          <button className={styles.closeBtn} onClick={closeProfile} aria-label="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {isLoggedIn ? (
            <>
              {/* User card */}
              <div className={styles.userCard}>
                <div className={styles.avatar}>{initial}</div>
                <div>
                  <div className={styles.userName}>{user?.name ?? tr.user}</div>
                  <div className={styles.userPhone}>{user?.phone}</div>
                </div>
              </div>

              {/* Menu */}
              <div className={styles.section}>
                <Link href="/orders" className={styles.menuItem} onClick={closeProfile}>
                  <span className={styles.menuIcon}>📦</span>
                  <span className={styles.menuLabel}>{tr.myOrders}</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/?sale=true" className={styles.menuItem} onClick={closeProfile}>
                  <span className={styles.menuIcon}>❤️</span>
                  <span className={styles.menuLabel}>{tr.wishlist}</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Settings */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>{tr.settings}</div>

                {/* Dark mode */}
                <div className={styles.menuItem}>
                  <span className={styles.menuIcon}>{dark ? '🌙' : '☀️'}</span>
                  <span className={styles.menuLabel}>{dark ? tr.darkMode : tr.lightMode}</span>
                  <button
                    className={`${styles.toggle} ${dark ? styles.toggleOn : ''}`}
                    onClick={toggle}
                    aria-label="toggle dark mode"
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>

                {/* Language */}
                <div className={styles.langRow}>
                  <span className={styles.menuIcon}>🌐</span>
                  <span className={styles.menuLabel}>{tr.language}</span>
                  <div className={styles.langPills}>
                    {LANGS.map(l => (
                      <button
                        key={l.code}
                        className={`${styles.langPill} ${lang === l.code ? styles.langActive : ''}`}
                        onClick={() => setLang(l.code)}
                      >
                        <span>{l.flag}</span>
                        <span>{l.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <span>🚪</span> {tr.logout}
              </button>
            </>
          ) : (
            /* Guest state */
            <div className={styles.guest}>
              <div className={styles.guestIcon}>👤</div>
              <p className={styles.guestText}>{tr.loginToProfile}</p>
              <button className={styles.loginBtn} onClick={handleLoginClick}>{tr.login}</button>

              {/* Language even for guests */}
              <div className={styles.guestLang}>
                <div className={styles.langPills}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      className={`${styles.langPill} ${lang === l.code ? styles.langActive : ''}`}
                      onClick={() => setLang(l.code)}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
