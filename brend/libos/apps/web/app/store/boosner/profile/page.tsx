'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Phone, Package, Clock, CheckCircle2, XCircle, AlertCircle, LogOut, ShoppingBag } from 'lucide-react'
import { useStore, formatPrice } from '@/lib/boosner/store'
import { fetchOrdersByPhone, Order, OrderStatus, paymentLabels } from '@/lib/boosner/orders'
import { PhoneAuthModal } from '@/components/boosner/phone-auth-modal'
import { Button } from '@/components/boosner/ui/button'
import { cn } from '@/lib/boosner/utils'

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending:    { label: 'Kutilmoqda',   icon: Clock,         color: 'text-yellow-500' },
  processing: { label: 'Jarayonda',    icon: AlertCircle,   color: 'text-blue-500' },
  completed:  { label: 'Yetkazildi',   icon: CheckCircle2,  color: 'text-green-500' },
  cancelled:  { label: 'Bekor qilindi', icon: XCircle,      color: 'text-destructive' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ProfilePage() {
  const { authPhone, authName, clearAuth } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    if (authPhone) {
      setLoading(true)
      fetchOrdersByPhone(authPhone)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [authPhone])

  if (!authPhone) {
    return (
      <div className="min-h-screen pt-10 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded p-12"
          >
            <Phone className="w-14 h-14 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="text-2xl font-serif text-foreground mb-3">
              Profilga kirish
            </h1>
            <p className="text-muted-foreground mb-8">
              Buyurtma tarixingizni ko&apos;rish uchun telefon raqamingiz bilan kiring.
            </p>
            <Button
              onClick={() => setLoginOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Telefon bilan kirish
            </Button>
          </motion.div>
        </div>
        <PhoneAuthModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-3xl font-serif font-light text-foreground">
              {authName || 'Profil'}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {authPhone}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAuth}
            className="text-muted-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Chiqish
          </Button>
        </motion.div>

        {/* Orders */}
        <div>
          <h2 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Buyurtmalarim ({orders.length})
          </h2>

          {loading && (
            <div className="text-center py-16 text-muted-foreground">
              Yuklanmoqda...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Hali buyurtma berilmagan
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/store/boosner/collection">Xarid qilish</Link>
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((order, i) => {
              const st = statusConfig[order.status]
              const Icon = st.icon
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">Buyurtma #{order.id}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className={cn('flex items-center gap-1.5 text-sm font-medium', st.color)}>
                      <Icon className="w-4 h-4" />
                      {st.label}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-5 space-y-3">
                    {order.items.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-3">
                        <div className="w-12 h-14 bg-muted rounded overflow-hidden shrink-0">
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-serif text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size} · {item.color} · {item.quantity} ta
                          </p>
                          <p className="text-xs text-primary mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {paymentLabels[order.paymentMethod]}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


