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
    ...(options.headers as Record<string, string>),
  }
  // Content-Type faqat body bo'lganda — bodysiz so'rovda (GET, sevimli toggle,
  // DELETE) 'application/json' Fastify tomonidan "Body cannot be empty" deb rad etiladi.
  if (options.body != null) headers['Content-Type'] = 'application/json'
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Xatolik' }))
    // Xato'ga HTTP status'ni biriktiramiz — chaqiruvchi 401 (auth) ni tarmoq/server
    // xatosidan ajrata olsin (masalan sessiyani faqat 401'da tugatish uchun).
    // `code` — backend'ning barqaror xato kodi (lib/apiError.ts). Mijoz uni
    // `translateApiError()` bilan o'z tiliga o'giradi; `message` esa o'zbekcha
    // zaxira matn bo'lib qoladi (kod tanilmasa ishlatiladi).
    const error = new Error(err.error ?? 'So\'rov amalga oshmadi') as Error & {
      status?: number
      code?: string
      params?: Record<string, string | number>
    }
    error.status = res.status
    error.code = err.code
    error.params = err.params
    throw error
  }
  return res.json()
}

export const api = {
  auth: {
    sendOtp: (phone: string, purpose?: 'login' | 'delete') =>
      request<{ success: boolean }>('/auth/send-otp', {
        method: 'POST', body: JSON.stringify({ phone, ...(purpose ? { purpose } : {}) }),
      }),
    verifyOtp: (phone: string, code: string) =>
      request<{ token: string; user: User }>('/auth/verify-otp', {
        method: 'POST', body: JSON.stringify({ phone, code }),
      }),
    me: () => request<User>('/auth/me'),
    updateProfile: (data: { name?: string; avatar?: string }) =>
      request<User>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    deleteAccount: (code: string) =>
      request<{ success: boolean }>('/auth/delete-account', {
        method: 'DELETE', body: JSON.stringify({ code }),
      }),
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
    // Do'kon ma'lumoti id bo'yicha — checkout uchun (u faqat storeId biladi).
    // ?lite=1: mahsulotlarsiz yengil javob (100k+ katalogda tejamkor).
    getById: (id: string) => request<Store>(`/stores/${id}?lite=1`),
    favorites: () => request<{ stores: Store[] }>('/stores/favorites'),
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
    // Savat narxlarini yangilash uchun — bir so'rovda bir nechta mahsulotning
    // joriy narxi va mavjudligi (maksimum 100 ta id).
    byIds: (ids: string[]) =>
      request<{ products: { id: string; price: number; inStock: boolean }[] }>(
        `/products/by-ids?ids=${encodeURIComponent(ids.join(','))}`
      ),
    byId: (id: string) => request<Product & { store?: Store }>(`/products/${id}`),
  },

  orders: {
    create: (body: {
      storeId: string
      items: { productId: string; quantity: number; size?: string; color?: string }[]
      deliveryType: 'DELIVERY' | 'PICKUP' | 'CASH_ON_DOOR'
      address?: string
      lat?: number
      lng?: number
      note?: string
      paymentProvider?: 'CLICK' | 'PAYME' | 'TRANSFER'
    }) => request<Order & { paymentUrl?: string; botUrl?: string }>('/orders', {
      method: 'POST', body: JSON.stringify(body),
    }),
    myOrders: () => request<{ orders: Order[] }>('/orders/my'),
    my: () => request<Order[]>('/orders/my'),
    getById: (id: string) => request<Order>(`/orders/${id}`),
    byId: (id: string) => request<Order>(`/orders/${id}`),
    // Do'konga baho — faqat yetkazilgan buyurtma uchun va bir marta.
    // Javobda do'konning yangilangan o'rtacha bahosi qaytadi.
    review: (orderId: string, rating: number) =>
      request<{ success: boolean; rating: number; reviewCount: number }>(
        `/orders/${orderId}/review`,
        { method: 'POST', body: JSON.stringify({ rating }) },
      ),
  },
}
