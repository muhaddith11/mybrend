'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { Product, useStore, formatPrice, colorMap } from '@/lib/asma/store'
import { cn } from '@/lib/asma/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart, setCartOpen } = useStore()

  const inWishlist = isInWishlist(product.id)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      product,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    })
    setCartOpen(true)
  }

  return (
    <motion.div
      className={cn('group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setImageIndex(0)
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
        {/* Product Image (clickable) */}
        <Link href={`/store/asma/product/${product.id}`} className="absolute inset-0" aria-label={product.nameUz}>
          <Image
            src={product.images[imageIndex] || '/asma/placeholder.jpg'}
            alt={product.nameUz}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.new && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase">
                Yangi
              </span>
            )}
            {product.originalPrice && (
              <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] tracking-wider uppercase">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Quick Actions — always visible on mobile, hover-only on desktop */}
          <div
            className="absolute bottom-3 left-3 right-3 flex items-center gap-2 transition-all duration-300 lg:opacity-0 lg:translate-y-5 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
          >
            <button
              onClick={handleQuickAdd}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-background/95 backdrop-blur-sm text-foreground text-xs tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Qo&apos;shish
            </button>
            <Link
              href={`/store/asma/product/${product.id}`}
              className="p-3 bg-background/95 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-colors',
              inWishlist
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
            aria-label={inWishlist ? "Istaklar ro'yxatidan olib tashlash" : "Istaklar ro'yxatiga qo'shish"}
          >
            <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
          </button>

          {/* Image Dots (if multiple images) */}
          {product.images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setImageIndex(idx)
                  }}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    idx === imageIndex ? 'bg-primary' : 'bg-foreground/30'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <Link href={`/store/asma/product/${product.id}`} className="block space-y-2">
          <h3 className="font-serif text-foreground group-hover:text-primary transition-colors">
            {product.nameUz}
          </h3>
          <p className="text-xs text-muted-foreground">{product.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Options */}
          <div className="flex items-center gap-1.5 pt-2">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: colorMap[color] || color }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </Link>
    </motion.div>
  )
}


