import { supabase } from './supabase'
import { Product } from './store'

type DBProduct = {
  id: string
  name: string
  name_uz: string
  price: number
  original_price: number | null
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  description: string
  description_uz: string
  in_stock: boolean
  featured: boolean
  is_new: boolean
  created_at: string
}

function toProduct(row: DBProduct): Product {
  return {
    id: row.id,
    name: row.name,
    nameUz: row.name_uz,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    images: row.images ?? [],
    category: row.category,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    description: row.description,
    descriptionUz: row.description_uz,
    inStock: row.in_stock,
    featured: row.featured,
    new: row.is_new,
  }
}

function toDB(product: Omit<Product, 'id'>): Omit<DBProduct, 'id' | 'created_at'> {
  return {
    name: product.name,
    name_uz: product.nameUz,
    price: product.price,
    original_price: product.originalPrice ?? null,
    images: product.images,
    category: product.category,
    sizes: product.sizes,
    colors: product.colors,
    description: product.description,
    description_uz: product.descriptionUz,
    in_stock: product.inStock,
    featured: product.featured,
    is_new: product.new,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DBProduct[]).map(toProduct)
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(toDB(product))
    .select()
    .single()

  if (error) throw error
  return toProduct(data as DBProduct)
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const dbUpdates: Partial<Omit<DBProduct, 'id' | 'created_at'>> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.nameUz !== undefined) dbUpdates.name_uz = updates.nameUz
  if (updates.price !== undefined) dbUpdates.price = updates.price
  if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice ?? null
  if (updates.images !== undefined) dbUpdates.images = updates.images
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes
  if (updates.colors !== undefined) dbUpdates.colors = updates.colors
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.descriptionUz !== undefined) dbUpdates.description_uz = updates.descriptionUz
  if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock
  if (updates.featured !== undefined) dbUpdates.featured = updates.featured
  if (updates.new !== undefined) dbUpdates.is_new = updates.new

  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toProduct(data as DBProduct)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

