'use client'
import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@libos/shared'
import type { Order } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import styles from './page.module.css'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Kutilmoqda',      color: '#f59e0b' },
  CONFIRMED:  { label: 'Tasdiqlangan',    color: '#3b82f6' },
  PREPARING:  { label: 'Tayyorlanmoqda',  color: '#8b5cf6' },
  SHIPPED:    { label: 'Yetkazilmoqda',   color: '#06b6d4' },
  DELIVERED:  { label: 'Yetkazildi',      color: '#16a34a' },
  CANCELLED:  { label: 'Bekor qilindi',   color: '#ef4444' },
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Yuklanmoqda...</div>}>
      <OrdersContent />
    </Suspense>
  )
}

function OrdersContent() {
  const { isLoggedIn, openLogin } = useAuthStore()
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === '1'

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.orders.myOrders(),
    enabled: isLoggedIn,
  })

  const orders: Order[] = data?.orders ?? []

  if (!isLoggedIn) {
    return (
      <div className={styles.center}>
        <p>Buyurtmalarni ko'rish uchun kiring</p>
        <button className={styles.loginBtn} onClick={openLogin}>Kirish</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      <h1 className={styles.title}>Buyurtmalarim</h1>

      {success && (
        <div className={styles.successBanner}>
          ✓ Buyurtmangiz qabul qilindi! Do'kon tez orada siz bilan bog'lanadi.
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Yuklanmoqda...</div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <p>Buyurtmalar yo'q</p>
          <Link href="/" className={styles.shopBtn}>Do'konlarga o'tish</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_LABEL[order.status] ?? { label: order.status, color: '#888' }
  const total = (order.items ?? []).reduce((s: number, i: any) => s + i.price * i.quantity, 0)

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHead}>
        <div>
          <p className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</p>
          <p className={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <span className={styles.badge} style={{ background: `${status.color}20`, color: status.color }}>
          {status.label}
        </span>
      </div>

      {/* Store */}
      {order.store && (
        <Link href={`/store/${order.store.slug}`} className={styles.storeName}>
          🏪 {order.store.name}
        </Link>
      )}

      {/* Items */}
      <div className={styles.items}>
        {(order.items ?? []).map((item: any, i: number) => (
          <div key={i} className={styles.item}>
            <span className={styles.itemName}>{item.product?.name ?? 'Mahsulot'}</span>
            {(item.size || item.color) && (
              <span className={styles.itemVariant}>{[item.size, item.color].filter(Boolean).join(' · ')}</span>
            )}
            <span className={styles.itemQty}>×{item.quantity}</span>
            <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} so'm</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.cardFoot}>
        <div className={styles.delivery}>
          {order.deliveryType === 'DELIVERY' ? '🚚 Yetkazib berish' : '🏪 O\'z olib ketish'}
          {order.address && <span> — {order.address}</span>}
        </div>
        <strong className={styles.total}>{total.toLocaleString()} so'm</strong>
      </div>

      {/* Progress bar */}
      <OrderProgress status={order.status} />
    </div>
  )
}

const STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

function OrderProgress({ status }: { status: string }) {
  if (status === 'CANCELLED') return null
  const idx = STEPS.indexOf(status)

  return (
    <div className={styles.progress}>
      {STEPS.map((s, i) => (
        <div key={s} className={`${styles.step} ${i <= idx ? styles.stepDone : ''}`}>
          <div className={styles.stepDot} />
          {i < STEPS.length - 1 && <div className={styles.stepLine} />}
          <span className={styles.stepLabel}>{STATUS_LABEL[s]?.label}</span>
        </div>
      ))}
    </div>
  )
}
