import type { Metadata } from 'next'
import { cache } from 'react'
import { api } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { ProductView } from './ProductView'

// Server'da render — Google bo'sh emas, to'liq HTML ko'radi. 5 daqiqada yangilanadi.
export const revalidate = 300

type ProductFull = Product & { store?: Store }

// cache() — generateMetadata va Page bir so'rovda bitta fetch ishlatadi
const getProduct = cache(async (id: string): Promise<ProductFull | null> => {
  try {
    return await api.products.getById(id)
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) return { title: 'Mahsulot topilmadi' }

  const title = p.nameUz || p.name
  const desc = (
    p.description?.trim() ||
    `${title}${p.store?.name ? ` — ${p.store.name}` : ''}. ZYFF orqali Qo'qonda xarid qiling.`
  ).slice(0, 160)
  const img = p.images?.[0]

  return {
    title,
    description: desc,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: `/product/${id}`,
      images: img ? [{ url: img }] : undefined,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.nameUz || product.name,
        description: product.description || undefined,
        image: product.images?.length ? product.images : undefined,
        sku: product.sku || undefined,
        ...(product.store ? { brand: { '@type': 'Brand', name: product.store.name } } : {}),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'UZS',
          availability: (product.inStock ?? true)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `https://zyff.uz/product/${id}`,
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ProductView id={id} initialProduct={product} />
    </>
  )
}
