'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, ShoppingCart, Clock, TrendingUp, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/onepro/store'
import { fetchOrders, Order, OrderStatus } from '@/lib/onepro/orders'
import { fetchProducts } from '@/lib/onepro/products'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  processing: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Kutilmoqda',
  processing: 'Jarayonda',
  completed: 'Bajarildi',
  cancelled: 'Bekor qilindi',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface TopProduct {
  name: string
  sales: number
  revenue: number
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()])
      .then(([ords, prods]) => {
        setOrders(ords)
        setProductCount(prods.length)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Statistika hisoblanadi (bekor qilinganlardan tashqari)
  const validOrders = orders.filter((o) => o.status !== 'cancelled')
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length

  const stats = [
    { label: 'Jami savdo', value: formatPrice(totalRevenue), icon: TrendingUp },
    { label: 'Buyurtmalar', value: String(orders.length), icon: ShoppingCart },
    { label: 'Mahsulotlar', value: String(productCount), icon: Package },
    { label: 'Kutilayotgan', value: String(pendingCount), icon: Clock },
  ]

  const recentOrders = orders.slice(0, 5)

  // Eng ko'p sotilgan mahsulotlar buyurtmalardan hisoblanadi
  const productMap = new Map<string, TopProduct>()
  for (const order of validOrders) {
    for (const item of order.items) {
      const existing = productMap.get(item.name)
      if (existing) {
        existing.sales += item.quantity
        existing.revenue += item.price * item.quantity
      } else {
        productMap.set(item.name, {
          name: item.name,
          sales: item.quantity,
          revenue: item.price * item.quantity,
        })
      }
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Yuklanmoqda...</span>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">
          Boshqaruv paneli
        </h1>
        <p className="text-muted-foreground">One Pro boshqaruv paneli</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-card border border-border rounded p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-serif text-foreground mb-1 break-words">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-card border border-border rounded"
        >
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
            <h2 className="font-serif text-foreground">So&apos;nggi buyurtmalar</h2>
            <Link href="/store/onepro/admin/orders" className="text-sm text-primary hover:underline">
              Barchasini ko&apos;rish
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                Hozircha buyurtmalar yo&apos;q
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 lg:p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground">#{order.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.customerName} • {order.items.length} ta mahsulot
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border border-border rounded"
        >
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
            <h2 className="font-serif text-foreground">Eng ko&apos;p sotilgan</h2>
            <Link href="/store/onepro/admin/products" className="text-sm text-primary hover:underline">
              Barchasini ko&apos;rish
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topProducts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                Hozircha sotuvlar yo&apos;q
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-4 lg:p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} ta sotildi</p>
                    </div>
                  </div>
                  <p className="font-medium text-primary">{formatPrice(product.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link
          href="/store/onepro/admin/products/new"
          className="flex items-center gap-3 p-4 bg-card border border-border rounded hover:border-primary transition-colors"
        >
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm">Yangi mahsulot</span>
        </Link>
        <Link
          href="/store/onepro/admin/orders"
          className="flex items-center gap-3 p-4 bg-card border border-border rounded hover:border-primary transition-colors"
        >
          <ShoppingCart className="w-5 h-5 text-primary" />
          <span className="text-sm">Buyurtmalar</span>
        </Link>
        <Link
          href="/store/onepro/admin/lookbook"
          className="flex items-center gap-3 p-4 bg-card border border-border rounded hover:border-primary transition-colors"
        >
          <Eye className="w-5 h-5 text-primary" />
          <span className="text-sm">Lookbook</span>
        </Link>
        <Link
          href="/store/onepro"
          target="_blank"
          className="flex items-center gap-3 p-4 bg-card border border-border rounded hover:border-primary transition-colors"
        >
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm">Saytni ko&apos;rish</span>
        </Link>
      </motion.div>
    </div>
  )
}


