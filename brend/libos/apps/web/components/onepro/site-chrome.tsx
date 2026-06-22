'use client'

import type { ReactNode } from 'react'
import { SiteChrome as Shared } from '@/components/shared/site-chrome'
import { Navigation } from '@/components/onepro/navigation'
import { Footer } from '@/components/onepro/footer'
import { CartSidebar } from '@/components/onepro/cart-sidebar'
import { Toaster } from '@/components/ui/sonner'

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <Shared
      slug="onepro"
      Navigation={Navigation}
      Footer={Footer}
      CartSidebar={CartSidebar}
      Toaster={Toaster}
    >
      {children}
    </Shared>
  )
}
