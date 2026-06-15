'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/onepro/product-card'
import { fetchProducts } from '@/lib/onepro/products'
import { Product } from '@/lib/onepro/store'

export function FeaturedSection() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts().then((all) => setFeaturedProducts(all.filter((p) => p.featured)))
  }, [])

  if (featuredProducts.length === 0) return null

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
            Tanlangan
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-wider text-foreground mt-4 mb-6">
            Tavsiya etilgan kolleksiya
          </h2>
          <p className="max-w-lg mx-auto text-muted-foreground text-sm leading-relaxed">
            Bizning eng mashhur va eng sifatli mahsulotlarimizni kashf eting
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/store/onepro/collection"
            className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-foreground hover:text-primary transition-colors group"
          >
            Barcha mahsulotlarni ko&apos;rish
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

