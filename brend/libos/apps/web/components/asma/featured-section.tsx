'use client'

import { FeaturedSection as Shared } from '@/components/shared/featured-section'
import { ProductCard } from '@/components/asma/product-card'
import { fetchProducts } from '@/lib/asma/products'

export function FeaturedSection() {
  return <Shared slug="asma" fetchProducts={fetchProducts} ProductCard={ProductCard} />
}
