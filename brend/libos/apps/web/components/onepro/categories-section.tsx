'use client'

import { CategoriesSection as Shared } from '@/components/shared/categories-section'
import { fetchProducts } from '@/lib/onepro/products'

export function CategoriesSection() {
  return <Shared slug="onepro" fetchProducts={fetchProducts} />
}
