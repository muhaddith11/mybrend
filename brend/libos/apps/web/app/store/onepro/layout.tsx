import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './onepro.css'
import { SiteChrome } from '@/components/onepro/site-chrome'

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
  title: 'One Pro | 100% Original Brend Kiyim',
  description: "Adidas, Calvin Klein, New Balance va boshqa brendlar. 100% original, eng yaxshi narxlarda.",
}

export default function OneProStoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`onepro-layout ${cormorant.variable} ${inter.variable} font-sans antialiased overflow-x-clip`}
      style={{ minHeight: '100vh' }}
    >
      <SiteChrome>{children}</SiteChrome>
    </div>
  )
}
