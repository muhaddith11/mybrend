'use client'

import { CategoriesSection as Shared } from '@/components/shared/categories-section'
import { fetchProducts } from '@/lib/asma/products'

export function CategoriesSection() {
  return <Shared slug="asma" fetchProducts={fetchProducts} />
}
