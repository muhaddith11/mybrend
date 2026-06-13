'use client'
import { Suspense, useState, useEffect } from 'react'
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

const STORE_GRADIENTS = [
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
  'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #6366F1 100%)',
  'linear-gradient(135deg, #EF4444 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
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

  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 2000)
    return () => clearInterval(t)
  }, [])

  // Currency label per lang
  const cur = lang === 'ru' ? 'сум' : lang === 'en' ? 'UZS' : "so'm"

  return (
    <div className={styles.page}>
      {/* ── Hero section ── */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroGrid}`}>

          {/* 3-slide auto-slider */}
          <div className={styles.heroSlider}>

            {/* Slide 0: ZYFF app ad */}
            <div className={`${styles.heroSlide} ${slide === 0 ? styles.heroSlideActive : ''}`}
              style={{ background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243e 100%)' }}>
              {/* Floating glowing orbs */}
              <div className={styles.floatEl} style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(109,40,217,.55) 0%, transparent 70%)', top: '-60px', right: '5%', animationDuration: '5s' }} />
              <div className={styles.floatEl} style={{ width: 120, height: 120, background: 'radial-gradient(circle, rgba(245,158,11,.4) 0%, transparent 70%)', bottom: '-20px', right: '28%', animationDuration: '3.8s', animationDelay: '.7s' }} />
              <div className={styles.floatEl} style={{ width: 80, height: 80, background: 'radial-gradient(circle, rgba(236,72,153,.35) 0%, transparent 70%)', top: '30%', right: '18%', animationDuration: '4.5s', animationDelay: '1.4s' }} />
              <div className={styles.floatEl} style={{ width: 50, height: 50, background: 'radial-gradient(circle, rgba(99,102,241,.45) 0%, transparent 70%)', top: '10%', right: '45%', animationDuration: '6s', animationDelay: '2s' }} />
              <div className={styles.heroBadge} style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)' }}>✨ ZYFF — Qo'qon</div>
              <h1 className={styles.heroAppTitle}>
                Shahringizdagi barcha<br />
                <span style={{ color: '#FBBF24', textShadow: '0 0 30px rgba(251,191,36,.5)' }}>kiyim do'konlar</span><br />
                bir joyda
              </h1>
              <p className={styles.heroAppSub}>Eng yaxshi do'konlarni toping, narxlarni solishtiring</p>
              <Link href="/stores" className={styles.heroBtn} style={{ position: 'relative', zIndex: 2, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(245,158,11,.45)' }}>
                Do'konlarni ko'rish →
              </Link>
              <div className={styles.heroBg} style={{ color: 'rgba(255,255,255,.025)' }}>Z</div>
            </div>

            {/* Slide 1: store[0] ad */}
            <div className={`${styles.heroSlide} ${slide === 1 ? styles.heroSlideActive : ''}`}
              style={{ background: stores[0]?.banner ? '#000' : (STORE_GRADIENTS[0]) }}>
              {stores[0]?.banner && (
                <Image src={stores[0].banner} alt={stores[0].name} fill className={styles.heroStoreAdImg} />
              )}
              {!stores[0]?.banner && (
                <>
                  <div className={styles.floatEl} style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,255,255,.18) 0%, transparent 70%)', top: '-40px', right: '8%', animationDuration: '4s' }} />
                  <div className={styles.floatEl} style={{ width: 100, height: 100, background: 'radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%)', bottom: '0', right: '30%', animationDuration: '3.5s', animationDelay: '.5s' }} />
                  <div className={styles.slideInitial}>{stores[0]?.name?.charAt(0) ?? 'Z'}</div>
                </>
              )}
              <div className={styles.heroStoreAdOverlay} />
              <div className={styles.heroStoreAdContent}>
                <div className={styles.heroBadge} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)' }}>🏆 Tavsiya etilgan do'kon</div>
                <h2 className={styles.heroAppTitle}>{stores[0]?.name ?? "Do'konlarimiz"}</h2>
                {stores[0]?.address && <p className={styles.heroAppSub}>📍 {stores[0].address}</p>}
                {stores[0] && (
                  <Link href={`/store/${stores[0].slug}`} className={styles.heroBtn} style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,.95)', color: '#1E1B4B' }}>
                    Hozir tashrif buyuring →
                  </Link>
                )}
              </div>
            </div>

            {/* Slide 2: store[1] ad */}
            <div className={`${styles.heroSlide} ${slide === 2 ? styles.heroSlideActive : ''}`}
              style={{ background: stores[1]?.banner ? '#000' : (STORE_GRADIENTS[1]) }}>
              {stores[1]?.banner && (
                <Image src={stores[1].banner} alt={stores[1].name} fill className={styles.heroStoreAdImg} />
              )}
              {!stores[1]?.banner && (
                <>
                  <div className={styles.floatEl} style={{ width: 160, height: 160, background: 'radial-gradient(circle, rgba(255,255,255,.2) 0%, transparent 70%)', top: '-30px', right: '12%', animationDuration: '4.5s' }} />
                  <div className={styles.floatEl} style={{ width: 90, height: 90, background: 'radial-gradient(circle, rgba(255,255,255,.14) 0%, transparent 70%)', bottom: '5%', right: '25%', animationDuration: '3.8s', animationDelay: '.8s' }} />
                  <div className={styles.slideInitial}>{stores[1]?.name?.charAt(0) ?? 'Z'}</div>
                </>
              )}
              <div className={styles.heroStoreAdOverlay} />
              <div className={styles.heroStoreAdContent}>
                <div className={styles.heroBadge} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)' }}>⭐ Premium do'kon</div>
                <h2 className={styles.heroAppTitle}>{stores[1]?.name ?? "Yangi do'konlar"}</h2>
                {stores[1]?.address && <p className={styles.heroAppSub}>📍 {stores[1].address}</p>}
                {stores[1] && (
                  <Link href={`/store/${stores[1].slug}`} className={styles.heroBtn} style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,.95)', color: '#1E1B4B' }}>
                    Hozir tashrif buyuring →
                  </Link>
                )}
              </div>
            </div>

            {/* Dots */}
            <div className={styles.heroSliderDots}>
              {[0, 1, 2].map(i => (
                <button key={i}
                  className={`${styles.heroDot} ${slide === i ? styles.heroDotActive : ''}`}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          </div>

          {/* Right: store ads (fallback to info cards) */}
          <div className={styles.heroCards}>
            {stores[2] ? (
              <Link href={`/store/${stores[2].slug}`} className={styles.storeAdCard}
                style={{ background: stores[2].banner ? '#000' : STORE_GRADIENTS[2] }}>
                {stores[2].banner && (
                  <Image src={stores[2].banner} alt={stores[2].name} fill className={styles.storeAdImg} />
                )}
                {!stores[2].banner && (
                  <div className={styles.storeAdDecor}>{stores[2].name.charAt(0)}</div>
                )}
                <div className={styles.storeAdOverlay} />
                <div className={styles.storeAdContent}>
                  <div className={styles.storeAdName}>{stores[2].name}</div>
                  {stores[2].address && <div className={styles.storeAdAddr}>📍 {stores[2].address}</div>}
                  <div className={styles.storeAdBtn}>Ko'rish →</div>
                </div>
              </Link>
            ) : (
              <div className={styles.infoCard} style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' }}>
                <div>
                  <div className={styles.infoTitle}>{tr.freeDelivery}</div>
                  <div className={styles.infoSub}>{tr.freeDeliverySub}</div>
                </div>
                <span className={styles.infoEmoji}>🚚</span>
              </div>
            )}
            {stores[3] ? (
              <Link href={`/store/${stores[3].slug}`} className={styles.storeAdCard}
                style={{ background: stores[3].banner ? '#000' : STORE_GRADIENTS[3] }}>
                {stores[3].banner && (
                  <Image src={stores[3].banner} alt={stores[3].name} fill className={styles.storeAdImg} />
                )}
                {!stores[3].banner && (
                  <div className={styles.storeAdDecor}>{stores[3].name.charAt(0)}</div>
                )}
                <div className={styles.storeAdOverlay} />
                <div className={styles.storeAdContent}>
                  <div className={styles.storeAdName}>{stores[3].name}</div>
                  {stores[3].address && <div className={styles.storeAdAddr}>📍 {stores[3].address}</div>}
                  <div className={styles.storeAdBtn}>Ko'rish →</div>
                </div>
              </Link>
            ) : (
              <div className={styles.infoCard} style={{ background: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' }}>
                <div>
                  <div className={styles.infoTitle}>{stores.length > 0 ? `${stores.length}+` : '5+'} {tr.storeCount}</div>
                  <div className={styles.infoSub}>{tr.topStores}</div>
                </div>
                <span className={styles.infoEmoji}>🏬</span>
              </div>
            )}
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
        {store.isOpen !== undefined && (
          <span className={store.isOpen ? styles.openBadge : styles.closedBadge}>
            {store.isOpen ? tr.open : tr.closed}
          </span>
        )}
      </div>
      <div className={styles.storeListBody}>
        <span className={styles.storeListName}>{store.name}</span>
        {store.rating != null && (
          <div className={styles.storeListMeta}>
            <span className={styles.storeListRating}>★ {store.rating.toFixed(1)}</span>
            {store.reviewCount ? <span className={styles.storeListReviews}>({store.reviewCount})</span> : null}
          </div>
        )}
        {store.address && (
          <div className={styles.storeListAddr}>📍 {store.address}</div>
        )}
        <div className={styles.storeListHours}>🕐 09:00 – 21:00</div>
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
