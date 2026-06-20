import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// Mahsulot rasmlari Supabase Storage'da saqlanadi. Hostni hamma joyda
// ishlatiladigan env'dan olamiz — Supabase loyihasi o'zgarsa konfig avtomatik
// moslashadi. Env build paytida bo'lmasa, ma'lum hostga qaytamiz.
const supabaseHostname = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    return url ? new URL(url).hostname : 'amvmwibqdrufiaodqair.supabase.co'
  } catch {
    return 'amvmwibqdrufiaodqair.supabase.co'
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: supabaseHostname },
    ],
  },
  experimental: {
    externalDir: true,
  },
}

// Sentry bilan o'raymiz. Source map yuklash uchun org/project slug + auth
// token kerak (hozircha yo'q) — usiz ham runtime xatolar to'liq ushlanadi.
export default withSentryConfig(nextConfig, {
  silent: true, // build loglarini tinch tutadi
  disableLogger: true, // bundle hajmini kamaytiradi (Sentry loggerini olib tashlaydi)
})
