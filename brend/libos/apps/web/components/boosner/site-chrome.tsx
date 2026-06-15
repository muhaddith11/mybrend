'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/boosner/navigation'
import { Footer } from '@/components/boosner/footer'
import { CartSidebar } from '@/components/boosner/cart-sidebar'
import { Toaster } from '@/components/boosner/ui/sonner'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/store/boosner/admin')

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

