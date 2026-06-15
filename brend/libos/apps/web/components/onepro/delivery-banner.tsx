'use client'

import { motion } from 'framer-motion'
import { Truck } from 'lucide-react'

export function DeliveryBanner() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 h-10">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Truck className="w-4 h-4" />
          </motion.div>
          <p className="text-xs sm:text-sm font-sans tracking-wider">
            <span className="font-medium">QO&apos;QON BO&apos;YLAB 2 SOATDA</span> BEPUL YETKAZIB BERISH
          </p>
        </div>
      </div>
    </div>
  )
}

