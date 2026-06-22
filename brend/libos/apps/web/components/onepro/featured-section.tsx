'use client'

import { FeaturedSection as Shared } from '@/components/shared/featured-section'
import { ProductCard } from '@/components/onepro/product-card'
import { fetchProducts } from '@/lib/onepro/products'

export function FeaturedSection() {
  return <Shared slug="onepro" fetchProducts={fetchProducts} ProductCard={ProductCard} />
}
