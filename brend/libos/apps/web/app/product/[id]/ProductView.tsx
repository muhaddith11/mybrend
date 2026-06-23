'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { useCartStore } from '../../../store/cart'
import { useLangStore } from '../../../store/lang'
import { useT } from '../../../lib/i18n'
import styles from './page.module.css'

type ProductFull = Product & { store?: Store }

export function ProductView({ id, initialProduct }: { id: string; initialProduct: ProductFull | null }) {
  const addItem = useCartStore(s => s.addItem)
  const tr = useT(useLangStore(s => s.lang))

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.getById(id),
    initialData: initialProduct ?? undefined,
  })

  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  if (isLoading) return <div className={styles.loading}>{tr.loading}</div>
  if (!product) return <div className={styles.notFound}>{tr.prNotFound}</div>

  const store = product.store
  const theme = store?.themeColor ?? '#534AB7'
  const images: string[] = product.images ?? []

  // Unique sizes & colors from variants
  const sizes = [...new Set((product.variants ?? []).map((v: any) => v.size).filter(Boolean))]
  const colors = [...new Set((product.variants ?? []).map((v: any) => v.color).filter(Boolean))]

  function handleAddToCart() {
    if (!product) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      storeId: store?.id ?? '',
      storeName: store?.name ?? '',
      storeSlug: store?.slug ?? '',
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">{tr.prHome}</Link>
        {store && <><span>/</span><Link href={`/store/${store.slug}`}>{store.name}</Link></>}
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Images */}
        <div className={styles.images}>
          <div className={styles.mainImg}>
            {images[selectedImg] ? (
              <Image src={images[selectedImg]} alt={product.name} fill className={styles.img} />
            ) : (
              <div className={styles.imgFallback} style={{ color: theme }}>{product.name.charAt(0)}</div>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${selectedImg === i ? styles.thumbActive : ''}`}
                  style={selectedImg === i ? { borderColor: theme } : {}}
                  onClick={() => setSelectedImg(i)}
                >
                  <Image src={src} alt="" fill className={styles.img} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className={styles.details}>
          {store && (
            <Link href={`/store/${store.slug}`} className={styles.storeLink} style={{ color: theme }}>
              ← {store.name}
            </Link>
          )}
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price} style={{ color: theme }}>
            {product.price.toLocaleString()} {tr.som}
          </p>

          {product.description && (
            <p className={styles.desc}>{product.description}</p>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className={styles.variantSection}>
              <p className={styles.variantLabel}>{tr.prSize}</p>
              <div className={styles.variantRow}>
                {sizes.map((s: string) => (
                  <button
                    key={s}
                    className={`${styles.variantBtn} ${selectedSize === s ? styles.variantActive : ''}`}
                    style={selectedSize === s ? { borderColor: theme, background: theme, color: '#fff' } : {}}
                    onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className={styles.variantSection}>
              <p className={styles.variantLabel}>{tr.prColor}</p>
              <div className={styles.variantRow}>
                {colors.map((c: string) => (
                  <button
                    key={c}
                    className={`${styles.variantBtn} ${selectedColor === c ? styles.variantActive : ''}`}
                    style={selectedColor === c ? { borderColor: theme, background: theme, color: '#fff' } : {}}
                    onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <p className={styles.stock}>
            {(product.inStock ?? true)
              ? <span className={styles.inStock}>{tr.prInStock}</span>
              : <span className={styles.outStock}>{tr.prSoldOut}</span>}
          </p>

          {/* Add to cart */}
          <button
            className={styles.addBtn}
            style={{ background: theme }}
            onClick={handleAddToCart}
            disabled={product.inStock === false}
          >
            {added ? `✓ ${tr.addedToCart}` : `🛍 ${tr.addToCart}`}
          </button>
        </div>
      </div>
    </div>
  )
}
