'use client'
import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@libos/shared'
import type { Order } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from './page.module.css'

// MUHIM: kalitlar backend OrderStatus enum'iga AYNAN mos kelishi shart
// (DELIVERING — ilgari xato 'SHIPPED' edi, shu sababli yetkazilayotgan buyurtma
// holati noto'g'ri ko'rsatilardi).
const STATUS_META: Record<string, { trKey: string; color: string }> = {
  PENDING:    { trKey: 'stPending',    color: '#f59e0b' },
  CONFIRMED:  { trKey: 'stConfirmed',  color: '#3b82f6' },
  PREPARING:  { trKey: 'stPreparing',  color: '#8b5cf6' },
  DELIVERING: { trKey: 'stDelivering', color: '#06b6d4' },
  DELIVERED:  { trKey: 'stDelivered',  color: '#16a34a' },
  CANCELLED:  { trKey: 'stCancelled',  color: '#ef4444' },
}

// Bosqichlar yetkazish turiga qarab (PICKUP qisqaroq: Qabul → Tasdiq → Olib ketildi)
function stepsFor(deliveryType?: string): string[] {
  return deliveryType === 'PICKUP'
    ? ['PENDING', 'CONFIRMED', 'DELIVERED']
    : ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED']
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
  const tr = useT(useLangStore(s => s.lang))
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
        <p>{tr.orLoginView}</p>
        <button className={styles.loginBtn} onClick={openLogin}>{tr.login}</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      <h1 className={styles.title}>{tr.ordMine}</h1>

      {success && (
        <div className={styles.successBanner}>
          {tr.ordSuccess}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>{tr.loading}</div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <p>{tr.noOrders}</p>
          <Link href="/" className={styles.shopBtn}>{tr.goShopping}</Link>
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
  const tr = useT(useLangStore(s => s.lang))
  const meta = STATUS_META[order.status]
  const statusColor = meta?.color ?? '#888'
  const isPickup = order.deliveryType === 'PICKUP'
  // PICKUP buyurtmasi yetkazilganda "Olib ketildi" deb ko'rsatamiz (DELIVERED enum'i)
  const statusLabel = meta
    ? isPickup && order.status === 'DELIVERED'
      ? (tr as Record<string, string>).stPickedUp
      : (tr as Record<string, string>)[meta.trKey]
    : order.status
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
        <span className={styles.badge} style={{ background: `${statusColor}20`, color: statusColor }}>
          {statusLabel}
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
            <span className={styles.itemName}>{item.product?.name ?? tr.ordProduct}</span>
            {(item.size || item.color) && (
              <span className={styles.itemVariant}>{[item.size, item.color].filter(Boolean).join(' · ')}</span>
            )}
            <span className={styles.itemQty}>×{item.quantity}</span>
            <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} {tr.som}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.cardFoot}>
        <div className={styles.delivery}>
          {order.deliveryType === 'DELIVERY' ? tr.coDeliveryOpt : tr.coPickupOpt}
          {order.address && <span> — {order.address}</span>}
        </div>
        <strong className={styles.total}>{total.toLocaleString()} {tr.som}</strong>
      </div>

      {/* Progress bar */}
      <OrderProgress status={order.status} deliveryType={order.deliveryType} />
    </div>
  )
}

function OrderProgress({ status, deliveryType }: { status: string; deliveryType?: string }) {
  const tr = useT(useLangStore(s => s.lang)) as Record<string, string>
  if (status === 'CANCELLED') return null
  const isPickup = deliveryType === 'PICKUP'
  const steps = stepsFor(deliveryType)
  const idx = steps.indexOf(status)

  return (
    <div className={styles.progress}>
      {steps.map((s, i) => {
        const label = isPickup && s === 'DELIVERED' ? tr.stPickedUp : tr[STATUS_META[s]?.trKey ?? '']
        return (
          <div key={s} className={`${styles.step} ${i <= idx ? styles.stepDone : ''}`}>
            <div className={styles.stepDot} />
            {i < steps.length - 1 && <div className={styles.stepLine} />}
            <span className={styles.stepLabel}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
