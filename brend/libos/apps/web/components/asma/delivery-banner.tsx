'use client'

import { motion } from 'framer-motion'
import { Truck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export function DeliveryBanner() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center gap-3 h-10">
          <Link
            href="/stores"
            className="absolute left-0 flex items-center gap-1 text-xs font-sans tracking-wide opacity-90 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Barcha do&apos;konlar</span>
            <span className="sm:hidden">Do&apos;konlar</span>
          </Link>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Truck className="w-4 h-4" />
          </motion.div>
          <p className="text-xs sm:text-sm font-sans tracking-wider">
            <span className="font-medium">QO&apos;QON BO&apos;YLAB 2 SOATDA</span> <span className="hidden sm:inline">BEPUL YETKAZIB BERISH</span>
          </p>
        </div>
      </div>
    </div>
  )
}

