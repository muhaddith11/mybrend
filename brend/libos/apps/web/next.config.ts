import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
}

export default nextConfig
