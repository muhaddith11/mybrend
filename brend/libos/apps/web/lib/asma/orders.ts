import { supabase } from './supabase'
import { CartItem } from './store'

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
  id: number
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

export async function createOrder(order: OrderInput): Promise<void> {
  const itemsJson = order.items.map((i) => ({
    id: i.product.id,
    name: i.product.nameUz,
    price: i.product.price,
    quantity: i.quantity,
    size: i.size,
    color: i.color,
  }))

  const { error } = await supabase.from('orders').insert({
    customer_name: order.customerName,
    phone: order.phone,
    address: order.address,
    note: order.note ?? '',
    items: itemsJson,
    total: order.total,
    status: 'pending',
    payment_method: order.paymentMethod,
  })

  if (error) throw error

  fetch('/api/notify-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...order, items: itemsJson, lat: order.lat, lng: order.lng }),
  }).catch(() => {})
}

type DBOrder = {
  id: number
  customer_name: string
  phone: string
  address: string
  note: string | null
  items: OrderItem[] | null
  total: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  created_at: string
}

function toOrder(row: DBOrder): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    note: row.note ?? '',
    items: row.items ?? [],
    total: row.total,
    status: row.status,
    paymentMethod: row.payment_method ?? 'cash',
    createdAt: row.created_at,
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DBOrder[]).map(toOrder)
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function fetchOrdersByPhone(phone: string): Promise<Order[]> {
  const clean = phone.replace(/\s/g, '')
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('phone', clean)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DBOrder[]).map(toOrder)
}

