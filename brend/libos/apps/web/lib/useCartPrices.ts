'use client'
// Savat narxlarini server bilan moslashtiradi.
//
// Savat brauzerda (localStorage) saqlanadi va mahsulot narxini savatga
// qo'shilgan paytdagi holida eslab qoladi. Do'kon narxni o'zgartirsa, panelda
// eski raqam qolib ketardi — buyurtma esa server narxida hisoblanadi, ya'ni
// mijoz bir summani ko'rib boshqasini to'lardi. Bu hook savat va checkout
// ochilganda joriy narxlarni tortib olib qo'llaydi (mobil
// apps/mobile/lib/useCartPrices.ts bilan bir xil).
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { useCartStore } from '../store/cart'

export function useCartPrices() {
  const items = useCartStore(s => s.items)
  const syncCatalog = useCartStore(s => s.syncCatalog)

  const ids = Array.from(new Set(items.map(i => i.productId))).sort()

  const { data } = useQuery({
    queryKey: ['cart-prices', ids],
    queryFn: () => api.products.byIds(ids),
    enabled: ids.length > 0,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!data?.products) return
    const fresh: Record<string, { price: number; inStock: boolean }> = {}
    for (const p of data.products) fresh[p.id] = { price: p.price, inStock: p.inStock }
    syncCatalog(fresh)
  }, [data, syncCatalog])
}
