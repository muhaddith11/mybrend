'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/asma/ui/button'

export function BrandStorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={containerRef} className="py-20 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            style={{ y }}
            className="relative aspect-[3/4] lg:aspect-[4/5]"
          >
            <div className="absolute inset-0 bg-muted overflow-hidden">
              <Image
                src="/asma/hero-poster.jpg"
                alt="Asma Design Atelier"
                fill
                className="object-cover object-top"
              />
            </div>
            {/* Decorative Frame */}
            <div className="absolute -inset-4 border border-primary/20 -z-10" />
            <div className="absolute -inset-8 border border-border -z-20" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="lg:pl-8"
          >
            <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
              Bizning Hikoya
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-wider text-foreground mt-4 mb-8">
              Sevgi bilan
              <br />
              <span className="italic">Yaratilgan</span>
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Asma Design - bu Qo&apos;qon shahrida 2024-yilda tashkil etilgan premium erkaklar 
                kiyimi brendi. Biz har bir kiyimni nafaqat uslub, balki sifat va qulaylik 
                bilan yaratamiz.
              </p>
              <p>
                Italiya ustalarining an&apos;analarini O&apos;zbekiston madaniyati bilan uyg&apos;unlashtirgan 
                holda, biz zamonaviy jentlmenlar uchun mukammal garderobni yaratamiz.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 my-10 py-8 border-y border-border">
              <div>
                <span className="text-3xl lg:text-4xl font-serif text-primary">100+</span>
                <p className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">
                  Mahsulotlar
                </p>
              </div>
              <div>
                <span className="text-3xl lg:text-4xl font-serif text-primary">2K+</span>
                <p className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">
                  Mijozlar
                </p>
              </div>
              <div>
                <span className="text-3xl lg:text-4xl font-serif text-primary">100%</span>
                <p className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">
                  Sifat
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-foreground/30 text-foreground hover:bg-foreground/10 group"
            >
              <Link href="/store/asma/about" className="inline-flex items-center gap-2">
                Batafsil o&apos;qish
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}



