import type { QueryClient } from '@tanstack/react-query'

// Admin panelda o'zgarish qilinganda mijozga ko'rinadigan ekranlar ham yangilanishi
// kerak. Ilgari har bir mutatsiya faqat o'z admin kalitini bekor qilardi
// (`admin-store`, `admin-products`, `admin-orders`) — natijada do'kon egasi
// mahsulotni o'chirsa yoki banner almashtirsa, ilovaning ommaviy qismi eski
// ma'lumotni ko'rsatishda davom etardi.
//
// Ikki sabab bu muammoni og'irlashtiradi:
//   1. `refetchOnWindowFocus: false` — ochiq turgan ekran o'z-o'zidan yangilanmaydi,
//      faqat qayta mount bo'lganda so'rov yuboradi;
//   2. `stores` va `products` kalitlari AsyncStorage'ga 24 soatga saqlanadi
//      (_layout.tsx → shouldDehydrateQuery) — ilova qayta ochilganda ham eski
//      ma'lumot diskdan tiklanadi.
//
// Kalitlar PREFIKS bo'yicha mos keladi: ['stores'] — ['stores','top'] va
// ['stores', gender] ni ham qamrab oladi.
const PUBLIC_QUERY_KEYS = [
  ['stores'], // bosh sahifadagi va gender bo'yicha do'kon ro'yxatlari
  ['all-stores'], // "Barcha do'konlar" ekrani (qidiruv bilan)
  ['store'], // do'kon sahifasi: banner, logo va mahsulotlar ro'yxati
  ['store-detail'], // checkout uchun do'kon ma'lumoti
  ['products'], // ommabop, chegirmali va qidiruv natijalari
  ['product'], // mahsulot sahifasi
] as const

/**
 * Admin mutatsiyasi muvaffaqiyatli tugagach chaqiriladi — mijozga ko'rinadigan
 * barcha keshlarni bekor qiladi, shunda o'zgarish darhol aks etadi.
 */
export function invalidatePublicCaches(qc: QueryClient) {
  for (const queryKey of PUBLIC_QUERY_KEYS) {
    qc.invalidateQueries({ queryKey: queryKey as unknown as string[] })
  }
}
