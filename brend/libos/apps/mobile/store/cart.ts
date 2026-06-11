import { create } from 'zustand'

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
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQty: (productId: string, qty: number, size?: string, color?: string) => void
  clearStore: (storeId: string) => void
  clearAll: () => void
  totalCount: () => number
  totalPrice: () => number
  // Bir do'kondagi mahsulotlar (checkout uchun)
  itemsByStore: () => Record<string, CartItem[]>
}

function itemKey(productId: string, size?: string, color?: string) {
  return `${productId}__${size ?? ''}__${color ?? ''}`
}

export const useCartStore = create<CartStore>((set, get) => ({
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
}))
