'use client'
import { useState, useRef } from 'react'
import { useAuthStore } from '../store/auth'
import { api, setToken } from '@libos/shared'
import styles from './LoginModal.module.css'

type Step = 'phone' | 'otp'

export function LoginModal() {
  const { showLoginModal, closeLogin, login } = useAuthStore()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function formatPhone(raw: string) {
    // faqat raqamlar
    const digits = raw.replace(/\D/g, '')
    return digits.startsWith('998') ? `+${digits}` : digits.length > 0 ? `+998${digits}` : ''
  }

  async function sendOtp() {
    const formatted = formatPhone(phone)
    if (formatted.replace(/\D/g, '').length < 12) {
      setError("Telefon raqamni to'g'ri kiriting")
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.auth.sendOtp(formatted)
      setStep('otp')
    } catch (e: any) {
      setError(e?.message ?? 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    const code = otp.join('')
    if (code.length < 6) { setError("6 raqamli kodni kiriting"); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.auth.verifyOtp(formatPhone(phone), code)
      // If name was provided, update profile before logging in
      let user = res.user
      if (name.trim()) {
        try {
          setToken(res.token)
          user = await api.auth.updateProfile({ name: name.trim() })
        } catch {}
      }
      login(res.token, user)
      setStep('phone')
      setPhone('')
      setName('')
      setOtp(['', '', '', '', '', ''])
    } catch (e: any) {
      setError(e?.message ?? "Kod noto'g'ri")
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function handleClose() {
    closeLogin()
    setStep('phone')
    setError('')
    setPhone('')
    setName('')
    setOtp(['', '', '', '', '', ''])
  }

  if (!showLoginModal) return null

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>Z</div>
          <span className={styles.logoText}>ZYFF</span>
        </div>

        {step === 'phone' ? (
          <>
            <h2 className={styles.heading}>Kirish / Ro'yxatdan o'tish</h2>
            <p className={styles.sub}>Telefon raqamingizni kiriting</p>
            <div className={styles.inputWrap} style={{ marginBottom: '.6rem' }}>
              <span className={styles.prefix}>🇺🇿 +998</span>
              <input
                className={styles.input}
                type="tel"
                placeholder="90 123 45 67"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                autoFocus
              />
            </div>
            <div className={styles.inputWrap}>
              <span className={styles.prefix} style={{ background: 'transparent', border: 'none' }}>👤</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Ismingiz (ixtiyoriy)"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.primaryBtn} onClick={sendOtp} disabled={loading}>
              {loading ? 'Yuborilmoqda...' : 'Kod olish'}
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.heading}>SMS kodi</h2>
            <p className={styles.sub}>
              <button className={styles.back} onClick={() => { setStep('phone'); setError('') }}>← {formatPhone(phone)}</button>
            </p>
            <div className={styles.otpRow}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  className={styles.otpInput}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.primaryBtn} onClick={verifyOtp} disabled={loading}>
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
