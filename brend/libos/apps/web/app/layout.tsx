import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '../components/Providers'
import { Navbar } from '../components/Navbar'
import { CartDrawer } from '../components/CartDrawer'
import { LoginModal } from '../components/LoginModal'
import { BodyPadding } from '../components/BodyPadding'

export const metadata: Metadata = {
  title: 'ZYFF — Shahardagi barcha kiyim do\'konlari',
  description: "Qo'qondagi barcha kiyim do'konlari bir joyda. Erkaklar, ayollar va bolalar kiyimlari.",
  other: { viewport: 'width=device-width, initial-scale=1, maximum-scale=1' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>
          <BodyPadding />
          <Navbar />
          <main>{children}</main>
          <CartDrawer />
          <LoginModal />
        </Providers>
      </body>
    </html>
  )
}
