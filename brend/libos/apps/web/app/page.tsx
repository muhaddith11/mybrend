'use client'
import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@libos/shared'
import type { Store, Product } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { useWishlistStore } from '../store/wishlist'
import { useLangStore } from '../store/lang'
import { useT } from '../lib/i18n'
import { MapSection } from '../components/MapSection'
import styles from './page.module.css'

const CARD_COLORS = [
  '#EEF2FF', '#FFE4E8', '#E0F2FE', '#FEF9C3', '#DCFCE7',
  '#FDF4FF', '#FFF7ED', '#F0FDFA', '#FEE2E2', '#F3E8FF',
]

function getDiscount(price: number, original?: number) {
  if (!original || original <= price) return null
  return Math.round((1 - price / original) * 100)
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-RU')
}

function HomePageInner() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)

const { data: featuredData, isLoading: featLoading } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => api.products.featured(),
    staleTime: 60_000,
  })

  const { data: discountedData, isLoading: discLoading } = useQuery({
    queryKey: ['products-discounted'],
    queryFn: () => api.products.discounted(),
    staleTime: 60_000,
  })

  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['stores-home'],
    queryFn: () => api.stores.list({ limit: 8 }),
    staleTime: 60_000,
  })

  const featured = featuredData?.products ?? []
  const discounted = discountedData?.products ?? []
  const stores = storesData?.stores ?? []

  // Currency label per lang
  const cur = lang === 'ru' ? 'сум' : lang === 'en' ? 'UZS' : "so'm"

  return (
    <div className={styles.page}>
      {/* ── Hero section ── */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroBanner}>
            <div className={styles.heroBadge}>{tr.heroBadge}</div>
            <h1 className={styles.heroTitle}>{tr.heroTitle}</h1>
            <p className={styles.heroSub}>{tr.heroSub}</p>
            <Link href="/?sale=true" className={styles.heroBtn}>{tr.heroBtn}</Link>
            <div className={styles.heroBg}>%</div>
          </div>
          <div className={styles.heroCards}>
            <div className={styles.infoCard} style={{ background: '#ECFDF5' }}>
              <div>
                <div className={styles.infoTitle}>{tr.freeDelivery}</div>
                <div className={styles.infoSub}>{tr.freeDeliverySub}</div>
              </div>
              <span className={styles.infoEmoji}>🚚</span>
            </div>
            <div className={styles.infoCard} style={{ background: '#FFF7ED' }}>
              <div>
                <div className={styles.infoTitle}>{stores.length > 0 ? `${stores.length}+` : '5+'} {tr.storeCount}</div>
                <div className={styles.infoSub}>{tr.topStores}</div>
              </div>
              <span className={styles.infoEmoji}>🏬</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stores ── */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{tr.storesSection}</h2>
            <Link href="/stores" className={styles.sectionAll}>{tr.seeAll}</Link>
          </div>
          <div className={styles.storesGrid}>
            {storesLoading
              ? Array.from({ length: 6 }).map((_, i) => <StoreSkeleton key={i} />)
              : stores.map(s => <StoreListCard key={s.id} store={s} tr={tr} />)
            }
          </div>
        </div>
      </section>

      {/* ── Popular products ── */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{tr.popularProducts}</h2>
            <Link href="/stores" className={styles.sectionAll}>{tr.seeAll}</Link>
          </div>
          <div className={styles.productsGrid}>
            {featLoading || storesLoading
              ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
              : featured.length > 0
                ? featured.slice(0, 5).map((p, i) => <ProductCard key={p.id} product={p} colorIdx={i} tr={tr} cur={cur} />)
                : stores.slice(0, 5).map((s, i) => <StoreCard key={s.id} store={s} colorIdx={i} tr={tr} />)
            }
          </div>
        </div>
      </section>

      {/* ── Promo banner ── */}
      <section className={styles.promoBanner}>
        <div className="container">
          <div className={styles.promoInner}>
            <div className={styles.promoLeft}>
              <span className={styles.promoIcon}>🔥</span>
              <div>
                <div className={styles.promoTitle}>{tr.weeklyDeals}</div>
                <div className={styles.promoSub}>{tr.weeklyDealsSub}</div>
              </div>
            </div>
            <Link href="/?sale=true" className={styles.promoBtn}>{tr.seeDeals}</Link>
          </div>
        </div>
      </section>

      {/* ── Discounted products ── */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{tr.discountedProducts}</h2>
            <Link href="/?sale=true" className={styles.sectionAll}>{tr.seeAll}</Link>
          </div>
          <div className={styles.productsGrid}>
            {discLoading || storesLoading
              ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
              : discounted.length > 0
                ? discounted.slice(0, 5).map((p, i) => <ProductCard key={p.id} product={p} colorIdx={i + 5} tr={tr} cur={cur} />)
                : stores.slice(0, 5).map((s, i) => <StoreCard key={s.id} store={s} colorIdx={i + 5} tr={tr} />)
            }
          </div>
        </div>
      </section>

      {/* ── Xarita ── */}
      {!storesLoading && (
        <MapSection
          stores={stores}
          lang={lang}
          title={lang === 'ru' ? 'Магазины на карте' : lang === 'en' ? 'Stores on map' : "Do'konlar xaritada"}
        />
      )}

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogo}>
                <div className={styles.footerLogoMark}>Z</div>
                <span className={styles.footerLogoText}>ZYFF</span>
              </Link>
              <p className={styles.footerDesc}>{tr.footerDesc}</p>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>{tr.catalog}</div>
              <Link href="/?gender=MEN" className={styles.footerLink}>{tr.men}</Link>
              <Link href="/?gender=WOMEN" className={styles.footerLink}>{tr.women}</Link>
              <Link href="/?gender=KIDS" className={styles.footerLink}>{tr.kids}</Link>
              <Link href="/?category=accessories" className={styles.footerLink}>{tr.accessories}</Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>{tr.company}</div>
              <Link href="/about" className={styles.footerLink}>{tr.aboutUs}</Link>
              <Link href="/open-store" className={styles.footerLink}>{tr.openStore}</Link>
              <Link href="/delivery" className={styles.footerLink}>{tr.delivery}</Link>
              <Link href="/help" className={styles.footerLink}>{tr.help}</Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>{tr.contact}</div>
              <a href="tel:+998502500550" className={styles.footerLink}>+998 50 250 05 50</a>
              <a href="https://instagram.com/_muhaddith_7" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Instagram: @_muhaddith_7</a>
              <a href="https://t.me/muhaddith707" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Telegram: @muhaddith707</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>{tr.copyright}</span>
            <span>{tr.city}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  )
}

