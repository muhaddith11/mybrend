'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '../../store/cart'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import { api } from '@libos/shared'
import {
  AddressForm,
  EMPTY_ADDRESS,
  composeAddress,
  isAddressFilled,
  type AddressValue,
} from '../../components/shared/address-form'
import styles from './page.module.css'

// Leaflet faqat brauzerda — SSR'siz dinamik yuklaymiz
const MapPicker = dynamic(
  () => import('../../components/shared/map-picker').then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className={styles.mapLoading}>Xarita yuklanmoqda…</div> },
)

type Delivery = 'DELIVERY' | 'PICKUP'
type Payment = 'CASH' | 'CLICK' | 'PAYME'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearStore } = useCartStore()
  const { isLoggedIn, openLogin } = useAuthStore()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)

  const [delivery, setDelivery] = useState<Delivery>('DELIVERY')
  const [payment, setPayment] = useState<Payment>('CASH')
  const [addr, setAddr] = useState<AddressValue>(EMPTY_ADDRESS)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
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
        <p>{tr.coEmpty}</p>
        <Link href="/" className={styles.backBtn}>{tr.coBack}</Link>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.empty}>
        <p>{tr.coLoginOrder}</p>
        <button className={styles.backBtn} onClick={openLogin}>{tr.login}</button>
      </div>
    )
  }

  async function handleOrder() {
    if (delivery === 'DELIVERY' && !isAddressFilled(addr)) {
      setError(tr.coAddressReq)
      return
    }
    const composedAddress = composeAddress(addr)
    setError('')
    setLoading(true)

    try {
      // Har do'kon → alohida buyurtma. Mijoz har do'kon egasi bilan to'g'ridan-to'g'ri
      // savdo qiladi, shuning uchun savatdagi har do'kon uchun bittadan buyurtma.
      const paymentUrls: string[] = []
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
          address: delivery === 'DELIVERY' ? composedAddress : undefined,
          lat: delivery === 'DELIVERY' ? coords?.lat : undefined,
          lng: delivery === 'DELIVERY' ? coords?.lng : undefined,
          note: note || undefined,
          paymentProvider: payment === 'CASH' ? undefined : payment,
        })

        clearStore(storeId)
        if (payment !== 'CASH' && res.paymentUrl) paymentUrls.push(res.paymentUrl)
      }

      if (paymentUrls.length > 0) {
        // Ketma-ket to'lov: birinchi do'kon to'loviga hozir yo'naltiramiz, qolganlarini
        // navbatga saqlaymiz. Har to'lovdan keyin /checkout/pay-return navbatdagi
        // do'kon to'lovini ochadi; navbat tugaganda /orders ga o'tadi.
        sessionStorage.setItem('zyff_payment_queue', JSON.stringify(paymentUrls.slice(1)))
        window.location.href = paymentUrls[0]
        return
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
      <h1 className={styles.title}>{tr.coTitle}</h1>

      <div className={styles.layout}>
        {/* Form */}
        <div className={styles.form}>
          {/* Delivery type */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{tr.coDeliverySec}</h2>
            <div className={styles.radioGroup}>
              {([
                { id: 'DELIVERY', label: tr.coDeliveryOpt, sub: `+15 000 ${tr.som}` },
                { id: 'PICKUP', label: tr.coPickupOpt, sub: tr.coFree },
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
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AddressForm value={addr} onChange={setAddr} inputClassName={styles.input} />
                {/* Xaritadan aniq joyni belgilash (ixtiyoriy) */}
                <MapPicker
                  initialAddress={addr.mahalla}
                  onAddressSelect={(_a, lat, lng) => setCoords({ lat, lng })}
                />
                {coords && (
                  <p style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                    📍 Joylashuv belgilandi ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{tr.coPayment}</h2>
            <div className={styles.radioGroup}>
              {([
                { id: 'CASH', label: tr.coCash, sub: tr.coCashSub },
                { id: 'CLICK', label: '📱 Click', sub: tr.coOnline },
                { id: 'PAYME', label: '💳 Payme', sub: tr.coOnline },
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
            <h2 className={styles.sectionTitle}>{tr.coNote}</h2>
            <textarea
              className={styles.textarea}
              placeholder={tr.coNotePh}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </section>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.sectionTitle}>{tr.coSummary}</h2>

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
                  <span className={styles.summaryPrice}>{(item.price * item.quantity).toLocaleString()} {tr.som}</span>
                </div>
              ))}
            </div>
          ))}

          <div className={styles.divider} />
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>{tr.coProducts}</span>
              <span>{totalPrice().toLocaleString()} {tr.som}</span>
            </div>
            {DELIVERY_FEE > 0 && (
              <div className={styles.totalRow}>
                <span>{tr.coDeliverySec}</span>
                <span>{DELIVERY_FEE.toLocaleString()} {tr.som}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
              <span>{tr.coTotal}</span>
              <strong>{total.toLocaleString()} {tr.som}</strong>
            </div>
          </div>

          <button
            className={styles.orderBtn}
            onClick={handleOrder}
            disabled={loading}
          >
            {loading ? tr.coSending : payment === 'CASH' ? tr.coTitle : tr.coToPay}
          </button>
        </div>
      </div>
    </div>
  )
}
