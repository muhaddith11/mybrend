import type { Store, Product, Order, User, Gender } from './types'

// Support both Expo and Next.js env vars; strip BOM that Windows tools can inject
const _rawUrl =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL)) ||
  'http://localhost:3001/api'
const BASE_URL = _rawUrl.replace(/^﻿/, '')

let authToken: string | null = null

export function setToken(token: string | null) {
  authToken = token
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Xatolik' }))
    // Xato'ga HTTP status'ni biriktiramiz — chaqiruvchi 401 (auth) ni tarmoq/server
    // xatosidan ajrata olsin (masalan sessiyani faqat 401'da tugatish uchun).
    const error = new Error(err.error ?? 'So\'rov amalga oshmadi') as Error & { status?: number }
    error.status = res.status
    throw error
  }
  return res.json()
}

export const api = {
  auth: {
    sendOtp: (phone: string) =>
      request<{ success: boolean }>('/auth/send-otp', {
        method: 'POST', body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, code: string) =>
      request<{ token: string; user: User }>('/auth/verify-otp', {
        method: 'POST', body: JSON.stringify({ phone, code }),
      }),
    me: () => request<User>('/auth/me'),
    updateProfile: (data: { name?: string; avatar?: string }) =>
      request<User>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  stores: {
    list: (params: { gender?: Gender; search?: string; page?: number; limit?: number } = {}) => {
      const q = new URLSearchParams()
      if (params.gender) q.set('gender', params.gender)
      if (params.search) q.set('search', params.search)
      if (params.page) q.set('page', String(params.page))
      if (params.limit) q.set('limit', String(params.limit))
      return request<{ stores: Store[]; total: number; pages: number }>(`/stores?${q}`)
    },
    getBySlug: (slug: string) => request<Store & { products: Product[] }>(`/stores/${slug}`),
    bySlug: (slug: string) => request<Store & { products: Product[] }>(`/stores/${slug}`),
    toggleFavorite: (id: string) =>
      request<{ favorited: boolean }>(`/stores/${id}/favorite`, { method: 'POST' }),
  },

  products: {
    featured: () => request<{ products: Product[] }>('/products/featured'),
    discounted: () => request<{ products: Product[] }>('/products/discounted'),
    search: (q: string) =>
      request<{ products: (Product & { store?: { name: string; slug: string; themeColor?: string; themeBg?: string } })[] }>(
        `/products?search=${encodeURIComponent(q)}`
      ),
    byStore: (storeId: string, categoryId?: string) => {
      const q = categoryId ? `?categoryId=${categoryId}` : ''
      return request<Product[]>(`/products/store/${storeId}${q}`)
    },
    getById: (id: string) => request<Product & { store?: Store }>(`/products/${id}`),
    byId: (id: string) => request<Product & { store?: Store }>(`/products/${id}`),
  },

  orders: {
    create: (body: {
      storeId: string
      items: { productId: string; quantity: number; size?: string; color?: string }[]
      deliveryType: 'DELIVERY' | 'PICKUP' | 'CASH_ON_DOOR'
      address?: string
      note?: string
      paymentProvider?: 'CLICK' | 'PAYME'
    }) => request<Order & { paymentUrl?: string }>('/orders', {
      method: 'POST', body: JSON.stringify(body),
    }),
    myOrders: () => request<{ orders: Order[] }>('/orders/my'),
    my: () => request<Order[]>('/orders/my'),
    getById: (id: string) => request<Order>(`/orders/${id}`),
    byId: (id: string) => request<Order>(`/orders/${id}`),
  },
}
