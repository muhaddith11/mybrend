'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function BodyPadding() {
  const pathname = usePathname()
  // Bespoke do'konlar ZYFF mobil bottom-nav'iga ega emas — pastki padding kerak emas
  const isBespoke = /^\/store\/(asma|boosner|onepro)(\/|$)/.test(pathname ?? '')

  useEffect(() => {
    // Pastki padding faqat MOBILда (<640px) kerak — u yerда fixed bottom-nav bor.
    // Desktopда nav yo'q, shuning uchun padding 0 (aks holda footer tagida bo'sh joy).
    // Mobilда padding nav balandligiga moslab (~58px) — footer navga tegib turadi.
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => {
      document.body.style.paddingBottom =
        isBespoke || !mq.matches
          ? '0'
          : 'calc(58px + env(safe-area-inset-bottom, 0px))'
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [isBespoke])

  return null
}
