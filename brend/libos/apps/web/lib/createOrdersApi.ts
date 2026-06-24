import { CartItem } from './createStoreState'
import { API, adminFetch } from './apiBase'

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
export type PaymentMethod = 'cash' | 'click' | 'payme'

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Naqd (eshik oldida)',
  click: 'Click',
  payme: 'Payme',
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
}

export interface Order {
  id: string
  customerName: string
  phone: string
  address: string
  note: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  createdAt: string
}

export interface OrderInput {
  customerName: string
  phone: string
  address: string
  note?: string
  items: CartItem[]
  total: number
  paymentMethod: PaymentMethod
  deliveryType?: 'DELIVERY' | 'PICKUP'
  lat?: number
  lng?: number
}

// Mehmon kuzatuv sahifasi uchun buyurtma shakli (backend /orders/track/:id javobi).
export type DbOrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED'

export interface TrackedOrder {
  id: string
  status: DbOrderStatus
  deliveryType: string
  paymentMethod: string | null
  totalPrice: number
  address: string | null
  customerName: string | null
  note: string | null
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    size: string | null
    color: string | null
    product: { id: string; name: string; nameUz: string | null; images: string[] }
  }>
  store: { name: string; slug: string; logo: string | null; themeColor: string | null }
}

// Kuzatuv sahifasidagi bosqichlar (CANCELLED alohida ko'rsatiladi).
export const trackStatusSteps: DbOrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED',
]
export const trackStatusLabels: Record<DbOrderStatus, string> = {
  PENDING: 'Qabul qilindi',
  CONFIRMED: 'Tasdiqlandi',
  PREPARING: 'Tayyorlanmoqda',
  DELIVERING: 'Yetkazilmoqda',
  DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor qilindi',
}

// TrackedOrder (DB shakli) → profil ko'rsatadigan Order shakli.
const trackToFrontStatus: Record<DbOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'processing',
  PREPARING: 'processing',
  DELIVERING: 'processing',
  DELIVERED: 'completed',
  CANCELLED: 'cancelled',
}

function trackedToOrder(t: TrackedOrder): Order {
  return {
    id: t.id,
    customerName: t.customerName || 'Mijoz',
    phone: '', // /track telefon qaytarmaydi (maxfiylik)
    address: t.address ?? '',
    note: t.note ?? '',
    items: t.items.map((i) => ({
      id: i.id,
      name: i.product.nameUz || i.product.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size ?? '',
      color: i.color ?? '',
    })),
    total: t.totalPrice,
    status: trackToFrontStatus[t.status] ?? 'pending',
    paymentMethod: (t.paymentMethod as PaymentMethod) ?? 'cash',
    createdAt: t.createdAt,
  }
}

// DB status → frontend status
const statusMap: Record<string, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'processing',
  PREPARING: 'processing',
  DELIVERING: 'processing',
  DELIVERED: 'completed',
  CANCELLED: 'cancelled',
}

// frontend status → DB status
const statusToDb: Record<OrderStatus, string> = {
  pending: 'PENDING',
  processing: 'CONFIRMED',
  completed: 'DELIVERED',
  cancelled: 'CANCELLED',
}

type DBOrder = {
  id: string
  customerName: string | null
  totalPrice: number
  status: string
  paymentMethod: string | null
  address: string | null
  note: string | null
  createdAt: string
  user: { phone: string; name: string | null }
  items: Array<{
    id: string
    quantity: number
    price: number
    size: string | null
    color: string | null
    product: { name: string; nameUz: string | null }
  }>
}

function toOrder(row: DBOrder): Order {
  return {
    id: row.id,
    customerName: row.customerName || row.user?.name || 'Noma\'lum',
    phone: row.user?.phone ?? '',
    address: row.address ?? '',
    note: row.note ?? '',
    items: (row.items ?? []).map(i => ({
      id: i.id,
      name: i.product.nameUz || i.product.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size ?? '',
      color: i.color ?? '',
    })),
    total: row.totalPrice,
    status: statusMap[row.status] ?? 'pending',
    paymentMethod: (row.paymentMethod as PaymentMethod) ?? 'cash',
    createdAt: row.createdAt,
  }
}

/** Do'kon `slug`i uchun buyurtma API funksiyalarini yaratadi. */
export function createOrdersApi(slug: string) {
  async function createOrder(order: OrderInput): Promise<{ orderId: string; paymentUrl?: string }> {
    const itemsPayload = order.items.map(i => ({
      productId: i.product.id,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
    }))

    const res = await fetch(`${API}/orders/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeSlug: slug,
        customerName: order.customerName,
        phone: order.phone.replace(/\s/g, ''),
        deliveryType: order.deliveryType ?? 'DELIVERY',
        address: order.address,
        lat: order.lat,
        lng: order.lng,
        note: order.note,
        paymentMethod: order.paymentMethod,
        items: itemsPayload,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Order creation failed')
    }
    // Buyurtma ID (cuid) — kuzatuv havolasi. Online to'lovда paymentUrl ham qaytadi.
    const data = await res.json().catch(() => ({}))
    return { orderId: (data.orderId as string) ?? '', paymentUrl: data.paymentUrl as string | undefined }
  }

  // Mehmon buyurtma kuzatuvi — ID (cuid) maxfiy kalit, auth shart emas.
  async function fetchOrderById(orderId: string): Promise<TrackedOrder | null> {
    const res = await fetch(`${API}/orders/track/${orderId}`)
    if (!res.ok) return null
    return (await res.json()) as TrackedOrder
  }

  // Shu qurilmada berilgan buyurtmalar (lokal orderIds) — profil sahifasi uchun.
  // Har ID auth'siz /track orqali olinadi va profil ko'rsatadigan Order shakliga o'tkaziladi.
  // O'chirilgan/topilmagan buyurtmalar (null) tashlab yuboriladi.
  async function fetchMyOrders(ids: string[]): Promise<Order[]> {
    const results = await Promise.all(ids.map((id) => fetchOrderById(id)))
    return results.filter((o): o is TrackedOrder => o !== null).map(trackedToOrder)
  }

  async function fetchOrders(): Promise<Order[]> {
    const res = await adminFetch(slug, '/admin/orders')
    if (!res.ok) throw new Error('Orders fetch failed')
    const data = await res.json()
    return (data as DBOrder[]).map(toOrder)
  }

  async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const dbStatus = statusToDb[status]
    const res = await adminFetch(slug, `/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: dbStatus }),
    })
    if (!res.ok) throw new Error('Status update failed')
  }

  return { createOrder, fetchOrderById, fetchMyOrders, fetchOrders, updateOrderStatus }
}
