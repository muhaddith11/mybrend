'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/boosner/ui/input'
import { Button } from '@/components/boosner/ui/button'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Email yoki parol noto\'g\'ri')
        return
      }
      const { token } = await res.json()
      localStorage.setItem('boosner_admin_token', token)
      router.push('/store/boosner/admin')
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif tracking-[0.2em] text-foreground">BOOSNER</h1>
          <p className="text-xs tracking-wider text-muted-foreground mt-1 uppercase">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded p-6 space-y-4">
          <div>
            <label className="block text-sm text-foreground mb-2">Email</label>
            <Input
              type="text"
              required
              placeholder="boosner@libos.uz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background border-border"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-2">Parol</label>
            <Input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-background border-border"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirish'}
          </Button>
        </form>
      </div>
    </div>
  )
}
