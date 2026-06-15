'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { fetchProducts } from '@/lib/boosner/products'
import { Product } from '@/lib/boosner/store'

export function CategoriesSection() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {})
  }, [])

  // Kategoriyalar haqiqiy mahsulotlardan olinadi — har biri uchun vakil rasm va
  // mahsulot soni. Link to'g'ri slug bilan /store/boosner/collection ga ketadi.
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; image?: string; count: number }>()
    for (const p of products) {
      if (!p.category) continue
      const ex = map.get(p.category)
      if (ex) {
        ex.count++
        if (!ex.image && p.images[0]) ex.image = p.images[0]
      } else {
        map.set(p.category, { id: p.category, name: p.categoryName || p.category, image: p.images[0], count: 1 })
      }
    }
    return [...map.values()]
  }, [products])

  if (categories.length === 0) return null

  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
            Kategoriyalar
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-wider text-foreground mt-4">
            Kategoriya bo&apos;yicha tanlang
          </h2>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/store/boosner/collection?category=${encodeURIComponent(category.id)}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-muted"
              >
                {/* Background Image */}
                <Image
                  src={category.image || '/asma/placeholder.jpg'}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <motion.div
                    initial={false}
                    className="transform transition-transform duration-300 group-hover:-translate-y-2"
                  >
                    <h3 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.count} ta mahsulot
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm text-primary tracking-wider uppercase">
                      Ko&apos;rish
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </motion.div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 transition-colors duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


