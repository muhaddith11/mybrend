import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '../components/Providers'
import { Navbar } from '../components/Navbar'
import { CartDrawer } from '../components/CartDrawer'
import { LoginModal } from '../components/LoginModal'
import { ProfileDrawer } from '../components/ProfileDrawer'
import { BodyPadding } from '../components/BodyPadding'
import { ThemeProvider } from '../components/ThemeProvider'
import { Onboarding } from '../components/Onboarding'

export const metadata: Metadata = {
  title: 'ZYFF — Shahardagi barcha kiyim do\'konlari',
  description: "Qo'qondagi barcha kiyim do'konlari bir joyda. Erkaklar, ayollar va bolalar kiyimlari.",
  other: { viewport: 'width=device-width, initial-scale=1, maximum-scale=1' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>
        {/* No-flash: apply saved theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=JSON.parse(localStorage.getItem('zyff-theme')||'{}');if(t&&t.state&&t.state.dark)document.documentElement.setAttribute('data-theme','dark')}catch(e){}` }} />
        <Providers>
          <ThemeProvider />
          <BodyPadding />
          <Navbar />
          <main>{children}</main>
          <CartDrawer />
          <LoginModal />
          <ProfileDrawer />
          <Onboarding />
        </Providers>
      </body>
    </html>
  )
}
