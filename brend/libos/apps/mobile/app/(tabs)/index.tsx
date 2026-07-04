import { useMemo, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, FlatList, Image, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import type { Gender, Product } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StoreCard } from '../../components/StoreCard'
import { WishlistHeartButton } from '../../components/WishlistHeartButton'
import { HeroBanner } from '../../components/HeroBanner'
import { HomeHeader } from '../../components/HomeHeader'
import { LeafletWebMap, type MapStore } from '../../components/LeafletWebMap'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'

const GENDERS: Gender[] = ['MEN', 'WOMEN', 'KIDS']

export default function HomeScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors, dark } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [activeGender, setActiveGender] = useState<Gender>('MEN')
  const [search, setSearch] = useState('')
  const genderLabel: Record<Gender, string> = { MEN: tr.men, WOMEN: tr.women, KIDS: tr.kids }

  const searchQuery = search.trim()

  const { data, isLoading } = useQuery({
    queryKey: ['stores', activeGender],
    queryFn: () => api.stores.list({ gender: activeGender }),
    enabled: !searchQuery,
  })

  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.products.featured(),
    enabled: !searchQuery,
  })

  const { data: discounted } = useQuery({
    queryKey: ['products', 'discounted'],
    queryFn: () => api.products.discounted(),
    enabled: !searchQuery,
  })

  // Butun mahsulotlar bo'ylab qidiruv (bitta do'kon nomi bilan cheklanmaydi)
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['products', 'search', searchQuery],
    queryFn: () => api.products.search(searchQuery),
    enabled: !!searchQuery,
  })

  // Banner uchun eng yaxshi do'konlar (gender'dan mustaqil — tab almashtirilganda o'zgarmasin)
  const { data: topStores } = useQuery({
    queryKey: ['stores', 'top'],
    queryFn: () => api.stores.list({ limit: 8 }),
    enabled: !searchQuery,
  })

  const searchBar = (
    <View style={styles.searchBar}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={tr.mSearchPlaceholder}
        placeholderTextColor={colors.text3}
        value={search}
        onChangeText={setSearch}
      />
    </View>
  )

  if (searchQuery) {
    return (
      <SafeAreaView style={styles.safe}>
        <HomeHeader />
        {searchBar}
        <FlatList
          data={searchResults?.products ?? []}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.searchGrid}
          columnWrapperStyle={styles.searchRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.searchImgWrap}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.productImg} resizeMode="cover" />
                ) : (
                  <View style={styles.productImgPlaceholder} />
                )}
                {!!item.originalPrice && item.originalPrice > item.price && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </Text>
                  </View>
                )}
                <WishlistHeartButton product={item as Product} size={14} />
              </View>
              <Text style={styles.searchName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.searchPriceRow}>
                <Text style={styles.searchPrice}>{item.price.toLocaleString()} {tr.som}</Text>
                {!!item.originalPrice && item.originalPrice > item.price && (
                  <Text style={styles.productOriginalPrice}>{item.originalPrice.toLocaleString()}</Text>
                )}
              </View>
              <Text style={styles.searchStoreName}>{item.store?.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {searchLoading ? tr.mSearching : `"${searchQuery}" ${tr.mNothingFound}`}
            </Text>
          }
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={data?.stores ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <StoreCard store={item} onPress={() => router.push(`/store/${item.slug}`)} />}
        ListHeaderComponent={
          <>
            <HomeHeader />

            {searchBar}

            {!!topStores?.stores.length && <HeroBanner stores={topStores.stores} />}

            {/* Jins filtri */}
            <View style={styles.tabs}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.tab, activeGender === g && styles.tabActive]}
                  onPress={() => setActiveGender(g)}
                >
                  <Text style={[styles.tabText, activeGender === g && styles.tabTextActive]}>
                    {genderLabel[g]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── DO'KONLAR (web'dagidek banner'dan keyin birinchi) ── */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionHeadTitle}>{tr.stores}</Text>
              <TouchableOpacity onPress={() => router.push('/stores')}>
                <Text style={styles.sectionHeadLink}>{tr.seeAll}</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>{tr.mLoading}</Text>
          ) : (
            <Text style={styles.empty}>{tr.mStoresNotFound}</Text>
          )
        }
        ListFooterComponent={
          <>
            {/* ── Ommabop mahsulotlar ── */}
            {!!featured?.products.length && (
              <ProductRow
                title={tr.popularProducts}
                products={featured.products}
                cur={tr.som}
                onPressProduct={p => router.push(`/product/${p.id}`)}
              />
            )}

            {/* ── Haftalik chegirmalar promo ── */}
            <View style={styles.promo}>
              <View style={styles.promoLeft}>
                <Text style={styles.promoIcon}>🔥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>{tr.weeklyDeals}</Text>
                  <Text style={styles.promoSub}>{tr.weeklyDealsSub}</Text>
                </View>
              </View>
            </View>

            {/* ── Chegirmadagi mahsulotlar ── */}
            {!!discounted?.products.length && (
              <ProductRow
                title={tr.discountedProducts}
                products={discounted.products}
                cur={tr.som}
                onPressProduct={p => router.push(`/product/${p.id}`)}
              />
            )}

            {/* ── Do'konlar xaritasi ── */}
            {(() => {
              const mapStores: MapStore[] = (topStores?.stores ?? [])
                .filter(s => typeof s.lat === 'number' && typeof s.lng === 'number')
                .map(s => ({ id: s.id, name: s.name, lat: s.lat!, lng: s.lng!, isOpen: s.isOpen }))
              if (mapStores.length === 0) return null
              return (
                <View style={styles.mapSection}>
                  <Text style={styles.mapSectionTitle}>
                    📍 {lang === 'ru' ? 'Магазины на карте' : lang === 'en' ? 'Stores on the map' : "Xaritada do'konlar"}
                  </Text>
                  <LeafletWebMap mode="display" height={220} dark={dark} stores={mapStores} />
                </View>
              )
            })()}

            <HomeFooter />
          </>
        }
      />
    </SafeAreaView>
  )
}

