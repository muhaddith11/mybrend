'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useProductModal } from '../store/productModal'
import { useCartStore } from '../store/cart'
import styles from './ProductOptionsModal.module.css'

// Global "rang/o'lcham tanlash" oynasi. Root layout'da bir marta mount qilinadi;
// barcha quick-add tugmalari `useProductModal().open(...)` orqali ochadi.
export function ProductOptionsModal() {
  const product = useProductModal((s) => s.product)
  const close = useProductModal((s) => s.close)
  const addItem = useCartStore((s) => s.addItem)

  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)

  // Yangi mahsulot ochilganda tanlovni tozalaymiz.
  useEffect(() => {
    setSize(null)
    setColor(null)
  }, [product?.productId])

  // Escape bilan yopish + fon scroll'ini bloklash (oyna ochiq vaqtda).
  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [product, close])

  if (!product) return null

  const needColor = product.colors.length > 0
  const needSize = product.sizes.length > 0
  const canAdd = (!needColor || !!color) && (!needSize || !!size)
  const accent = product.themeColor || '#111827'

  function confirm() {
    if (!canAdd || !product) return
    addItem({
      productId: product.productId,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: product.storeId,
      storeName: product.storeName,
      storeSlug: product.storeSlug,
      size: size ?? undefined,
      color: color ?? undefined,
    })
    toast.success("Savatga qo'shildi", { description: product.name })
    close()
  }

  return (
    <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={close} aria-label="Yopish">×</button>

        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.thumb} src={product.image} alt={product.name} />
        )}
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{product.price.toLocaleString()} so'm</p>

        {needColor && (
          <div className={styles.group}>
            <p className={styles.label}>Rang{color ? `: ${color}` : ''}</p>
            <div className={styles.chips}>
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.chip} ${color === c ? styles.chipActive : ''}`}
                  style={color === c ? { borderColor: accent, background: accent, color: '#fff' } : {}}
                  onClick={() => setColor(c === color ? null : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {needSize && (
          <div className={styles.group}>
            <p className={styles.label}>O'lcham{size ? `: ${size}` : ''}</p>
            <div className={styles.chips}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.chip} ${size === s ? styles.chipActive : ''}`}
                  style={size === s ? { borderColor: accent, background: accent, color: '#fff' } : {}}
                  onClick={() => setSize(s === size ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className={styles.addBtn}
          disabled={!canAdd}
          onClick={confirm}
          style={canAdd ? { background: accent } : undefined}
        >
          {canAdd ? "Savatga qo'shish" : 'Variantni tanlang'}
        </button>
      </div>
    </div>
  )
}
