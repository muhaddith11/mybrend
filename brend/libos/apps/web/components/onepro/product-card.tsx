'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Product, useStore, formatPrice } from '@/lib/onepro/store'

const BASE = '/store/onepro'

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useStore()
  const liked = wishlist.includes(product.id)
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    liked ? removeFromWishlist(product.id) : addToWishlist(product.id)
  }

  return (
    <div className="group">
      <div className="relative border-2 border-foreground bg-background transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opb-shadow">
        <Link href={`${BASE}/product/${product.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-[var(--cream)]">
            <img
              src={product.images[0] || '/asma/placeholder.jpg'}
              alt={product.nameUz}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute left-0 top-2 flex flex-col gap-1">
              {product.new && (
                <span className="bg-[var(--volt)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">Yangi</span>
              )}
              {discount > 0 && (
                <span className="bg-[var(--flame)] px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
              )}
            </div>
            {!product.inStock && (
              <div className="absolute inset-0 grid place-items-center bg-background/75">
                <span className="border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase">Tugagan</span>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={toggle}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center border-2 border-foreground bg-background transition-transform hover:scale-110 active:scale-95"
          aria-label="Sevimlilarga qo'shish"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-[var(--flame)] text-[var(--flame)]' : 'text-foreground'}`} />
        </button>

        <div className="border-t-2 border-foreground p-3">
          <Link href={`${BASE}/product/${product.id}`}>
            <h3 className="line-clamp-1 text-sm font-bold uppercase tracking-tight transition-colors group-hover:text-[var(--flame)]">{product.nameUz}</h3>
          </Link>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-lg">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="text-xs text-foreground/40 line-through">{formatPrice(product.originalPrice!)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