function HomeFooter() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <View style={styles.footer}>
      <View style={styles.footerBrand}>
        <View style={styles.footerLogoMark}><Text style={styles.footerLogoLetter}>Z</Text></View>
        <Text style={styles.footerLogoText}>ZYFF</Text>
      </View>
      <Text style={styles.footerDesc}>{tr.footerDesc}</Text>

      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => router.push('/about')}><Text style={styles.footerLink}>{tr.aboutUs}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/delivery')}><Text style={styles.footerLink}>{tr.delivery}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/open-store')}><Text style={styles.footerLink}>{tr.openStore}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/help')}><Text style={styles.footerLink}>{tr.help}</Text></TouchableOpacity>
      </View>

      <View style={styles.footerContacts}>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+998502500550')}>
          <Text style={styles.footerContact}>📞 +998 50 250 05 50</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com/zyff.uz')}>
          <Text style={styles.footerContact}>📷 Instagram: @zyff.uz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://t.me/zyff_uz')}>
          <Text style={styles.footerContact}>✈️ Telegram: @zyff_uz</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerCopy}>{tr.copyright}</Text>
    </View>
  )
}

function ProductRow({
  title, products, cur, onPressProduct,
}: {
  title: string
  products: Product[]
  cur: string
  onPressProduct: (p: Product) => void
}) {
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroll}>
        {products.map(product => (
          <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => onPressProduct(product)}>
            <View style={styles.productImgWrap}>
              {product.images?.[0] ? (
                <Image source={{ uri: product.images[0] }} style={styles.productImg} resizeMode="cover" />
              ) : (
                <View style={styles.productImgPlaceholder} />
              )}
              {!!product.originalPrice && product.originalPrice > product.price && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Text>
                </View>
              )}
              <WishlistHeartButton product={product} size={14} />
            </View>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <View style={styles.productPriceRow}>
              <Text style={styles.productPrice}>{product.price.toLocaleString()} {cur}</Text>
              {!!product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.productOriginalPrice}>{product.originalPrice.toLocaleString()}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

// Footer va promo banner qasddan doim to'q rangda (web footer bilan bir xil),
// shuning uchun ular mavzudan qat'i nazar hardcoded qoladi.
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: c.text },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: c.brand },
  tabText: { fontSize: 14, color: c.text2, fontWeight: '500' },
  tabTextActive: { color: c.brand },
  list: { paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: c.text2, marginTop: 40, fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 10, marginHorizontal: 16 },
  mapSection: { marginHorizontal: 16, marginBottom: 16 },
  mapSectionTitle: { fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 4, marginBottom: 10 },
  sectionHeadTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  sectionHeadLink: { fontSize: 13, fontWeight: '500', color: c.brand },
  sectionScroll: { paddingHorizontal: 16, gap: 10 },
  productCard: { width: 150, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  productImgWrap: { width: '100%', height: 118, overflow: 'hidden', backgroundColor: c.surface2 },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: { width: '100%', height: '100%', backgroundColor: c.surface2 },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#E23B3B', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  discountBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  productName: { fontSize: 12.5, color: c.text, marginTop: 10, marginHorizontal: 12, lineHeight: 16, height: 32, fontWeight: '600' },
  productPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginHorizontal: 12, marginBottom: 14, marginTop: 2 },
  productPrice: { fontSize: 13.5, fontWeight: '800', color: c.brand },
  productOriginalPrice: { fontSize: 11, color: c.text3, textDecorationLine: 'line-through' },
  searchGrid: { padding: 16, paddingBottom: 32 },
  searchRow: { gap: 12, marginBottom: 12 },
  searchCard: { flex: 1, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  searchImgWrap: { width: '100%', aspectRatio: 1, overflow: 'hidden', backgroundColor: c.surface2 },
  searchName: { fontSize: 12.5, color: c.text, fontWeight: '600', marginTop: 10, marginHorizontal: 12, lineHeight: 16, minHeight: 32 },
  searchPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginHorizontal: 12, marginTop: 2 },
  searchPrice: { fontSize: 13.5, fontWeight: '800', color: c.brand },
  searchStoreName: { fontSize: 11, color: c.text2, marginHorizontal: 12, marginTop: 2, marginBottom: 12 },
  promo: { marginHorizontal: 16, marginBottom: 16, backgroundColor: c.brandDark, borderRadius: 14, padding: 16 },
  promoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoIcon: { fontSize: 28 },
  promoTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  promoSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 16 },
  footer: { backgroundColor: '#1a1a1a', paddingHorizontal: 20, paddingVertical: 28, marginTop: 8 },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  footerLogoMark: { width: 30, height: 30, backgroundColor: '#2563EB', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  footerLogoLetter: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footerLogoText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footerDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 19, marginBottom: 20 },
  footerLinks: { gap: 10, marginBottom: 20 },
  footerLink: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  footerContacts: { gap: 10, marginBottom: 20, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 20 },
  footerContact: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: 11, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 16 },
})
