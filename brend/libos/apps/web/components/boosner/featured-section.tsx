'use client'

import { FeaturedSection as Shared } from '@/components/shared/featured-section'
import { ProductCard } from '@/components/boosner/product-card'
import { fetchProducts } from '@/lib/boosner/products'

export function FeaturedSection() {
  return <Shared slug="boosner" fetchProducts={fetchProducts} ProductCard={ProductCard} />
}
