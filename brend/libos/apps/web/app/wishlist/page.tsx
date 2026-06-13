'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlistStore } from '../../store/wishlist'
import { useLangStore } from '../../store/lang'
import { useCartStore } from '../../store/cart'
import { useT } from '../../lib/i18n'
import styles from './page.module.css'

function formatPrice(n: number) {
  return n.toLocaleString('ru-RU')
}

export default function WishlistPage() {
  const { items, remove, clear } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const cur = lang === 'ru' ? 'сум' : lang === 'en' ? 'UZS' : "so'm"

  const title = lang === 'ru' ? 'Избранное' : lang === 'en' ? 'Favorites' : 'Sevimlilar'
  const emptyText = lang === 'ru' ? 'Нет сохранённых товаров' : lang === 'en' ? 'No saved items' : 'Saqlangan mahsulot yo\'q'
  const clearAll = lang === 'ru' ? 'Очистить всё' : lang === 'en' ? 'Clear all' : 'Hammasini tozalash'
  const addToCartLabel = lang === 'ru' ? 'В корзину' : lang === 'en' ? 'Add to cart' : 'Savatga'
  const removeLabel = lang === 'ru' ? 'Удалить' : lang === 'en' ? 'Remove' : 'O\'chirish'

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <h1 className={styles.title}>
            ❤️ {title}
            {items.length > 0 && <span className={styles.count}>{items.length}</span>}
          </h1>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={clear}>{clearAll}</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🤍</div>
            <p className={styles.emptyText}>{emptyText}</p>
            <Link href="/" className={styles.shopBtn}>{tr.catalog}</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item.productId} className={styles.card}>
                <Link href={`/store/${item.storeSlug}`} className={styles.cardImgWrap} style={{ background: item.themeBg ?? '#EEF2FF' }}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardInitial}>{item.name.charAt(0).toUpperCase()}</div>
                  )}
                </Link>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>{item.name}</p>
                  <p className={styles.cardStore}>{item.storeName}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(item.price)} {cur}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className={styles.priceOld}>{formatPrice(item.originalPrice)} {cur}</span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.cartBtn}
                      onClick={() => addItem({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        storeId: item.storeId,
                        storeName: item.storeName,
                        storeSlug: item.storeSlug,
                      })}
                    >
                      🛒 {addToCartLabel}
                    </button>
                    <button className={styles.removeBtn} onClick={() => remove(item.productId)}>
                      {removeLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
