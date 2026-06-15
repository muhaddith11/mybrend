'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/onepro/navigation'
import { Footer } from '@/components/onepro/footer'
import { CartSidebar } from '@/components/onepro/cart-sidebar'
import { Toaster } from '@/components/onepro/ui/sonner'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/store/onepro/admin')

  // Admin sahifalarida sayt navbar/footer ko'rsatilmaydi (admin o'z layout'iga ega)
  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <Toaster position="bottom-right" />
    </>
  )
}

