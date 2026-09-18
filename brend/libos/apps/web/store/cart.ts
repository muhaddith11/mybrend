'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  image?: string
  storeId: string
  storeName: string
  storeSlug: string
  size?: string
  color?: string
  quantity: number
  // Server bilan sinxronlashda (syncCatalog) mahsulot endi sotuvda bo'lmasa
  // belgilanadi — mobil store/cart.ts bilan bir xil (checkout va jami summa
  // bunday mahsulotni hisobga olmaydi).
  unavailable?: boolean
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQty: (productId: string, qty: number, size?: string, color?: string) => void
  clearStore: (storeId: string) => void
  totalCount: () => number
  totalPrice: () => number
  itemsByStore: () => Record<string, CartItem[]>
  // Savat qurilmada saqlanadi va qo'shilgan paytdagi narxni eslab qoladi — do'kon
  // narxni o'zgartirsa yoki mahsulot tugasa, eski/noto'g'ri narx ko'rsatilib
  // qolardi (mijoz bir summani ko'rib, boshqasini to'lardi). Bu funksiya server
  // narxi bilan moslaydi — mobil lib/useCartPrices.ts bilan bir xil maqsad.
  syncCatalog: (fresh: Record<string, { price: number; inStock: boolean }>) => void
}

function key(productId: string, size?: string, color?: string) {
  return `${productId}__${size ?? ''}__${color ?? ''}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (newItem) => set(state => {
        const k = key(newItem.productId, newItem.size, newItem.color)
        const exists = state.items.find(i => key(i.productId, i.size, i.color) === k)
        const items = exists
          ? state.items.map(i => key(i.productId, i.size, i.color) === k ? { ...i, quantity: i.quantity + 1 } : i)
          : [...state.items, { ...newItem, quantity: 1 }]
        // Savatni avtomatik OCHMAYMIZ — chaqiruvchi joyда kichik toast ko'rsatiladi
        return { items }
      }),

      removeItem: (productId, size, color) => set(state => ({
        items: state.items.filter(i => key(i.productId, i.size, i.color) !== key(productId, size, color)),
      })),

      updateQty: (productId, qty, size, color) => {
        const k = key(productId, size, color)
        if (qty <= 0) { set(state => ({ items: state.items.filter(i => key(i.productId, i.size, i.color) !== k) })); return }
        set(state => ({ items: state.items.map(i => key(i.productId, i.size, i.color) === k ? { ...i, quantity: qty } : i) }))
      },

      clearStore: (storeId) => set(state => ({ items: state.items.filter(i => i.storeId !== storeId) })),
      totalCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      // Tugagan mahsulot jami summaga kirmaydi — checkout ham xuddi shunday
      // filtrlaydi, ikki joyda boshqa-boshqa raqam ko'rinmasin.
      totalPrice: () => get().items.reduce((s, i) => s + (i.unavailable ? 0 : i.price * i.quantity), 0),
      itemsByStore: () => {
        const r: Record<string, CartItem[]> = {}
        for (const item of get().items) {
          if (!r[item.storeId]) r[item.storeId] = []
          r[item.storeId].push(item)
        }
        return r
      },
      syncCatalog: (fresh) => set(state => ({
        items: state.items.map(i => {
          const p = fresh[i.productId]
          if (!p) return { ...i, unavailable: true }
          return { ...i, price: p.price, unavailable: !p.inStock }
        }),
      })),
    }),
    { name: 'libos-cart' }
  )
)
