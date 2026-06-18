import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/store/asma/admin', '/store/boosner/admin', '/store/onepro/admin', '/checkout', '/profile'] },
    sitemap: 'https://zyff.uz/sitemap.xml',
    host: 'https://zyff.uz',
  }
}
