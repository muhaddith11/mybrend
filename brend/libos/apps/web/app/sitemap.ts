import type { MetadataRoute } from 'next'
import { api } from '@libos/shared'

const BASE = 'https://zyff.uz'

// Yangi mahsulot/do'kon qo'shilganda sitemap har soatda yangilanib tursin (ISR)
export const revalidate = 3600

// Marketing + statik storefront sahifalari
const STATIC_ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/stores', priority: 0.8, freq: 'daily' },
  { path: '/about', priority: 0.5, freq: 'monthly' },
  { path: '/help', priority: 0.5, freq: 'monthly' },
  { path: '/delivery', priority: 0.5, freq: 'monthly' },
  { path: '/open-store', priority: 0.6, freq: 'monthly' },
  { path: '/store/asma', priority: 0.8, freq: 'weekly' },
  { path: '/store/asma/collection', priority: 0.7, freq: 'weekly' },
  { path: '/store/boosner', priority: 0.8, freq: 'weekly' },
  { path: '/store/boosner/collection', priority: 0.7, freq: 'weekly' },
  { path: '/store/onepro', priority: 0.8, freq: 'weekly' },
  { path: '/store/onepro/collection', priority: 0.7, freq: 'weekly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // DB'dan barcha do'kon va mahsulotlarni olamiz.
  // API yetib bo'lmasa ham statik sahifalar baribir sitemap'da qoladi.
  let storeSlugs: string[] = []
  let productIds: string[] = []
  try {
    const { stores } = await api.stores.list({ limit: 1000 })
    storeSlugs = stores.map((s) => s.slug)
    const productLists = await Promise.all(
      stores.map((s) => api.products.byStore(s.id).catch(() => [])),
    )
    productIds = productLists.flat().map((p) => p.id)
  } catch {
    // sukut — statik ro'yxat bilan davom etamiz
  }

  // URL bo'yicha dedupe (statik storefront slug'lari DB bilan takrorlanishi mumkin)
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()
  const add = (path: string, priority: number, freq: MetadataRoute.Sitemap[number]['changeFrequency']) => {
    entries.set(path, { url: `${BASE}${path}`, lastModified: now, changeFrequency: freq, priority })
  }

  add('', 1, 'daily')
  for (const r of STATIC_ROUTES) add(r.path, r.priority, r.freq)
  for (const slug of storeSlugs) add(`/store/${slug}`, 0.8, 'daily')
  for (const id of productIds) add(`/product/${id}`, 0.6, 'weekly')

  return [...entries.values()]
}
