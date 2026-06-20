import '../lib/env' // boot/build'da env'ni tekshiradi (fail-fast)
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
  metadataBase: new URL('https://zyff.uz'),
  title: {
    default: "ZYFF — Qo'qondagi barcha kiyim do'konlari bir joyda",
    template: '%s | ZYFF',
  },
  description:
    "ZYFF — Qo'qon shahridagi kiyim do'konlari marketplace'i. Asma Design, Boosner, One Pro va boshqa do'konlardan erkaklar, ayollar va bolalar kiyimlarini bir joyda toping, solishtiring va xarid qiling. O'zbekiston bo'ylab yetkazib berish.",
  keywords: ['ZYFF', 'zyff.uz', 'Qoʻqon', 'kiyim', 'kiyim doʻkoni', 'online xarid', 'marketplace', "O'zbekiston", 'Asma', 'Boosner', 'One Pro'],
  applicationName: 'ZYFF',
  alternates: { canonical: '/' },
  // Google Search Console — URL-prefiks propertysini HTML-teg orqali tasdiqlash
  // (DNS usuli o'jarlik qilgani uchun zaxira yo'l). Token ommaviy — HTML'da ko'rinadi.
  verification: { google: 'kKiisl4ii5e7l9lM_HOzilWaUvYrstd1PiOr' },
  openGraph: {
    type: 'website',
    siteName: 'ZYFF',
    title: "ZYFF — Qo'qondagi barcha kiyim do'konlari bir joyda",
    description: "Asma, Boosner, One Pro va boshqa do'konlar — bitta platformada. Qidiring, solishtiring, xarid qiling.",
    url: 'https://zyff.uz',
    locale: 'uz_UZ',
  },
  other: { viewport: 'width=device-width, initial-scale=1, maximum-scale=1' },
}

const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://zyff.uz/#organization',
      name: 'ZYFF',
      url: 'https://zyff.uz',
      description: "Qo'qon shahridagi kiyim do'konlari marketplace'i — Asma Design, Boosner, One Pro va boshqalar.",
      areaServed: { '@type': 'City', name: "Qo'qon" },
      address: { '@type': 'PostalAddress', addressLocality: "Qo'qon", addressCountry: 'UZ' },
      sameAs: ['https://instagram.com/zyff.uz'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://zyff.uz/#website',
      name: 'ZYFF',
      url: 'https://zyff.uz',
      inLanguage: 'uz',
      publisher: { '@id': 'https://zyff.uz/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://zyff.uz/?search={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>
        {/* Strukturali ma'lumot — Google qidiruv + AI uchun */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
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
