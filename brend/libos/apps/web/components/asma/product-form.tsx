'use client'

import { ProductForm as Shared } from '@/components/shared/product-form'
import type { Product } from '@/lib/asma/store'
import { createProduct, updateProduct } from '@/lib/asma/products'
import { Button } from '@/components/asma/ui/button'
import { Input } from '@/components/asma/ui/input'

interface ProductFormProps {
  initialData?: Product
  mode: 'new' | 'edit'
}

export function ProductForm(props: ProductFormProps) {
  return (
    <Shared
      {...props}
      slug="asma"
      createProduct={createProduct}
      updateProduct={updateProduct}
      Button={Button}
      Input={Input}
    />
  )
}
