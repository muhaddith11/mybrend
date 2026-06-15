'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/asma/navigation'
import { Footer } from '@/components/asma/footer'
import { CartSidebar } from '@/components/asma/cart-sidebar'
import { DeliveryBanner } from '@/components/asma/delivery-banner'
import { Toaster } from '@/components/asma/ui/sonner'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/store/asma/admin')

  // Admin sahifalarida sayt navbar/footer ko'rsatilmaydi (admin o'z layout'iga ega)
  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <DeliveryBanner />
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <Toaster position="bottom-right" />
    </>
  )
}

