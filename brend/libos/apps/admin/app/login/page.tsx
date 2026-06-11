'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const { token } = await res.json()
      localStorage.setItem('admin_token', token)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message ?? 'Xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoMark}>L</div>
          <span style={s.logoText}>Li<span style={{ color: '#534AB7' }}>bos</span> Admin</span>
        </div>
        <form onSubmit={handleLogin} style={s.form}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@libos.uz" required />
          <label style={s.label}>Parol</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
        <p style={s.hint}>Test: zara@libos.uz / secret123</p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0efff' },
  card: { background: '#fff', borderRadius: 20, padding: '40px 36px', width: 380, boxShadow: '0 4px 40px rgba(83,74,183,0.1)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoMark: { width: 38, height: 38, background: '#3C3489', borderRadius: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 },
  logoText: { fontSize: 22, fontWeight: 600, color: '#1a1a1a' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 2 },
  input: { padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', color: '#1a1a1a' },
  error: { fontSize: 13, color: '#ef4444', margin: '4px 0' },
  btn: { marginTop: 8, padding: '13px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  hint: { marginTop: 20, fontSize: 12, color: '#aaa', textAlign: 'center' },
}
