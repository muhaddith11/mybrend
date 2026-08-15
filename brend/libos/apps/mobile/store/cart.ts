import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CartItem {
  productId: string
  name: string
  price: number
  image?: string
  storeId: string
  storeName: string
  size?: string
  color?: string
  quantity: number
  // Server bilan sinxronda aniqlanadi: mahsulot tugagan, o'chirilgan yoki do'koni
  // yashirilgan. Savatda ko'rinadi, lekin buyurtmaga qo'shilmaydi.
  unavailable?: boolean
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQty: (productId: string, qty: number, size?: string, color?: string) => void
  clearStore: (storeId: string) => void
  clearAll: () => void
  // Serverdagi joriy narx va mavjudlikni savatga qo'llaydi
  // (lib/useCartPrices.ts chaqiradi). `fresh`da bo'lmagan mahsulot — o'chirilgan
  // yoki do'koni yashirilgan, u ham mavjud emas deb belgilanadi.
  syncCatalog: (fresh: Record<string, { price: number; inStock: boolean }>) => void
  totalCount: () => number
  totalPrice: () => number
  // Bir do'kondagi mahsulotlar (checkout uchun)
  itemsByStore: () => Record<string, CartItem[]>
}

function itemKey(productId: string, size?: string, color?: string) {
  return `${productId}__${size ?? ''}__${color ?? ''}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set(state => {
          const key = itemKey(newItem.productId, newItem.size, newItem.color)
          const existing = state.items.find(
            i => itemKey(i.productId, i.size, i.color) === key
          )
          if (existing) {
            return {
              items: state.items.map(i =>
                itemKey(i.productId, i.size, i.color) === key
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] }
        })
      },

      removeItem: (productId, size, color) => {
        const key = itemKey(productId, size, color)
        set(state => ({
          items: state.items.filter(i => itemKey(i.productId, i.size, i.color) !== key),
        }))
      },

      updateQty: (productId, qty, size, color) => {
        const key = itemKey(productId, size, color)
        if (qty <= 0) {
          set(state => ({
            items: state.items.filter(i => itemKey(i.productId, i.size, i.color) !== key),
          }))
          return
        }
        set(state => ({
          items: state.items.map(i =>
            itemKey(i.productId, i.size, i.color) === key ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearStore: (storeId) => {
        set(state => ({ items: state.items.filter(i => i.storeId !== storeId) }))
      },

      clearAll: () => set({ items: [] }),

      // Faqat haqiqatan o'zgargan qiymat yoziladi — aks holda har sinxronda yangi
      // massiv yaratilib, foydalanuvchi savatni ochib turganда keraksiz render
      // (va useEffect halqasi) yuz beradi.
      syncCatalog: (fresh) => {
        set(state => {
          let changed = false
          const items = state.items.map(i => {
            const f = fresh[i.productId]
            // Serverdan umuman qaytmadi — o'chirilgan yoki do'koni yashirilgan.
            const unavailable = !f || !f.inStock
            const price = f ? f.price : i.price
            if (price === i.price && unavailable === !!i.unavailable) return i
            changed = true
            return { ...i, price, unavailable }
          })
          return changed ? { items } : state
        })
      },

      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemsByStore: () => {
        const result: Record<string, CartItem[]> = {}
        for (const item of get().items) {
          if (!result[item.storeId]) result[item.storeId] = []
          result[item.storeId].push(item)
        }
        return result
      },
    }),
    {
      name: 'zyff_cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
