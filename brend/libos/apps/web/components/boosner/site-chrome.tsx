'use client'

import type { ReactNode } from 'react'
import { SiteChrome as Shared } from '@/components/shared/site-chrome'
import { Navigation } from '@/components/boosner/navigation'
import { Footer } from '@/components/boosner/footer'
import { CartSidebar } from '@/components/boosner/cart-sidebar'
import { Toaster } from '@/components/ui/sonner'

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <Shared
      slug="boosner"
      Navigation={Navigation}
      Footer={Footer}
      CartSidebar={CartSidebar}
      Toaster={Toaster}
    >
      {children}
    </Shared>
  )
}
