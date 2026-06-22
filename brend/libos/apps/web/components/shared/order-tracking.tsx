'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Clock, Loader2, PackageX } from 'lucide-react'
import { formatPrice } from '@/lib/createStoreState'
import {
  type TrackedOrder,
  trackStatusSteps,
  trackStatusLabels,
} from '@/lib/createOrdersApi'

interface OrderTrackingProps {
  slug: string
  orderId: string
  /** Brendga bog'langan (lekin auth'siz) kuzatuv funksiyasi. */
  fetchOrderById: (id: string) => Promise<TrackedOrder | null>
}

export function OrderTracking({ slug, orderId, fetchOrderById }: OrderTrackingProps) {
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchOrderById(orderId)
      .then((o) => {
        if (active) {
          setOrder(o)
          setLoading(false)
        }
      })
      .catch(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [orderId, fetchOrderById])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-serif text-foreground">Buyurtma topilmadi</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Havola noto&apos;g&apos;ri yoki buyurtma o&apos;chirilgan bo&apos;lishi mumkin.
        </p>
        <Link href={`/store/${slug}`} className="text-sm text-primary underline underline-offset-4">
          Do&apos;konga qaytish
        </Link>
      </div>
    )
  }

  const cancelled = order.status === 'CANCELLED'
  const currentIdx = trackStatusSteps.indexOf(order.status)

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 lg:py-16">
      {/* Sarlavha */}
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Buyurtma kuzatuvi</p>
        <h1 className="mt-2 text-2xl font-serif text-foreground lg:text-3xl">
          #{order.id.slice(-6).toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Holat */}
      {cancelled ? (
        <div className="mb-8 flex items-center justify-center gap-2 rounded border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          <PackageX className="h-5 w-5" />
          <span className="font-medium">Buyurtma bekor qilindi</span>
        </div>
      ) : (
        <ol className="mb-10 space-y-4">
          {trackStatusSteps.map((step, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </span>
                <span className={`text-sm ${active ? 'font-medium text-foreground' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {trackStatusLabels[step]}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      {/* Mahsulotlar */}
      <div className="space-y-3 border-t border-border pt-6">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.product.images?.[0] || `/${slug}/placeholder.jpg`}
              alt=""
              className="h-16 w-14 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{it.product.nameUz || it.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {[it.size, it.color].filter(Boolean).join(' · ')}
                {it.size || it.color ? ' · ' : ''}{it.quantity} dona
              </p>
            </div>
            <span className="shrink-0 text-sm text-foreground">{formatPrice(it.price * it.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Jami */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-muted-foreground">Jami</span>
        <span className="text-lg font-serif text-primary">{formatPrice(order.totalPrice)}</span>
      </div>

      {order.address && (
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="text-foreground">Manzil:</span> {order.address}
        </p>
      )}

      <div className="mt-8 text-center">
        <Link href={`/store/${slug}`} className="text-sm text-primary underline underline-offset-4">
          Do&apos;konga qaytish
        </Link>
      </div>
    </div>
  )
}
