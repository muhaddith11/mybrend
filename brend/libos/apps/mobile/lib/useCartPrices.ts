// Savat narxlarini server bilan moslashtiradi.
//
// Savat qurilmada (AsyncStorage) saqlanadi va mahsulot narxini savatga qo'shilgan
// paytdagi holida eslab qoladi. Do'kon narxni o'zgartirsa, ekranda eski raqam
// qolib ketardi — buyurtma esa server narxida hisoblanadi, ya'ni mijoz bir summani
// ko'rib boshqasini to'lardi. Shu hook savat va checkout ekranlari ochilganda
// joriy narxlarni tortib olib qo'llaydi.

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { useCartStore } from '../store/cart'

export function useCartPrices() {
  const items = useCartStore(s => s.items)
  const syncPrices = useCartStore(s => s.syncPrices)

  // Barqaror kalit: id'lar tartiblanadi, aks holda savatdagi tartib o'zgarishi
  // bir xil to'plam uchun yangi so'rovga sabab bo'ladi.
  const ids = Array.from(new Set(items.map(i => i.productId))).sort()

  const { data } = useQuery({
    queryKey: ['cart-prices', ids],
    queryFn: () => api.products.byIds(ids),
    enabled: ids.length > 0,
    // Narx tez-tez o'zgarmaydi — ekran har ochilganda emas, daqiqada bir marta.
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!data?.products?.length) return
    const prices: Record<string, number> = {}
    for (const p of data.products) prices[p.id] = p.price
    syncPrices(prices)
  }, [data, syncPrices])
}
