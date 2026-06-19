import { Product } from './createStoreState'
import { API, makeAdminAuth } from './apiBase'

type DBProduct = {
  id: string
  sku: string | null
  name: string
  nameUz: string | null
  price: number
  originalPrice: number | null
  images: string[]
  sizes: string[]
  colors: string[]
  description: string | null
  descriptionUz: string | null
  inStock: boolean
  featured: boolean
  isNew: boolean
  category: { slug: string; name: string } | null
}

function toProduct(row: DBProduct): Product {
  return {
    id: row.id,
    sku: row.sku ?? undefined,
    name: row.name,
    nameUz: row.nameUz ?? row.name,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    images: row.images ?? [],
    category: row.category?.slug ?? 'boshqa',
    categoryName: row.category?.name ?? 'Boshqa',
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    description: row.description ?? '',
    descriptionUz: row.descriptionUz ?? '',
    inStock: row.inStock,
    featured: row.featured,
    new: row.isNew,
  }
}

/** Do'kon `slug`i uchun mahsulot API funksiyalarini yaratadi. */
export function createProductsApi(slug: string) {
  const { adminHeaders } = makeAdminAuth(slug)

  async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${API}/stores/${slug}`)
    if (!res.ok) throw new Error('Products fetch failed')
    const data = await res.json()
    return ((data.products ?? []) as DBProduct[]).map(toProduct)
  }

  async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${API}/admin/products`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        sku: product.sku,
        name: product.name,
        nameUz: product.nameUz,
        description: product.description,
        descriptionUz: product.descriptionUz,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        sizes: product.sizes,
        colors: product.colors,
        categorySlug: product.category,
        inStock: product.inStock,
        featured: product.featured,
        isNew: product.new,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Create failed')
    }
    return toProduct(await res.json())
  }

  async function updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const res = await fetch(`${API}/admin/products/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({
        sku: updates.sku,
        name: updates.name ?? '',
        nameUz: updates.nameUz,
        description: updates.description,
        descriptionUz: updates.descriptionUz,
        price: updates.price ?? 0,
        originalPrice: updates.originalPrice,
        images: updates.images ?? [],
        sizes: updates.sizes ?? [],
        colors: updates.colors ?? [],
        categorySlug: updates.category,
        inStock: updates.inStock ?? true,
        featured: updates.featured ?? false,
        isNew: updates.new ?? false,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Update failed')
    }
    return toProduct(await res.json())
  }

  async function deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API}/admin/products/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
    if (!res.ok) throw new Error('Delete failed')
  }

  return { fetchProducts, createProduct, updateProduct, deleteProduct }
}
