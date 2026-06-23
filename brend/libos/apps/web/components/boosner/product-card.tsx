'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Repeat } from 'lucide-react'
import { toast } from 'sonner'
import { Product, formatPrice } from '@/lib/boosner/store'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { cn } from '@/lib/boosner/utils'

const STORE_SLUG = 'boosner'
const STORE_NAME = 'Boosner'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => s.has(product.id))
  const storeId = product.storeId ?? STORE_SLUG
  const storeName = product.storeName ?? STORE_NAME
  const storeSlug = product.storeSlug ?? STORE_SLUG
  const href = `/store/boosner/product/${product.id}`
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleWishlist({ productId: product.id, name: product.nameUz || product.name, price: product.price, originalPrice: product.originalPrice, image: product.images[0], storeId, storeName, storeSlug })
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    addItem({ productId: product.id, name: product.nameUz || product.name, price: product.price, image: product.images[0], storeId, storeName, storeSlug, size: product.sizes[0] ?? undefined, color: product.colors[0] ?? undefined })
    toast.success('Savatga qo\'shildi', { description: product.nameUz })
  }

  return (
    <div className={cn('group', className)}>
      {/* Image */}
      <Link href={href} className="relative block aspect-[4/5] bg-secondary overflow-hidden" aria-label={product.nameUz}>
        <Image
          src={product.images[0] || '/asma/placeholder.jpg'}
          alt={product.nameUz}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {/* hover actions bottom-right */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistToggle}
            className={cn('w-9 h-9 rounded-full bg-background shadow grid place-items-center transition-colors',
              inWishlist ? 'text-accent' : 'text-foreground hover:text-accent')}
            aria-label="Sevimlilar"
          >
            <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
          </button>
          <span className="w-9 h-9 rounded-full bg-background shadow grid place-items-center text-foreground">
            <Repeat className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Info row: name + price (left), cart button (right) */}
      <div className="flex items-start justify-between gap-3 mt-3">
        <Link href={href} className="min-w-0 flex-1">
          <h3 className="text-sm text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {product.nameUz}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
            )}
            <span className={cn('text-sm font-bold', discount > 0 ? 'text-accent' : 'text-foreground')}>
              {formatPrice(product.price)}
            </span>
          </div>
        </Link>
        <button
          onClick={handleQuickAdd}
          className="shrink-0 w-10 h-10 rounded-full bg-foreground text-background grid place-items-center hover:bg-accent transition-colors"
          aria-label="Savatga qo'shish"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