// ── Product Card ──────────────────────────────
function ProductCard({ product, colorIdx, tr, cur }: { product: Product; colorIdx: number; tr: Record<string, string>; cur: string }) {
  const addItem = useCartStore(s => s.addItem)
  const toggleWishlist = useWishlistStore(s => s.toggle)
  const inWishlist = useWishlistStore(s => s.has(product.id))
  const discount = getDiscount(product.price, product.originalPrice)
  const bg = product.store?.themeBg ?? CARD_COLORS[colorIdx % CARD_COLORS.length]
  const initial = (product.store?.name ?? product.name).charAt(0).toUpperCase()

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.nameUz || product.name,
      price: product.price,
      image: product.images?.[0],
      storeId: product.storeId ?? product.store?.id ?? '',
      storeName: product.store?.name ?? '',
      storeSlug: product.store?.slug ?? '',
    })
  }

  function handleHeart(e: React.MouseEvent) {
    e.preventDefault()
    toggleWishlist({
      productId: product.id,
      name: product.nameUz || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0],
      storeId: product.storeId ?? product.store?.id ?? '',
      storeName: product.store?.name ?? '',
      storeSlug: product.store?.slug ?? '',
      themeBg: bg,
    })
  }

  return (
    <Link href={product.store ? `/store/${product.store.slug}` : '#'} className={styles.productCard}>
      <div className={styles.cardImg} style={{ background: bg }}>
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className={styles.cardImgEl} />
        ) : (
          <div className={styles.cardInitial}>{initial}</div>
        )}
        {discount && <span className={styles.discountBadge}>-{discount}%</span>}
        <button
          className={`${styles.heartBtn} ${inWishlist ? styles.heartActive : ''}`}
          onClick={handleHeart}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.priceRow}>
          <span className={styles.priceMain}>{formatPrice(product.price)} <span className={styles.priceCur}>{cur}</span></span>
          {product.originalPrice && <span className={styles.priceOld}>{formatPrice(product.originalPrice)} {cur}</span>}
        </div>
        <p className={styles.productName}>{product.nameUz || product.name}</p>
        <div className={styles.metaRow}>
          <span className={styles.rating}>★ 4.8</span>
          <span className={styles.storeName}>{product.store?.name ?? ''}</span>
        </div>
        <button className={styles.addBtn} onClick={handleAdd}>{tr.addToCart}</button>
      </div>
    </Link>
  )
}

