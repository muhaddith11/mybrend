'use client'

import { ProductForm as Shared } from '@/components/shared/product-form'
import type { Product } from '@/lib/onepro/store'
import { createProduct, updateProduct } from '@/lib/onepro/products'
import { Button } from '@/components/onepro/ui/button'
import { Input } from '@/components/onepro/ui/input'

interface ProductFormProps {
  initialData?: Product
  mode: 'new' | 'edit'
}

export function ProductForm(props: ProductFormProps) {
  return (
    <Shared
      {...props}
      slug="onepro"
      createProduct={createProduct}
      updateProduct={updateProduct}
      Button={Button}
      Input={Input}
    />
  )
}
