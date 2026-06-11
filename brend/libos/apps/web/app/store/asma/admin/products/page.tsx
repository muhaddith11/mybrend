'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { formatPrice, categories, Product } from '@/lib/asma/store'
import { fetchProducts, deleteProduct } from '@/lib/asma/products'
import { Button } from '@/components/asma/ui/button'
import { Input } from '@/components/asma/ui/input'
import { cn } from '@/lib/asma/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameUz.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      try {
        await deleteProduct(id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } catch (e) {
        console.error(e)
      } finally {
        setDeletingId(null)
      }
    } else {
      setDeletingId(id)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">
            Mahsulotlar
          </h1>
          <p className="text-muted-foreground">
            Jami {products.length} ta mahsulot
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/store/asma/admin/products/new" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yangi mahsulot
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap border rounded transition-colors',
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary'
              )}
            >
              {cat.nameUz}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-xs tracking-wider uppercase text-muted-foreground font-medium">
                    Mahsulot
                  </th>
                  <th className="text-left p-4 text-xs tracking-wider uppercase text-muted-foreground font-medium hidden sm:table-cell">
                    Kategoriya
                  </th>
                  <th className="text-left p-4 text-xs tracking-wider uppercase text-muted-foreground font-medium">
                    Narx
                  </th>
                  <th className="text-left p-4 text-xs tracking-wider uppercase text-muted-foreground font-medium hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-right p-4 text-xs tracking-wider uppercase text-muted-foreground font-medium">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 bg-muted rounded overflow-hidden shrink-0">
                          <Image
                            src={product.images[0] || '/asma/placeholder.jpg'}
                            alt={product.nameUz}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {product.nameUz}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground capitalize">
                        {categories.find((c) => c.id === product.category)?.nameUz || product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {formatPrice(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {product.inStock ? (
                          <span className="flex items-center gap-1 text-sm text-green-500">
                            <Eye className="w-4 h-4" />
                            Faol
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <EyeOff className="w-4 h-4" />
                            Nofaol
                          </span>
                        )}
                        {product.new && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider rounded">
                            Yangi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className={cn(
                            'p-2 transition-colors',
                            deletingId === product.id
                              ? 'text-destructive'
                              : 'text-muted-foreground hover:text-destructive'
                          )}
                          title={deletingId === product.id ? 'Tasdiqlash uchun qayta bosing' : "O'chirish"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {deletingId === product.id && (
                        <p className="text-[10px] text-destructive text-right mt-1">
                          Tasdiqlash uchun qayta bosing
                        </p>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
                <Link href="/store/asma/admin/products/new" className="text-primary text-sm hover:underline mt-2 inline-block">
                  Birinchi mahsulotni qo&apos;shing
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}




