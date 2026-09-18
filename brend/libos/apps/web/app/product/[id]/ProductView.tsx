'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { useCartStore } from '../../../store/cart'
import { useWishlistStore } from '../../../store/wishlist'
import { useLangStore } from '../../../store/lang'
import { useT } from '../../../lib/i18n'
import styles from './page.module.css'

type ProductFull = Product & { store?: Store }

export function ProductView({ id, initialProduct }: { id: string; initialProduct: ProductFull | null }) {
  const addItem = useCartStore(s => s.addItem)
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const toggleWishlist = useWishlistStore(s => s.toggle)
  const inWishlist = useWishlistStore(s => s.has(id))

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.getById(id),
    initialData: initialProduct ?? undefined,
  })

  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [selectErr, setSelectErr] = useState('')

  if (isLoading) return <div className={styles.loading}>{tr.loading}</div>
  if (!product) return <div className={styles.notFound}>{tr.prNotFound}</div>

  const store = product.store
  const theme = store?.themeColor ?? '#534AB7'
  const images: string[] = product.images ?? []
  const inStock = product.inStock ?? true

  // O'lcham/rang avval tekis massivdan (sizes/colors — hozirgi admin panellar
  // shu yerga yozadi), bo'lmasa eski `variants`dan (mobil app/product/[id].tsx
  // bilan bir xil mantiq — avval faqat variants'dan o'qilardi, ko'p mahsulotda
  // sizes/colors bo'lsa ham ko'rinmasdi).
  const sizes: string[] = (product as any).sizes?.length
    ? (product as any).sizes
    : [...new Set((product.variants ?? []).map((v: any) => v.size).filter(Boolean))]
  const colors: string[] = (product as any).colors?.length
    ? (product as any).colors
    : [...new Set((product.variants ?? []).map((v: any) => v.color).filter(Boolean))]

  function handleToggleWishlist() {
    if (!product) return
    toggleWishlist({
      productId: product.id,
      name: product.nameUz || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: images[0],
      storeId: store?.id ?? '',
      storeName: store?.name ?? '',
      storeSlug: store?.slug ?? '',
      themeBg: store?.themeBg,
    })
  }

  function handleAddToCart() {
    if (!product) return
    // O'lcham/rang bor bo'lsa — tanlanmasdan savatga qo'shib bo'lmaydi
    // (mobil bilan bir xil — avval web'da bu tekshiruv yo'q edi).
    if (sizes.length > 0 && !selectedSize) {
      setSelectErr(lang === 'ru' ? 'Выберите размер' : lang === 'en' ? 'Select a size' : "O'lchamni tanlang")
      return
    }
    if (colors.length > 0 && !selectedColor) {
      setSelectErr(lang === 'ru' ? 'Выберите цвет' : lang === 'en' ? 'Select a color' : 'Rangni tanlang')
      return
    }
    setSelectErr('')
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
          <div className={styles.topRow}>
            {store && (
              <Link href={`/store/${store.slug}`} className={styles.storeLink} style={{ color: theme }}>
                ← {store.name}
              </Link>
            )}
            <button
              className={`${styles.heartBtn} ${inWishlist ? styles.heartActive : ''}`}
              onClick={handleToggleWishlist}
              aria-label={tr.wishlist}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.priceRow}>
            <p className={styles.price} style={{ color: theme }}>
              {product.price.toLocaleString()} {tr.som}
            </p>
            {!!product.originalPrice && product.originalPrice > product.price && (
              <p className={styles.priceOld}>{product.originalPrice.toLocaleString()} {tr.som}</p>
            )}
          </div>

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
                    onClick={() => { setSelectedSize(s === selectedSize ? null : s); setSelectErr('') }}
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
                    onClick={() => { setSelectedColor(c === selectedColor ? null : c); setSelectErr('') }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <p className={styles.stock}>
            {inStock
              ? <span className={styles.inStock}>{tr.prInStock}</span>
              : <span className={styles.outStock}>{tr.prSoldOut}</span>}
          </p>

          {!!selectErr && <p className={styles.selectErr}>{selectErr}</p>}

          {/* Add to cart */}
          <button
            className={styles.addBtn}
            style={{ background: theme }}
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {added ? `✓ ${tr.addedToCart}` : `🛍 ${tr.addToCart}`}
          </button>
        </div>
      </div>
    </div>
  )
}
