'use client'
import { Suspense, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@libos/shared'
import type { Product } from '@libos/shared'
import { useProductModal } from '../store/productModal'
import { useWishlistStore } from '../store/wishlist'
import { useLangStore } from '../store/lang'
import { useCityStore } from '../store/city'
import { CITIES_WITH_STORES } from '../lib/cities'
import { useT } from '../lib/i18n'
import { MapSection } from '../components/MapSection'
import { Reveal } from '../components/Reveal'
import { StoreCard as StoreRow, StoreCardSkeleton } from '../components/StoreCard'
import styles from './page.module.css'

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
  const city = useCityStore(s => s.city)
  const cityHasStores = CITIES_WITH_STORES.has(city)

const { data: featuredData, isLoading: featLoading } = useQuery({
    queryKey: ['products-featured', city],
    queryFn: () => api.products.featured(city),
    staleTime: 60_000,
  })

  const { data: discountedData, isLoading: discLoading } = useQuery({
    queryKey: ['products-discounted', city],
    queryFn: () => api.products.discounted(city),
    staleTime: 60_000,
  })

  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['stores-home', city],
    queryFn: () => api.stores.list({ limit: 8, city }),
    staleTime: 60_000,
  })

  const featured = featuredData?.products ?? []
  const discounted = discountedData?.products ?? []
  const stores = storesData?.stores ?? []

  // ── Global mahsulot qidiruvi (barcha do'konlar bo'ylab) ──
  const searchParams = useSearchParams()
  const searchQuery = (searchParams.get('search') ?? '').trim()
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['products-search', searchQuery, city],
    queryFn: () => api.products.search(searchQuery, city),
    enabled: searchQuery.length > 0,
    staleTime: 30_000,
  })
  const searchResults = searchData?.products ?? []

  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 2000)
    return () => clearInterval(t)
  }, [])

  // Currency label per lang
  const cur = lang === 'ru' ? 'сум' : lang === 'en' ? 'UZS' : "so'm"

  // ── Qidiruv natijalari rejimi ──
  if (searchQuery) {
    return (
      <div className={styles.page}>
        <section className={styles.section} style={{ paddingTop: '1.5rem' }}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>“{searchQuery}” bo‘yicha natijalar</h2>
              <Link href="/" className={styles.sectionAll}>← Bosh sahifa</Link>
            </div>
            {searchLoading ? (
              <div className={styles.searchGrid}>
                {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} grid />)}
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <p style={{ color: 'var(--text-2)', marginBottom: '1rem', fontSize: 14 }}>{searchResults.length} ta mahsulot topildi</p>
                <div className={styles.searchGrid}>
                  {searchResults.map(p => <ProductCard key={p.id} product={p as Product} tr={tr} cur={cur} variant="grid" />)}
                </div>
              </>
            ) : (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-2)' }}>
                <p style={{ fontSize: 18, marginBottom: '.5rem' }}>Hech narsa topilmadi</p>
                <p style={{ fontSize: 14 }}>“{searchQuery}” bo‘yicha mahsulot yo‘q. Boshqa so‘z bilan urinib ko‘ring.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

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
              <div className={styles.heroBadge} style={{ position: 'relative', zIndex: 2, marginBottom: 12, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)' }}>✨ ZYFF — Qo'qon</div>
              <h1 className={styles.heroAppTitle}>
                {tr.heroAppL1}<br />
                <span style={{ color: '#8FB0FF', textShadow: '0 0 30px rgba(143,176,255,.5)' }}>{tr.heroAppHL}</span><br />
                {tr.heroAppL3}
              </h1>
              <p className={styles.heroAppSub}>{tr.heroAppSub2}</p>
              <Link href="/stores" className={styles.heroBtn} style={{ position: 'relative', zIndex: 2, background: '#3B6CFF', color: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(59,108,255,.45)' }}>
                {tr.heroAppCta}
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

        </div>
      </section>

      {/* ── Stores ── */}
      <section className={styles.productsSection}>
        <Reveal className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{tr.storesSection}</h2>
            <Link href="/stores" className={styles.sectionAll}>{tr.seeAll}</Link>
          </div>
          {!storesLoading && !cityHasStores ? (
            <div style={{ padding: '2.5rem 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              {tr.mOtherCitiesSoon}
            </div>
          ) : (
            <div className={styles.storesList}>
              {storesLoading
                ? Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)
                : stores.map(s => <StoreRow key={s.id} store={s} tr={tr} lang={lang} />)
              }
            </div>
          )}
        </Reveal>
      </section>

      {/* ── Popular products ── */}
      <section className={styles.productsSection}>
        <Reveal className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{tr.popularProducts}</h2>
            <Link href="/stores" className={styles.sectionAll}>{tr.seeAll}</Link>
          </div>
          <div className={styles.productsGrid}>
            {featLoading || storesLoading
              ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
              : featured.length > 0
                ? featured.slice(0, 5).map(p => <ProductCard key={p.id} product={p} tr={tr} cur={cur} />)
                : stores.slice(0, 5).map(s => <StoreRow key={s.id} store={s} tr={tr} lang={lang} />)
            }
          </div>
        </Reveal>
      </section>

      {/* ── Promo banner ── */}
      <section className={styles.promoBanner}>
        <Reveal className="container">
          <div className={styles.promoInner}>
            <div className={styles.promoLeft}>
              <span className={styles.promoIcon}>🔥</span>
              <div>
                <div className={styles.promoTitle}>{tr.weeklyDeals}</div>
                <div className={styles.promoSub}>{tr.weeklyDealsSub}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Discounted products ── */}
      <section className={styles.productsSection}>
        <Reveal className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{tr.discountedProducts}</h2>
            <Link href="/?sale=true" className={styles.sectionAll}>{tr.seeAll}</Link>
          </div>
          <div className={styles.productsGrid}>
            {discLoading || storesLoading
              ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
              : discounted.length > 0
                ? discounted.slice(0, 5).map(p => <ProductCard key={p.id} product={p} tr={tr} cur={cur} />)
                : stores.slice(0, 5).map(s => <StoreRow key={s.id} store={s} tr={tr} lang={lang} />)
            }
          </div>
        </Reveal>
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
              <a href="https://instagram.com/zyff.uz" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Instagram: @zyff.uz</a>
              <a href="https://t.me/zyff_uz" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Telegram: @zyff_uz</a>
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
function ProductCard({ product, tr, cur, variant = 'row' }: { product: Product; tr: Record<string, string>; cur: string; variant?: 'row' | 'grid' }) {
  const openModal = useProductModal(s => s.open)
  const toggleWishlist = useWishlistStore(s => s.toggle)
  const inWishlist = useWishlistStore(s => s.has(product.id))
  const discount = getDiscount(product.price, product.originalPrice)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    // Rang/o'lcham tanlash oynasini ochamiz (variant bo'lmasa darrov qo'shiladi)
    openModal({
      productId: product.id,
      name: product.nameUz || product.name,
      price: product.price,
      image: product.images?.[0],
      storeId: product.storeId ?? product.store?.id ?? '',
      storeName: product.store?.name ?? '',
      storeSlug: product.store?.slug ?? '',
      sizes: (product as any).sizes ?? [],
      colors: (product as any).colors ?? [],
      themeColor: product.store?.themeColor,
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
      themeBg: product.store?.themeBg,
    })
  }

  const isGrid = variant === 'grid'

  return (
    <Link href={`/product/${product.id}`} className={`${styles.productCard} ${isGrid ? styles.productCardGrid : ''}`}>
      <div className={`${styles.cardImg} ${isGrid ? styles.cardImgGrid : ''}`}>
        {product.images?.[0] && (
          <Image src={product.images[0]} alt={product.name} fill className={styles.cardImgEl} />
        )}
        {discount && <span className={styles.discountBadge}>-{discount}%</span>}
        <button
          className={`${styles.heartBtn} ${inWishlist ? styles.heartActive : ''}`}
          onClick={handleHeart}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.productName}>{product.nameUz || product.name}</p>
        <div className={styles.priceRow}>
          <span className={styles.priceMain}>{formatPrice(product.price)} <span className={styles.priceCur}>{cur}</span></span>
          {product.originalPrice && <span className={styles.priceOld}>{formatPrice(product.originalPrice)}</span>}
        </div>
        {isGrid && product.store?.name && <p className={styles.cardStoreName}>{product.store.name}</p>}
      </div>
      <button className={styles.addBtn} onClick={handleAdd}>{tr.addToCart}</button>
    </Link>
  )
}

// ── Skeletons ─────────────────────────────────
function CardSkeleton({ grid }: { grid?: boolean }) {
  return <div className={`${styles.cardSkeleton} ${grid ? styles.cardSkeletonGrid : ''}`}><div className={styles.skImg} /><div className={styles.skBody}><div className={styles.skLine} /><div className={styles.skShort} /><div className={styles.skBtn} /></div></div>
}
