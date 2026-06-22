'use client'

import { ProductForm as Shared } from '@/components/shared/product-form'
import type { Product } from '@/lib/boosner/store'
import { createProduct, updateProduct } from '@/lib/boosner/products'
import { Button } from '@/components/boosner/ui/button'
import { Input } from '@/components/boosner/ui/input'

interface ProductFormProps {
  initialData?: Product
  mode: 'new' | 'edit'
}

export function ProductForm(props: ProductFormProps) {
  return (
    <Shared
      {...props}
      slug="boosner"
      createProduct={createProduct}
      updateProduct={updateProduct}
      Button={Button}
      Input={Input}
    />
  )
}
