'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '../store/cart'
import styles from './CartDrawer.module.css'

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, totalPrice, itemsByStore } = useCartStore()
  const byStore = itemsByStore()
  const storeIds = Object.keys(byStore)

  return (
    <>
      {/* Overlay */}
      <div className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} onClick={closeCart} />

      {/* Panel */}
      <aside className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.head}>
          <h2 className={styles.title}>Savat</h2>
          <button className={styles.closeBtn} onClick={closeCart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span>🛍️</span>
              <p>Savat bo'sh</p>
            </div>
          ) : (
            storeIds.map(storeId => {
              const group = byStore[storeId]
              const subtotal = group.reduce((s, i) => s + i.price * i.quantity, 0)
              return (
              <div key={storeId} className={styles.storeGroup}>
                <p className={styles.storeName}>
                  <Link href={`/store/${group[0].storeSlug}`} onClick={closeCart}>
                    {group[0].storeName}
                  </Link>
                </p>
                {group.map(item => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className={styles.item}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={64} height={64} className={styles.img} />
                    ) : (
                      <div className={styles.imgPlaceholder} />
                    )}
                    <div className={styles.info}>
                      <p className={styles.itemName}>{item.name}</p>
                      {(item.size || item.color) && (
                        <p className={styles.variants}>{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                      )}
                      <p className={styles.price}>{(item.price * item.quantity).toLocaleString()} so'm</p>
                    </div>
                    <div className={styles.qtyRow}>
                      <button onClick={() => updateQty(item.productId, item.quantity - 1, item.size, item.color)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1, item.size, item.color)}>+</button>
                    </div>
                    <button className={styles.del} onClick={() => removeItem(item.productId, item.size, item.color)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className={styles.storeFooter}>
                  <div className={styles.storeSubtotal}>
                    <span>Jami:</span>
                    <strong>{subtotal.toLocaleString()} so'm</strong>
                  </div>
                  <Link href={`/checkout?store=${storeId}`} className={styles.storeOrderBtn} onClick={closeCart}>
                    Buyurtma berish
                  </Link>
                </div>
              </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Umumiy:</span>
              <strong>{totalPrice().toLocaleString()} so'm</strong>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
