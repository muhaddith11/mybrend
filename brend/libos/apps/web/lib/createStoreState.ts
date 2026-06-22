import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  sku?: string
  name: string
  nameUz: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  categoryName?: string
  sizes: string[]
  colors: string[]
  description: string
  descriptionUz: string
  model3d?: string
  inStock: boolean
  featured: boolean
  new: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  size: string
  color: string
}

export interface FilterState {
  category: string | null
  priceRange: [number, number]
  sizes: string[]
  colors: string[]
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular'
}

export const colorMap: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  navy: '#1a2744',
  charcoal: '#36454f',
  grey: '#808080',
  brown: '#8b4513',
  camel: '#c19a6b',
  lightblue: '#add8e6',
  pink: '#ffc0cb',
  beige: '#f5f5dc',
  red: '#c0392b',
  green: '#2e7d32',
}

export const categories = [
  { id: 'all', name: 'All', nameUz: 'Barchasi' },
  { id: 'suits', name: 'Suits', nameUz: 'Kostyumlar' },
  { id: 'coats', name: 'Coats', nameUz: 'Paltolar' },
  { id: 'shirts', name: 'Shirts', nameUz: "Ko'ylaklar" },
  { id: 'knitwear', name: 'Knitwear', nameUz: 'Trikotaj' },
  { id: 'shoes', name: 'Shoes', nameUz: 'Poyafzallar' },
  { id: 'accessories', name: 'Accessories', nameUz: 'Aksessuarlar' },
]

export const formatPrice = (price: number): string => {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + " so'm"
  )
}

export interface StoreState {
  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // Filters
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void

  // Wishlist
  wishlist: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean

  // UI State
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
  isMenuOpen: boolean
  setMenuOpen: (open: boolean) => void

  // Auth (phone-based session)
  authPhone: string | null
  authName: string | null
  setAuth: (phone: string, name: string) => void
  clearAuth: () => void

  // Mehmon buyurtma kuzatuvi: shu qurilmada berilgan buyurtma ID'lari (cuid).
  // Auth talab qilmaydi — har ID maxfiy kalit, /orders/track/:id orqali ko'riladi.
  orderIds: string[]
  addOrderId: (id: string) => void
}

const defaultFilters: FilterState = {
  category: null,
  priceRange: [0, 10000000],
  sizes: [],
  colors: [],
  sortBy: 'newest',
}

/**
 * Do'kon uchun Zustand store yaratadi. Har do'kon o'z `slug`i bilan
 * alohida localStorage kaliti oladi (`<slug>-design-store`), shu sababli
 * savat/wishlist do'konlar orasida aralashmaydi.
 */
export function createStoreState(slug: string) {
  return create<StoreState>()(
    persist(
      (set, get) => ({
        // Cart
        cart: [],
        addToCart: (item) =>
          set((state) => {
            const existingIndex = state.cart.findIndex(
              (i) =>
                i.product.id === item.product.id &&
                i.size === item.size &&
                i.color === item.color
            )
            if (existingIndex > -1) {
              const newCart = [...state.cart]
              newCart[existingIndex].quantity += item.quantity
              return { cart: newCart }
            }
            return { cart: [...state.cart, item] }
          }),
        removeFromCart: (productId, size, color) =>
          set((state) => ({
            cart: state.cart.filter(
              (i) =>
                !(i.product.id === productId && i.size === size && i.color === color)
            ),
          })),
        updateQuantity: (productId, size, color, quantity) =>
          set((state) => ({
            cart: state.cart.map((i) =>
              i.product.id === productId && i.size === size && i.color === color
                ? { ...i, quantity }
                : i
            ),
          })),
        clearCart: () => set({ cart: [] }),
        getCartTotal: () =>
          get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
        getCartCount: () =>
          get().cart.reduce((count, item) => count + item.quantity, 0),

        // Filters
        filters: defaultFilters,
        setFilter: (key, value) =>
          set((state) => ({
            filters: { ...state.filters, [key]: value },
          })),
        resetFilters: () => set({ filters: defaultFilters }),

        // Wishlist
        wishlist: [],
        addToWishlist: (productId) =>
          set((state) => ({
            wishlist: [...state.wishlist, productId],
          })),
        removeFromWishlist: (productId) =>
          set((state) => ({
            wishlist: state.wishlist.filter((id) => id !== productId),
          })),
        isInWishlist: (productId) => get().wishlist.includes(productId),

        // UI State
        isCartOpen: false,
        setCartOpen: (open) => set({ isCartOpen: open }),
        isMenuOpen: false,
        setMenuOpen: (open) => set({ isMenuOpen: open }),

        // Auth
        authPhone: null,
        authName: null,
        setAuth: (phone, name) => set({ authPhone: phone, authName: name }),
        clearAuth: () => set({ authPhone: null, authName: null }),

        // Buyurtma kuzatuvi (eng yangi birinchi, dublikatsiz)
        orderIds: [],
        addOrderId: (id) =>
          set((state) => ({
            orderIds: [id, ...state.orderIds.filter((x) => x !== id)],
          })),
      }),
      {
        name: `${slug}-design-store`,
        partialize: (state) => ({
          cart: state.cart,
          wishlist: state.wishlist,
          authPhone: state.authPhone,
          authName: state.authName,
          orderIds: state.orderIds,
        }),
      }
    )
  )
}
