import { CartItem } from './createStoreState'
import { API, makeAdminAuth } from './apiBase'

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
  lat?: number
  lng?: number
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
  const { adminHeaders } = makeAdminAuth(slug)

  async function createOrder(order: OrderInput): Promise<void> {
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
  }

  async function fetchOrders(): Promise<Order[]> {
    const res = await fetch(`${API}/admin/orders`, {
      headers: adminHeaders(),
    })
    if (!res.ok) throw new Error('Orders fetch failed')
    const data = await res.json()
    return (data as DBOrder[]).map(toOrder)
  }

  async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const dbStatus = statusToDb[status]
    const res = await fetch(`${API}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status: dbStatus }),
    })
    if (!res.ok) throw new Error('Status update failed')
  }

  async function fetchOrdersByPhone(phone: string): Promise<Order[]> {
    const clean = phone.replace(/\s/g, '')
    const res = await fetch(`${API}/orders/my`, {
      headers: adminHeaders(),
    })
    if (!res.ok) return []
    const data = await res.json()
    return ((data.orders ?? []) as DBOrder[])
      .filter(o => o.user?.phone === clean)
      .map(toOrder)
  }

  return { createOrder, fetchOrders, updateOrderStatus, fetchOrdersByPhone }
}
