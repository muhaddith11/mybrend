'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// To'lovdan keyin provayder (Click/Payme) shu sahifaga qaytaradi.
// Vazifasi: savatdagi keyingi do'kon to'lovini ochish (ko'p-do'konli buyurtma),
// navbat tugagan bo'lsa — buyurtmalar sahifasiga o'tkazish.
export default function PayReturnPage() {
  const router = useRouter()
  const [done, setDone] = useState(false)

  useEffect(() => {
    let queue: string[] = []
    try {
      queue = JSON.parse(sessionStorage.getItem('zyff_payment_queue') || '[]')
    } catch {
      queue = []
    }

    if (Array.isArray(queue) && queue.length > 0) {
      const [next, ...rest] = queue
      sessionStorage.setItem('zyff_payment_queue', JSON.stringify(rest))
      // Navbatdagi do'kon to'lov sahifasiga yo'naltiramiz
      window.location.href = next
    } else {
      sessionStorage.removeItem('zyff_payment_queue')
      setDone(true)
      router.replace('/orders?success=1')
    }
  }, [router])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem 1rem',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
        {done ? 'Buyurtmalaringizga yo’naltirilmoqda…' : 'To’lov yakunlanmoqda, kuting…'}
      </p>
      <p style={{ color: 'var(--muted-foreground, #888)', fontSize: '0.9rem' }}>
        Iltimos, sahifani yopmang.
      </p>
    </div>
  )
}
