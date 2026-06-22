'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import { useLangStore, type Lang } from '../store/lang'
import { useAvatarStore } from '../store/avatar'
import { useT } from '../lib/i18n'
import styles from './ProfileDrawer.module.css'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

const PERSON_EMOJIS = [
  '👤','👦','👧','👨','👩','🧑','👴','👵','🧔','👱','🧕','🦸',
]

// Admin paneli bor do'konlar (do'kon egalari shu yerdan kiradi)
const ADMIN_STORES: { slug: string; name: string; emoji: string }[] = [
  { slug: 'asma', name: 'Asma Design', emoji: '👔' },
  { slug: 'boosner', name: 'Boosner', emoji: '🔥' },
  { slug: 'onepro', name: 'One Pro', emoji: '🧥' },
]

export function ProfileDrawer() {
  const { isLoggedIn, user, logout, openLogin, showProfileDrawer, closeProfile } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const { emoji, setEmoji } = useAvatarStore()
  const tr = useT(lang)
  const [showPicker, setShowPicker] = useState(false)
  const [showOwner, setShowOwner] = useState(false)

  // Drawer ochiq bo'lganda orqa fon (sahifa) scroll'ini bloklash —
  // shunda scroll faqat drawer ichida ishlaydi
  useEffect(() => {
    if (showProfileDrawer) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [showProfileDrawer])

  if (!showProfileDrawer) return null

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
          <button className={styles.closeBtn} onClick={closeProfile}>
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
                <div className={styles.avatarWrap}>
                  <button className={styles.avatarBtn} onClick={() => setShowPicker(true)}>
                    <span className={styles.avatarEmoji}>{emoji}</span>
                    <span className={styles.avatarEdit}>✏️</span>
                  </button>
                </div>
                <div>
                  <div className={styles.userName}>{user?.name ?? tr.user}</div>
                  <div className={styles.userPhone}>{user?.phone}</div>
                </div>
              </div>

              {/* Avatar picker */}
              {showPicker && (
                <div className={styles.pickerCard}>
                  <div className={styles.pickerTitle}>
                    {lang === 'ru' ? 'Выберите аватар' : lang === 'en' ? 'Choose avatar' : 'Avatar tanlang'}
                  </div>
                  <div className={styles.emojiGrid}>
                    {PERSON_EMOJIS.map(e => (
                      <button
                        key={e}
                        className={`${styles.emojiBtn} ${emoji === e ? styles.emojiActive : ''}`}
                        onClick={() => { setEmoji(e); setShowPicker(false) }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu */}
              <div className={styles.section}>
                <Link href="/orders" className={styles.menuItem} onClick={closeProfile}>
                  <span className={styles.menuIcon}>📦</span>
                  <span className={styles.menuLabel}>{tr.myOrders}</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/wishlist" className={styles.menuItem} onClick={closeProfile}>
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

                <div className={styles.menuItem}>
                  <span className={styles.menuIcon}>{dark ? '🌙' : '☀️'}</span>
                  <span className={styles.menuLabel}>{dark ? tr.darkMode : tr.lightMode}</span>
                  <button className={`${styles.toggle} ${dark ? styles.toggleOn : ''}`} onClick={toggle}>
                    <span className={styles.toggleThumb} />
                  </button>
                </div>

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

                {/* Shahar — mobilда city tanlovi navbarда yo'q, shu yerda ko'rsatamiz */}
                <div className={styles.langRow}>
                  <span className={styles.menuIcon}>🏙️</span>
                  <span className={styles.menuLabel}>{tr.cityLabel}</span>
                  <div className={styles.langPills}>
                    <button className={`${styles.langPill} ${styles.langActive}`}>📍 Qo&apos;qon</button>
                  </div>
                </div>
                <div className={styles.citySoonHint}>{tr.otherCitiesSoon}</div>
              </div>

              <button className={styles.logoutBtn} onClick={handleLogout}>
                <span>🚪</span> {tr.logout}
              </button>
            </>
          ) : (
            <div className={styles.guest}>
              <div className={styles.guestIcon}>👤</div>
              <p className={styles.guestText}>{tr.loginToProfile}</p>
              <button className={styles.loginBtn} onClick={handleLoginClick}>{tr.login}</button>
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

          {/* ── Do'kon egasi paneli (har doim ko'rinadi) ── */}
          <div className={styles.section}>
            <button
              className={styles.menuItem}
              onClick={() => setShowOwner(o => !o)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span className={styles.menuIcon}>🏪</span>
              <span className={styles.menuLabel}>
                {lang === 'ru' ? 'Панель владельца магазина' : lang === 'en' ? 'Store owner panel' : "Do'kon egasi paneli"}
              </span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ transform: showOwner ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {showOwner && (
              <div style={{ paddingLeft: 6 }}>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '6px 0 8px 6px' }}>
                  {lang === 'ru' ? 'Выберите свой магазин:' : lang === 'en' ? 'Choose your store:' : "Do'koningizni tanlang:"}
                </p>
                {ADMIN_STORES.map(s => (
                  <Link
                    key={s.slug}
                    href={`/store/${s.slug}/admin/login`}
                    className={styles.menuItem}
                    onClick={closeProfile}
                  >
                    <span className={styles.menuIcon}>{s.emoji}</span>
                    <span className={styles.menuLabel}>{s.name}</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
