'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowDown, Play } from 'lucide-react'
import { Button } from '@/components/asma/ui/button'

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Background */}
      <motion.div style={{ scale }} className="absolute inset-0">
        {/* Poster image */}
        <img
          src="/asma/hero-poster.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ position: 'absolute', inset: 0 }}
        />
        {/* Dark overlay for luxury feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-10" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-6"
        >
          <span className="text-xs sm:text-sm tracking-[0.4em] text-primary font-sans uppercase">
            Yangi Kolleksiya 2026
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-4xl sm:text-6xl lg:text-8xl font-serif font-light tracking-wider text-foreground mb-6 text-balance"
        >
          Elegantlik
          <br />
          <span className="italic text-primary">Yangicha</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="max-w-md text-muted-foreground text-sm sm:text-base leading-relaxed mb-10"
        >
          Premium erkaklar kiyimi. Italiya ustaligi va zamonaviy dizayn uyg&apos;unligi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 tracking-wider"
          >
            <Link href="/store/asma/collection">Kolleksiyani Ko&apos;rish</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-foreground/30 text-foreground hover:bg-foreground/10 px-8 tracking-wider group"
          >
            <Link href="/store/asma/lookbook" className="flex items-center gap-2">
              <Play className="w-4 h-4 group-hover:text-primary transition-colors" />
              Lookbookni ko&apos;rish
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs tracking-wider uppercase">Pastga aylantiring</span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Side Text */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-20">
        <div className="transform -rotate-90 origin-left">
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Qo&apos;qon, O&apos;zbekiston
          </span>
        </div>
      </div>

      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-20">
        <div className="transform rotate-90 origin-right">
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Tashkil: 2024
          </span>
        </div>
      </div>
    </section>
  )
}




