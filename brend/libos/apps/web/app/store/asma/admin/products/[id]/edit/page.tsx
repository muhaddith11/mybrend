'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchProducts } from '@/lib/asma/products'
import { Product } from '@/lib/asma/store'
import { ProductForm } from '@/components/asma/product-form'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then((products) => {
      const found = products.find((p) => p.id === id)
      setProduct(found ?? null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Yuklanmoqda...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Mahsulot topilmadi</p>
        <Link href="/store/asma/admin/products" className="text-primary hover:underline text-sm">
          Mahsulotlarga qaytish
        </Link>
      </div>
    )
  }

  return <ProductForm mode="edit" initialData={product} />
}


