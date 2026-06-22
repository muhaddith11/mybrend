'use client'

import { motion } from 'framer-motion'
import { Truck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DeliveryBannerProps {
  /**
   * "Barcha do'konlar" havolasini chap tomonda ko'rsatadi (marketplace do'konlari
   * uchun). Havola bo'lsa joy toraydi — shu sababli "BEPUL YETKAZIB BERISH" matni
   * mobil ekranlarda yashiriladi. Havolasiz brendlar uchun matn doim ko'rinadi.
   */
  showAllStoresLink?: boolean
}

export function DeliveryBanner({ showAllStoresLink = false }: DeliveryBannerProps) {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className={cn('flex items-center justify-center gap-3 h-10', showAllStoresLink && 'relative')}>
          {showAllStoresLink && (
            <Link
              href="/stores"
              className="absolute left-0 flex items-center gap-1 text-xs font-sans tracking-wide opacity-90 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Barcha do&apos;konlar</span>
              <span className="sm:hidden">Do&apos;konlar</span>
            </Link>
          )}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Truck className="w-4 h-4" />
          </motion.div>
          <p className="text-xs sm:text-sm font-sans tracking-wider">
            <span className="font-medium">QO&apos;QON BO&apos;YLAB 2 SOATDA</span>{' '}
            {showAllStoresLink ? (
              <span className="hidden sm:inline">BEPUL YETKAZIB BERISH</span>
            ) : (
              'BEPUL YETKAZIB BERISH'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
