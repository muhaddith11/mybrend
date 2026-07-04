// Do'kon egasi admin API klienti — SHARED `api` dan alohida (buyer tokeni bilan
// to'qnashmasligi uchun). Backenddagi /api/admin/* endpointlariga murojaat qiladi.

const _rawUrl =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3001/api'
const BASE_URL = _rawUrl.replace(/^﻿/, '')

async function adminRequest<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/admin${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Xatolik' }))
    const error = new Error(err.error ?? "So'rov amalga oshmadi") as Error & { status?: number }
    error.status = res.status
    throw error
  }
  // 204 yoki bo'sh javob bo'lishi mumkin
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export interface AdminOwner { id: string; name: string; email: string }
export interface AdminStats {
  productCount?: number
  totalOrders?: number
  pendingOrders?: number
  deliveredOrders?: number
  totalRevenue?: number
  [k: string]: any
}
export interface AdminProduct {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  images: string[]
  inStock: boolean
  featured?: boolean
  category?: { id: string; name: string } | null
  variants?: { size?: string | null; color?: string | null; quantity: number }[]
  [k: string]: any
}
export interface AdminOrder {
  id: string
  status: string
  totalPrice: number
  deliveryType: string
  address?: string | null
  createdAt: string
  items: { id: string; quantity: number; price: number; product: { name: string } }[]
  [k: string]: any
}
export interface AdminStore { id: string; name: string; slug: string; [k: string]: any }
export interface AdminCategory { id: string; name: string; slug: string }

export interface ProductInput {
  name: string
  sku?: string
  price: number
  originalPrice?: number
  description?: string
  images?: string[]
  sizes?: string[]
  colors?: string[]
  categorySlug?: string
  categoryId?: string
  inStock?: boolean
  featured?: boolean
  isNew?: boolean
  variants?: { size?: string; color?: string; quantity?: number }[]
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminRequest<{ token: string; owner: AdminOwner }>('/login', null, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getStore: (token: string) => adminRequest<AdminStore>('/store', token),
  updateStore: (token: string, body: Record<string, any>) =>
    adminRequest<AdminStore>('/store', token, { method: 'PATCH', body: JSON.stringify(body) }),
  getProducts: (token: string) => adminRequest<AdminProduct[]>('/products', token),
  createProduct: (token: string, body: ProductInput) =>
    adminRequest<AdminProduct>('/products', token, { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (token: string, id: string, body: ProductInput) =>
    adminRequest<AdminProduct>(`/products/${id}`, token, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (token: string, id: string) =>
    adminRequest<{ success: boolean }>(`/products/${id}`, token, { method: 'DELETE' }),
  getOrders: (token: string) => adminRequest<AdminOrder[]>('/orders', token),
  updateOrderStatus: (token: string, id: string, status: string) =>
    adminRequest<AdminOrder>(`/orders/${id}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getCategories: (token: string) => adminRequest<AdminCategory[]>('/categories', token),
  getStats: (token: string) => adminRequest<AdminStats>('/stats', token),
}
