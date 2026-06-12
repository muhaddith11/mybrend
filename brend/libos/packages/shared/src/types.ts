export type Gender = 'MEN' | 'WOMEN' | 'KIDS'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED'
export type DeliveryType = 'DELIVERY' | 'PICKUP' | 'CASH_ON_DOOR'

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  logo?: string
  banner?: string        // cover image (Prisma field nomi)
  isOpen?: boolean
  rating?: number
  reviewCount?: number
  genders?: Gender[]
  hasDelivery?: boolean
  hasPickup?: boolean
  hasCashOnDoor?: boolean
  deliveryTime?: number
  themeColor?: string
  themeBg?: string
  _count?: { products: number }
}

export interface Product {
  id: string
  name: string
  nameUz?: string
  description?: string
  price: number
  originalPrice?: number
  images?: string[]
  inStock?: boolean
  featured?: boolean
  isNew?: boolean
  sku?: string
  storeId?: string
  categoryId?: string
  category?: Category
  variants?: ProductVariant[]
  store?: Store
}

export interface ProductVariant {
  id: string
  size?: string
  color?: string
  quantity: number
}

export interface Category {
  id: string
  name: string
  slug: string
  gender: Gender
}

export interface Order {
  id: string
  totalPrice: number
  status: OrderStatus
  deliveryType: DeliveryType
  address?: string       // Prisma field nomi
  note?: string
  createdAt: string
  store?: Store
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  size?: string
  color?: string
  product?: Product
}

export interface User {
  id: string
  phone: string
  name?: string
  avatar?: string
}
