import type { Metadata } from 'next'
import { cache } from 'react'
import { api } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { StoreView } from './StoreView'

// Server'da render — har do'kon sahifasi to'liq HTML va unik metadata bilan. 5 daqiqada yangilanadi.
export const revalidate = 300

type StoreFull = Store & { products?: Product[] }

const getStore = cache(async (slug: string): Promise<StoreFull | null> => {
  try {
    return await api.stores.getBySlug(slug)
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) return { title: 'Do\'kon topilmadi' }

  const title = store.name
  const desc = (
    store.description?.trim() ||
    `${store.name} — ZYFF marketplace'dagi do'kon.${store.address ? ` Manzil: ${store.address}.` : ''} Qo'qonda yetkazib berish.`
  ).slice(0, 160)

  return {
    title,
    description: desc,
    alternates: { canonical: `/store/${slug}` },
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: `/store/${slug}`,
      images: store.logo ? [{ url: store.logo }] : undefined,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = await getStore(slug)
  return <StoreView slug={slug} initialStore={store} />
}
