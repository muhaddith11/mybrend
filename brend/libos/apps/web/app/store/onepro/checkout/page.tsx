'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, ShoppingBag, Banknote, CreditCard, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore, formatPrice } from '@/lib/onepro/store'
import { createOrder, PaymentMethod } from '@/lib/onepro/orders'
import { Button } from '@/components/onepro/ui/button'
import { Input } from '@/components/onepro/ui/input'
import { cn } from '@/lib/onepro/utils'

// Dynamic import to avoid SSR issues with Leaflet
const MapPicker = dynamic(
  () => import('@/components/onepro/map-picker').then((m) => m.MapPicker),
  { ssr: false, loading: () => (
    <div className="h-[280px] bg-muted rounded border border-border flex items-center justify-center text-muted-foreground text-sm">
      Xarita yuklanmoqda...
    </div>
  )}
)

const paymentOptions: {
  id: PaymentMethod
  label: string
  desc: string
  icon: typeof Banknote
  available: boolean
}[] = [
  { id: 'cash', label: 'Naqd pul', desc: 'Eshik oldida to\'laysiz', icon: Banknote, available: true },
  { id: 'click', label: 'Click', desc: 'Tez kunda', icon: CreditCard, available: false },
  { id: 'payme', label: 'Payme', desc: 'Tez kunda', icon: CreditCard, available: false },
]

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart, authPhone, authName } = useStore()
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showMap, setShowMap] = useState(false)

  // Auto-fill from auth session
  useEffect(() => {
    if (authPhone) {
      setForm((prev) => ({
        ...prev,
        phone: prev.phone || authPhone,
        name: prev.name || authName || '',
      }))
    }
  }, [authPhone, authName])

  const total = getCartTotal()

  const handleMapSelect = (address: string, lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, address }))
    setCoords({ lat, lng })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createOrder({
        customerName: form.name,
        phone: form.phone.replace(/\s/g, ''),
        address: form.address,
        note: form.note,
        items: cart,
        total,
        paymentMethod,
        lat: coords?.lat,
        lng: coords?.lng,
      })
      clearCart()
      setDone(true)
    } catch (err) {
      console.error(err)
      setError("Buyurtmani yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen pt-10 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded p-12"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-serif text-foreground mb-3">
              Buyurtmangiz qabul qilindi!
            </h1>
            <p className="text-muted-foreground mb-8">
              Tez orada operatorlarimiz siz bilan bog&apos;lanadi va buyurtmani tasdiqlaydi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/store/onepro/profile">Buyurtmalarimni ko&apos;rish</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/store/onepro/collection">Xaridni davom ettirish</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-10 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-serif text-foreground mb-3">Savatingiz bo&apos;sh</h1>
          <p className="text-muted-foreground mb-8">
            Buyurtma berish uchun avval savatga mahsulot qo&apos;shing.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/store/onepro/collection">Kolleksiyani ko&apos;rish</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-serif font-light tracking-wider text-foreground mb-12 text-center">
          Buyurtmani rasmiylashtirish
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-2">
              Yetkazib berish ma&apos;lumotlari
            </h2>
            <div>
              <label className="block text-sm text-foreground mb-2">
                Ism familiya <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="To'liq ismingiz"
                className="bg-card border-border h-12"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">
                Telefon raqami <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+998 __ ___ __ __"
                className="bg-card border-border h-12"
              />
            </div>

            {/* Address + Map */}
            <div>
              <label className="block text-sm text-foreground mb-2">
                Manzil <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Shahar, ko'cha, uy raqami"
                className="bg-card border-border h-12 mb-2"
              />

              {/* Map Toggle */}
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {showMap ? 'Xaritani yopish' : 'Xaritadan manzil tanlash'}
                {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <MapPicker
                    onAddressSelect={handleMapSelect}
                    initialAddress={form.address}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Xaritadan uyingizni bosib belgilang — manzil avtomatik to&apos;ldiriladi
                  </p>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Qo'shimcha ma'lumot, ko'cha belgisi..."
                className="w-full px-3 py-2 bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* To'lov usuli */}
            <div>
              <label className="block text-sm tracking-wider uppercase text-muted-foreground mb-3">
                To&apos;lov usuli
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentOptions.map((opt) => {
                  const selected = paymentMethod === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!opt.available}
                      onClick={() => opt.available && setPaymentMethod(opt.id)}
                      className={cn(
                        'relative flex flex-col items-start gap-2 p-4 border rounded text-left transition-colors',
                        !opt.available
                          ? 'border-border opacity-50 cursor-not-allowed'
                          : selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary'
                      )}
                    >
                      <opt.icon className={cn('w-5 h-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {!opt.available && <Clock className="w-3 h-3" />}
                        {opt.desc}
                      </span>
                      {selected && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-sm tracking-wider uppercase"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                'Buyurtmani tasdiqlash'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Hozircha to&apos;lov eshik oldida naqd amalga oshiriladi. Click va Payme tez kunda qo&apos;shiladi.
            </p>
          </form>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded p-6 h-fit">
            <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-6">
              Buyurtma tarkibi
            </h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-4"
                >
                  <div className="relative w-16 h-20 bg-muted rounded overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0] || '/asma/placeholder.jpg'}
                      alt={item.product.nameUz}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-foreground text-sm truncate">
                      {item.product.nameUz}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      O&apos;lcham: {item.size} • Rang: {item.color}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground whitespace-nowrap">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Yetkazib berish</span>
                <span className="text-green-500">Bepul</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-foreground">Jami:</span>
                <span className="text-xl font-serif text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




