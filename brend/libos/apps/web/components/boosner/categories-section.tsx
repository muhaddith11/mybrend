'use client'

import { CategoriesSection as Shared } from '@/components/shared/categories-section'
import { fetchProducts } from '@/lib/boosner/products'

export function CategoriesSection() {
  return <Shared slug="boosner" fetchProducts={fetchProducts} />
}
