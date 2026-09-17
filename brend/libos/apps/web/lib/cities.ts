import type { Lang } from '@libos/shared'

// Shahar tanlash ro'yxati — mobil ilova (apps/mobile/lib/cities.ts) bilan bir xil.
// `key` — backend `Store.city` ustuni bilan bir xil yozilishi kerak (filter shu
// qiymat bo'yicha ishlaydi, case-insensitive). Hozircha faqat Qo'qonda do'konlar bor.
export interface City {
  key: string
  uz: string
  ru: string
  en: string
}

export const CITIES: City[] = [
  { key: "Qo'qon", uz: "Qo'qon", ru: 'Коканд', en: 'Kokand' },
  { key: "Marg'ilon", uz: "Marg'ilon", ru: 'Маргилан', en: 'Margilan' },
  { key: "Farg'ona", uz: "Farg'ona", ru: 'Фергана', en: 'Fergana' },
  { key: 'Quva', uz: 'Quva', ru: 'Quva', en: 'Quva' },
  { key: 'Andijon', uz: 'Andijon', ru: 'Андижан', en: 'Andijan' },
  { key: 'Asaka', uz: 'Asaka', ru: 'Асака', en: 'Asaka' },
  { key: 'Namangan', uz: 'Namangan', ru: 'Наманган', en: 'Namangan' },
]

// Hozircha faqat shu shaharda haqiqiy do'konlar bor — qolganlarida bosilsa
// "tez orada" ko'rsatiladi.
export const CITIES_WITH_STORES = new Set<string>(["Qo'qon"])

export function cityLabel(city: City, lang: Lang): string {
  return city[lang] ?? city.uz
}

export function findCity(key: string): City | undefined {
  return CITIES.find(c => c.key === key)
}
