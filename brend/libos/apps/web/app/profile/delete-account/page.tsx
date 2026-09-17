'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@libos/shared'
import { useAuthStore } from '../../../store/auth'
import { useLangStore } from '../../../store/lang'
import { useT } from '../../../lib/i18n'
import styles from './page.module.css'

const CODE_LENGTH = 6

type Step = 'warn' | 'code'

// Hisobni butunlay o'chirish — mobil ilova (app/auth/delete-account.tsx) bilan
// bir xil ikki bosqichli oqim: ogohlantirish → SMS kod tasdig'i.
export default function DeleteAccountPage() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { user, isLoggedIn, logout } = useAuthStore()

  const [step, setStep] = useState<Step>('warn')
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  async function handleSendCode() {
    if (!user?.phone) return
    setLoading(true)
    setError('')
    try {
      await api.auth.sendOtp(user.phone, 'delete')
      setStep('code')
    } catch (e: any) {
      setError(e?.message ?? 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    setError('')
    if (digit && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
    if (digit && i === CODE_LENGTH - 1) {
      const full = next.join('')
      if (full.length === CODE_LENGTH) confirmDelete(full)
    }
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  async function confirmDelete(fullCode?: string) {
    const codeStr = fullCode ?? code.join('')
    if (codeStr.length < CODE_LENGTH) {
      setError(tr.mEnter6)
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.auth.deleteAccount(codeStr)
      logout()
      alert(tr.mDeleteDoneMsg)
      router.replace('/')
    } catch (e: any) {
      setError(e?.message ?? tr.mWrongCode)
      setCode(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => router.back()}>← {tr.mCancel}</button>
        <p className={styles.subtitle}>{tr.loginToProfile}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => router.back()}>← {tr.mCancel}</button>

      {step === 'warn' ? (
        <>
          <div className={styles.iconWrap}>⚠️</div>
          <h1 className={styles.title}>{tr.mDeleteAccount}</h1>
          <p className={styles.subtitle}>{tr.mDeleteWarnSub}</p>

          <div className={styles.list}>
            <p className={styles.listItem}>• {tr.mDelB1}</p>
            <p className={styles.listItem}>• {tr.mDelB2}</p>
            <p className={styles.listItem}>• {tr.mDelB3}</p>
            <p className={styles.listItem}>• {tr.mDelB4}</p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.dangerBtn} onClick={handleSendCode} disabled={loading}>
            {loading ? '...' : tr.mSendCode}
          </button>
          <button className={styles.cancelBtn} onClick={() => router.back()}>{tr.mCancel}</button>
        </>
      ) : (
        <>
          <div className={styles.iconWrap}>💬</div>
          <h1 className={styles.title}>{tr.mEnterSmsCode}</h1>
          <p className={styles.subtitle}>
            <span className={styles.phone}>{user?.phone}</span>
            {' '}{tr.mCodeSentSuffix}
          </p>

          <div className={styles.codeRow}>
            {code.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                className={`${styles.codeBox} ${d ? styles.codeBoxFilled : ''} ${error ? styles.codeBoxError : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.dangerBtn}
            onClick={() => confirmDelete()}
            disabled={loading || code.join('').length < CODE_LENGTH}
          >
            {loading ? '...' : tr.mDeleteAccount}
          </button>
        </>
      )}
    </div>
  )
}
