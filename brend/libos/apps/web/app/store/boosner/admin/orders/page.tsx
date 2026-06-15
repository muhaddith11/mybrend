'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Phone, MapPin, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/boosner/store'
import { fetchOrders, updateOrderStatus, Order, OrderStatus, paymentLabels } from '@/lib/boosner/orders'
import { Input } from '@/components/boosner/ui/input'
import { cn } from '@/lib/boosner/utils'

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Kutilmoqda', color: 'bg-yellow-500/10 text-yellow-500' },
  processing: { label: 'Jarayonda', color: 'bg-blue-500/10 text-blue-500' },
  completed: { label: 'Bajarildi', color: 'bg-green-500/10 text-green-500' },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-500/10 text-red-500' },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      setOrders(await fetchOrders())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function changeStatus(id: string, status: OrderStatus) {
    setUpdatingId(id)
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      String(order.id).includes(q) || order.customerName.toLowerCase().includes(q)
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">
          Buyurtmalar
        </h1>
        <p className="text-muted-foreground">
          Jami {orders.length} ta buyurtma
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buyurtma raqami yoki mijoz qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={cn(
              'px-4 py-2 text-sm whitespace-nowrap border rounded transition-colors',
              selectedStatus === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary'
            )}
          >
            Barchasi
          </button>
          {(Object.entries(statusConfig) as [OrderStatus, { label: string }][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={cn(
                  'px-4 py-2 text-sm whitespace-nowrap border rounded transition-colors',
                  selectedStatus === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary'
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Yuklanmoqda...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="bg-card border border-border rounded overflow-hidden"
            >
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-4 lg:p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground">#{order.id}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] uppercase tracking-wider',
                          statusConfig[order.status].color
                        )}
                      >
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.items.length} ta mahsulot
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-muted-foreground transition-transform',
                      expandedOrder === order.id && 'rotate-180'
                    )}
                  />
                </div>
              </button>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-border"
                >
                  <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h3 className="text-sm tracking-wider uppercase text-muted-foreground mb-3">
                        Mijoz ma&apos;lumotlari
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <a
                          href={`tel:${order.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {order.phone}
                        </a>
                        <p className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          {order.address}
                        </p>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div>
                      <h3 className="text-sm tracking-wider uppercase text-muted-foreground mb-3">
                        Buyurtma tafsilotlari
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sana:</span>
                          <span className="text-foreground">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">To&apos;lov:</span>
                          <span className="text-foreground">{paymentLabels[order.paymentMethod]}</span>
                        </div>
                        {order.note && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground shrink-0">Izoh:</span>
                            <span className="text-foreground text-right">{order.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="p-4 lg:p-6 border-t border-border">
                    <h3 className="text-sm tracking-wider uppercase text-muted-foreground mb-4">
                      Mahsulotlar
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              O&apos;lcham: {product.size} • Rang: {product.color} • {product.quantity} dona
                            </p>
                          </div>
                          <p className="font-medium text-foreground">
                            {formatPrice(product.price * product.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                      <span className="font-medium text-foreground">Jami:</span>
                      <span className="text-xl font-serif text-primary">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 lg:p-6 border-t border-border bg-muted/30 flex flex-wrap gap-3">
                    {updatingId === order.id ? (
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Yangilanmoqda...
                      </span>
                    ) : (
                      <>
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => changeStatus(order.id, 'processing')}
                              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
                            >
                              Qabul qilish
                            </button>
                            <button
                              onClick={() => changeStatus(order.id, 'cancelled')}
                              className="px-4 py-2 border border-border text-muted-foreground text-sm rounded hover:border-destructive hover:text-destructive transition-colors"
                            >
                              Bekor qilish
                            </button>
                          </>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => changeStatus(order.id, 'completed')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Yetkazildi deb belgilash
                          </button>
                        )}
                        {(order.status === 'completed' || order.status === 'cancelled') && (
                          <button
                            onClick={() => changeStatus(order.id, 'pending')}
                            className="px-4 py-2 border border-border text-muted-foreground text-sm rounded hover:border-primary hover:text-primary transition-colors"
                          >
                            Qayta ochish
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded">
              <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


