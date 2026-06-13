'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  storeId: string
  storeName: string
  storeSlug: string
  themeBg?: string
}

interface WishlistStore {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  has: (productId: string) => boolean
  remove: (productId: string) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => set(state => {
        const exists = state.items.some(i => i.productId === item.productId)
        return {
          items: exists
            ? state.items.filter(i => i.productId !== item.productId)
            : [...state.items, item],
        }
      }),
      has: (productId) => get().items.some(i => i.productId === productId),
      remove: (productId) => set(state => ({
        items: state.items.filter(i => i.productId !== productId),
      })),
      clear: () => set({ items: [] }),
    }),
    { name: 'zyff-wishlist' }
  )
)
