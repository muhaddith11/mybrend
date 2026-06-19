'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { useCartStore } from '../../../store/cart'
import styles from './page.module.css'

type StoreFull = Store & { products?: Product[] }

export function StoreView({ slug, initialStore }: { slug: string; initialStore: StoreFull | null }) {
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => api.stores.getBySlug(slug),
    initialData: initialStore ?? undefined,
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', store?.id],
    queryFn: () => api.products.byStore(store!.id),
    enabled: !!store?.id,
    initialData: initialStore?.products as Product[] | undefined,
  })

  const addItem = useCartStore(s => s.addItem)

  if (storeLoading) return <StoreSkeleton />
  if (!store) return <div className={styles.notFound}>Do'kon topilmadi</div>

  const theme = store.themeColor ?? '#534AB7'
  const themeBg = store.themeBg ?? '#EEEDFE'
  const items: Product[] = products ?? []

  return (
    <div>
      {/* Store header */}
      <div className={styles.storeHeader} style={{ background: `linear-gradient(135deg, ${theme} 0%, ${theme}cc 100%)` }}>
        <div className="container">
          <div className={styles.headerInner}>
            {store.logo ? (
              <Image src={store.logo} alt={store.name} width={72} height={72} className={styles.logo} />
            ) : (
              <div className={styles.logoFallback} style={{ background: themeBg, color: theme }}>
                {store.name.charAt(0)}
              </div>
            )}
            <div className={styles.headerInfo}>
              <h1 className={styles.storeName}>{store.name}</h1>
              {store.description && <p className={styles.storeDesc}>{store.description}</p>}
              {store.address && (
                <p className={styles.storeAddr}>📍 {store.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <h2 className={styles.sectionTitle}>Mahsulotlar</h2>
        {productsLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>Hozircha mahsulotlar yo'q</div>
        ) : (
          <div className={styles.grid}>
            {items.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                store={store}
                onAddCart={() => addItem({
                  productId: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.images?.[0],
                  storeId: store.id,
                  storeName: store.name,
                  storeSlug: store.slug,
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, store, onAddCart }: { product: Product; store: any; onAddCart: () => void }) {
  const theme = store.themeColor ?? '#534AB7'

  return (
    <div className={styles.prodCard}>
      <Link href={`/product/${product.id}`} className={styles.prodImgWrap}>
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className={styles.prodImg} />
        ) : (
          <div className={styles.prodImgFallback} style={{ color: theme }}>
            {product.name.charAt(0)}
          </div>
        )}
        {product.inStock === false && <div className={styles.outOfStock}>Tugagan</div>}
      </Link>
      <div className={styles.prodBody}>
        <Link href={`/product/${product.id}`} className={styles.prodName}>{product.name}</Link>
        <p className={styles.prodPrice} style={{ color: theme }}>
          {product.price.toLocaleString()} so'm
        </p>
        <button
          className={styles.addBtn}
          style={{ background: theme }}
          disabled={product.inStock === false}
          onClick={onAddCart}
        >
          + Savatga
        </button>
      </div>
    </div>
  )
}

function StoreSkeleton() {
  return (
    <div>
      <div style={{ height: 200, background: 'linear-gradient(135deg, #eee 0%, #ddd 100%)' }} />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className={styles.prodCard}>
      <div className={styles.skImg} />
      <div style={{ padding: '.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, borderRadius: 6, background: '#eee', width: '75%' }} />
        <div style={{ height: 14, borderRadius: 6, background: '#eee', width: '45%' }} />
      </div>
    </div>
  )
}