// ── Store Card ────────────────────────────────
function StoreCard({ store, colorIdx, tr }: { store: Store; colorIdx: number; tr: Record<string, string> }) {
  const bg = store.themeBg ?? CARD_COLORS[colorIdx % CARD_COLORS.length]
  const initial = store.name.charAt(0).toUpperCase()
  const color = store.themeColor ?? '#2563EB'

  return (
    <Link href={`/store/${store.slug}`} className={styles.productCard}>
      <div className={styles.cardImg} style={{ background: bg }}>
        {store.banner ? (
          <Image src={store.banner} alt={store.name} fill className={styles.cardImgEl} />
        ) : (
          <div className={styles.cardInitial} style={{ color }}>{initial}</div>
        )}
        {store.isOpen !== undefined && (
          <span className={store.isOpen ? styles.openBadge : styles.closedBadge}>
            {store.isOpen ? tr.open : tr.closed}
          </span>
        )}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.productName} style={{ fontWeight: 700 }}>{store.name}</p>
        {store.address && <p className={styles.metaRow} style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {store.address}</p>}
        <div className={styles.metaRow}>
          {store.rating && <span className={styles.rating}>★ {store.rating.toFixed(1)}</span>}
          {store._count && <span className={styles.storeName}>{store._count.products} {tr.products}</span>}
        </div>
        <button className={styles.addBtn} style={{ color, borderColor: color }}>{tr.view}</button>
      </div>
    </Link>
  )
}

// ── Store List Card ───────────────────────────
function StoreListCard({ store, tr }: { store: Store; tr: Record<string, string> }) {
  const bg = store.themeBg ?? '#EEF2FF'
  const color = store.themeColor ?? '#2563EB'

  return (
    <Link href={`/store/${store.slug}`} className={styles.storeListCard}>
      <div className={styles.storeListCover} style={{ background: bg }}>
        {store.logo ? (
          <Image src={store.logo} alt={store.name} fill className={styles.cardImgEl} />
        ) : (
          <div className={styles.storeListInitial} style={{ color }}>{store.name.charAt(0)}</div>
        )}
      </div>
      <div className={styles.storeListBody}>
        <span className={styles.storeListName}>{store.name}</span>
        {store.isOpen !== undefined && (
          <span className={store.isOpen ? styles.openBadge : styles.closedBadge}>
            {store.isOpen ? tr.open : tr.closed}
          </span>
        )}
      </div>
    </Link>
  )
}

// ── Skeletons ─────────────────────────────────
function CardSkeleton() {
  return <div className={styles.cardSkeleton}><div className={styles.skImg} /><div className={styles.skBody}><div className={styles.skLine} /><div className={styles.skShort} /><div className={styles.skBtn} /></div></div>
}

function StoreSkeleton() {
  return <div className={styles.storeSkeleton}><div className={styles.skStoreCover} /><div className={styles.skStoreName} /></div>
}
