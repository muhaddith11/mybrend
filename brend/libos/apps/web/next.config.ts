import type { NextConfig } from 'next'

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

export default nextConfig
