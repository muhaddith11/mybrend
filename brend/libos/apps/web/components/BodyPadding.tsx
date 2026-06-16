'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function BodyPadding() {
  const pathname = usePathname()
  // Bespoke do'konlar ZYFF mobil bottom-nav'iga ega emas — pastki padding kerak emas
  const isBespoke = /^\/store\/(asma|boosner|onepro)(\/|$)/.test(pathname ?? '')

  useEffect(() => {
    if (isBespoke) {
      document.body.style.paddingBottom = '0'
    } else {
      document.body.style.paddingBottom = 'calc(72px + env(safe-area-inset-bottom, 0px))'
    }
  }, [isBespoke])

  return null
}
