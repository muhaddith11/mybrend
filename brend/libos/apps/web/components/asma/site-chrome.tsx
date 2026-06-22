'use client'

import type { ReactNode } from 'react'
import { SiteChrome as Shared } from '@/components/shared/site-chrome'
import { Navigation } from '@/components/asma/navigation'
import { Footer } from '@/components/asma/footer'
import { CartSidebar } from '@/components/asma/cart-sidebar'
import { DeliveryBanner } from '@/components/asma/delivery-banner'
import { Toaster } from '@/components/asma/ui/sonner'

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <Shared
      slug="asma"
      Navigation={Navigation}
      Footer={Footer}
      CartSidebar={CartSidebar}
      Toaster={Toaster}
      DeliveryBanner={DeliveryBanner}
    >
      {children}
    </Shared>
  )
}
