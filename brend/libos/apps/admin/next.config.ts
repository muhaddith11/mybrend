import type { NextConfig } from 'next'

// Rasm hostlari web app bilan bir xil: mahsulot rasmlari Supabase Storage'da.
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
}

export default nextConfig
