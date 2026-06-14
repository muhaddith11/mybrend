'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '../../store/cart'
import { useAuthStore } from '../../store/auth'
import { api } from '@libos/shared'
import styles from './page.module.css'

type Delivery = 'DELIVERY' | 'PICKUP'
type Payment = 'CASH' | 'CLICK' | 'PAYME'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearStore } = useCartStore()
  const { isLoggedIn, openLogin } = useAuthStore()

  const [delivery, setDelivery] = useState<Delivery>('DELIVERY')
  const [payment, setPayment] = useState<Payment>('CASH')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // itemsByStore() ni selektor ichida chaqirmaymiz — u har renderda yangi obyekt
  // qaytarib useSyncExternalStore'da cheksiz loop / crash keltirib chiqaradi.
  // O'rniga barqaror `items` ustidan useMemo bilan hisoblaymiz.
  const byStore = useMemo(() => {
    const r: Record<string, typeof items> = {}
    for (const item of items) {
      if (!r[item.storeId]) r[item.storeId] = []
      r[item.storeId].push(item)
    }
    return r
  }, [items])
  const storeIds = Object.keys(byStore)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Savat bo'sh</p>
        <Link href="/" className={styles.backBtn}>Do'konlarga qaytish</Link>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.empty}>
        <p>Buyurtma berish uchun kiring</p>
        <button className={styles.backBtn} onClick={openLogin}>Kirish</button>
      </div>
    )
  }

  async function handleOrder() {
    if (delivery === 'DELIVERY' && !address.trim()) {
      setError("Manzilni kiriting")
      return
    }
    setError('')
    setLoading(true)

    try {
      // Each store → separate order
      for (const storeId of storeIds) {
        const storeItems = byStore[storeId]
        const orderItems = storeItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        }))

        const res = await api.orders.create({
          storeId,
          items: orderItems,
          deliveryType: delivery,
          address: delivery === 'DELIVERY' ? address : undefined,
          note: note || undefined,
          paymentProvider: payment === 'CASH' ? undefined : payment,
        })

        if (payment !== 'CASH' && res.paymentUrl) {
          // Redirect to payment
          clearStore(storeId)
          window.location.href = res.paymentUrl
          return
        }

        clearStore(storeId)
      }

      router.push('/orders?success=1')
    } catch (e: any) {
      setError(e?.message ?? 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const DELIVERY_FEE = delivery === 'DELIVERY' ? 15000 : 0
  const total = totalPrice() + DELIVERY_FEE

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      <h1 className={styles.title}>Buyurtma berish</h1>

      <div className={styles.layout}>
        {/* Form */}
        <div className={styles.form}>
          {/* Delivery type */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Yetkazib berish</h2>
            <div className={styles.radioGroup}>
              {([
                { id: 'DELIVERY', label: '🚚 Yetkazib berish', sub: '+15 000 so\'m' },
                { id: 'PICKUP', label: '🏪 O\'z olib ketish', sub: 'Bepul' },
              ] as const).map(o => (
                <label key={o.id} className={`${styles.radio} ${delivery === o.id ? styles.radioActive : ''}`}>
                  <input type="radio" value={o.id} checked={delivery === o.id} onChange={() => setDelivery(o.id)} />
                  <div>
                    <p className={styles.radioLabel}>{o.label}</p>
                    <p className={styles.radioSub}>{o.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            {delivery === 'DELIVERY' && (
              <input
                className={styles.input}
                placeholder="Manzilni kiriting (ko'cha, uy raqami)"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            )}
          </section>

          {/* Payment */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>To'lov usuli</h2>
            <div className={styles.radioGroup}>
              {([
                { id: 'CASH', label: '💵 Naqd pul', sub: 'Eshikda to\'lash' },
                { id: 'CLICK', label: '📱 Click', sub: 'Online to\'lov' },
                { id: 'PAYME', label: '💳 Payme', sub: 'Online to\'lov' },
              ] as const).map(o => (
                <label key={o.id} className={`${styles.radio} ${payment === o.id ? styles.radioActive : ''}`}>
                  <input type="radio" value={o.id} checked={payment === o.id} onChange={() => setPayment(o.id)} />
                  <div>
                    <p className={styles.radioLabel}>{o.label}</p>
                    <p className={styles.radioSub}>{o.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Note */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Izoh (ixtiyoriy)</h2>
            <textarea
              className={styles.textarea}
              placeholder="Qo'shimcha izoh..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </section>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.sectionTitle}>Buyurtma</h2>

          {storeIds.map(sid => (
            <div key={sid} className={styles.storeSection}>
              <p className={styles.storeName}>{byStore[sid][0].storeName}</p>
              {byStore[sid].map(item => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className={styles.summaryItem}>
                  <span className={styles.summaryName}>{item.name}</span>
                  {(item.size || item.color) && (
                    <span className={styles.summaryVariant}>{[item.size, item.color].filter(Boolean).join(', ')}</span>
                  )}
                  <span className={styles.summaryQty}>×{item.quantity}</span>
                  <span className={styles.summaryPrice}>{(item.price * item.quantity).toLocaleString()} so'm</span>
                </div>
              ))}
            </div>
          ))}

          <div className={styles.divider} />
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Mahsulotlar</span>
              <span>{totalPrice().toLocaleString()} so'm</span>
            </div>
            {DELIVERY_FEE > 0 && (
              <div className={styles.totalRow}>
                <span>Yetkazib berish</span>
                <span>{DELIVERY_FEE.toLocaleString()} so'm</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
              <span>Jami</span>
              <strong>{total.toLocaleString()} so'm</strong>
            </div>
          </div>

          <button
            className={styles.orderBtn}
            onClick={handleOrder}
            disabled={loading}
          >
            {loading ? 'Yuborilmoqda...' : payment === 'CASH' ? 'Buyurtma berish' : 'To\'lovga o\'tish'}
          </button>
        </div>
      </div>
    </div>
  )
}
