'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/asma/product-card'
import { fetchProducts } from '@/lib/asma/products'
import { Product } from '@/lib/asma/store'
import { useWishlistStore } from '@/store/wishlist'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  // ZYFF umumiy sevimli (do'кон saytи sevimli sahifаси ham shu ro'yxatni ko'rsatadi)
  const wishlistIds = useWishlistStore((s) => s.items.map((i) => i.productId))
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then((all) => {
      setProducts(all)
      setLoading(false)
    })
  }, [])

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id))

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-wider text-foreground mb-4">
            Istaklar ro&apos;yxati
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sizga yoqqan mahsulotlar shu yerda saqlanadi
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Yuklanmoqda...</span>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-6" />
            <p className="text-muted-foreground mb-6">
              Istaklar ro&apos;yxatingiz bo&apos;sh
            </p>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/store/asma/collection">Kolleksiyani ko&apos;rish</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
            {wishlistProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


