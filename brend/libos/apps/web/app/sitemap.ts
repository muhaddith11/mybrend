import type { MetadataRoute } from 'next'

const BASE = 'https://zyff.uz'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = [
    '', '/stores', '/about', '/help', '/delivery', '/open-store',
    '/store/asma', '/store/asma/collection',
    '/store/boosner', '/store/boosner/collection',
    '/store/onepro', '/store/onepro/collection',
  ]
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path.includes('/collection') ? 0.7 : 0.8,
  }))
}
