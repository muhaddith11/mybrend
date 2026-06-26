'use client'
import { create } from 'zustand'
import { toast } from 'sonner'
import { useCartStore } from './cart'

// Quick-add tugmasi bosilganda ochiladigan "rang/o'lcham tanlash" oynasi uchun holat.
// Mahsulot variantli (sizes/colors) bo'lsa — oyna ochiladi; variantsiz bo'lsa
// to'g'ridan-to'g'ri savatga qo'shiladi (oyna ko'rsatilmaydi).

export interface PendingProduct {
  productId: string
  name: string
  price: number
  image?: string
  storeId: string
  storeName: string
  storeSlug: string
  sizes: string[]
  colors: string[]
  themeColor?: string // tanlangan chip/tugma rangi (do'kon mavzusi, ixtiyoriy)
}

interface ProductModalStore {
  product: PendingProduct | null
  /** Quick-add: variant bo'lsa oynani ochadi, bo'lmasa darrov savatga qo'shadi. */
  open: (p: PendingProduct) => void
  close: () => void
}

export const useProductModal = create<ProductModalStore>((set) => ({
  product: null,
  open: (p) => {
    const hasVariants = p.sizes.length > 0 || p.colors.length > 0
    if (!hasVariants) {
      // Tanlovga hojat yo'q — to'g'ridan-to'g'ri qo'shamiz
      const { sizes: _s, colors: _c, themeColor: _t, ...item } = p
      useCartStore.getState().addItem(item)
      toast.success("Savatga qo'shildi", { description: p.name })
      return
    }
    set({ product: p })
  },
  close: () => set({ product: null }),
}))
