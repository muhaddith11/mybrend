'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function BodyPadding() {
  const pathname = usePathname()
  const isAsma = pathname?.startsWith('/store/asma')

  useEffect(() => {
    if (isAsma) {
      document.body.style.paddingBottom = '0'
    } else {
      document.body.style.paddingBottom = 'calc(72px + env(safe-area-inset-bottom, 0px))'
    }
  }, [isAsma])

  return null
}
