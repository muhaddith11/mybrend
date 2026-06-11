import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './asma.css'
import { SiteChrome } from '@/components/asma/site-chrome'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Asma Design | Premium Erkaklar Kiyimi',
  description: "Erkaklar uchun premium kiyimlar. Kostyumlar, paltolar, ko'ylaklar va aksessuarlar.",
}

export default function AsmaStoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`asma-layout dark ${cormorant.variable} ${inter.variable} font-serif antialiased overflow-x-clip`}
      style={{ minHeight: '100vh' }}
    >
      <SiteChrome>{children}</SiteChrome>
    </div>
  )
}
