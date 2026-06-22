'use client'

import { usePathname } from 'next/navigation'
import type { ElementType, ReactNode } from 'react'

interface SiteChromeProps {
  children: ReactNode
  /** Do'kon slug'i — admin sahifalarini aniqlash uchun. */
  slug: string
  /** Brendga xos layout komponentlari (har brend o'z dizaynini uzatadi). */
  Navigation: ElementType
  Footer: ElementType
  CartSidebar: ElementType
  Toaster: ElementType
  /** Faqat marketplace do'konlarida — yuqoridagi yetkazib-berish banneri. */
  DeliveryBanner?: ElementType
}

export function SiteChrome({ children, slug, Navigation, Footer, CartSidebar, Toaster, DeliveryBanner }: SiteChromeProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith(`/store/${slug}/admin`)

  // Admin sahifalarida sayt navbar/footer ko'rsatilmaydi (admin o'z layout'iga ega)
  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      {DeliveryBanner && <DeliveryBanner />}
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <Toaster position="bottom-right" />
    </>
  )
}
