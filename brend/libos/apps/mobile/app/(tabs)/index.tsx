import { useState } from 'react'
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
import { useLangStore } from '../../store/lang'

const GENDERS: Gender[] = ['MEN', 'WOMEN', 'KIDS']

export default function HomeScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
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
        placeholderTextColor="#888780"
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
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.searchImgWrap}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.productImg} resizeMode="cover" />
                ) : (
                  <View style={styles.productImgPlaceholder} />
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price.toLocaleString()} {tr.som}</Text>
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

            {!!featured?.products.length && (
              <ProductRow
                title={tr.popularProducts}
                products={featured.products}
                cur={tr.som}
                onPressProduct={p => router.push(`/product/${p.id}`)}
              />
            )}

            {!!discounted?.products.length && (
              <ProductRow
                title={tr.discountedProducts}
                products={discounted.products}
                cur={tr.som}
                onPressProduct={p => router.push(`/product/${p.id}`)}
              />
            )}

            {/* Haftalik chegirmalar promo banneri */}
            <View style={styles.promo}>
              <View style={styles.promoLeft}>
                <Text style={styles.promoIcon}>🔥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>{tr.weeklyDeals}</Text>
                  <Text style={styles.promoSub}>{tr.weeklyDealsSub}</Text>
                </View>
              </View>
            </View>

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
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>{tr.mLoading}</Text>
          ) : (
            <Text style={styles.empty}>{tr.mStoresNotFound}</Text>
          )
        }
        ListFooterComponent={<HomeFooter />}
      />
    </SafeAreaView>
  )
}

function HomeFooter() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#F1EFE8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#2C2C2A' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7', marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#534AB7' },
  tabText: { fontSize: 14, color: '#888780', fontWeight: '500' },
  tabTextActive: { color: '#534AB7' },
  list: { paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: '#888780', marginTop: 40, fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 10, marginHorizontal: 16 },
  sectionScroll: { paddingHorizontal: 16, gap: 10 },
  productCard: { width: 130 },
  productImgWrap: { width: 130, height: 130, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F1EFE8' },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#F1EFE8' },
  discountBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#e11d48', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  discountBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  productName: { fontSize: 12, color: '#1a1a1a', marginTop: 6, lineHeight: 16, height: 32 },
  productPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '600', color: '#534AB7' },
  productOriginalPrice: { fontSize: 11, color: '#aaa', textDecorationLine: 'line-through' },
  searchGrid: { padding: 16, paddingBottom: 32 },
  searchRow: { gap: 12, marginBottom: 16 },
  searchCard: { flex: 1 },
  searchImgWrap: { width: '100%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F1EFE8' },
  searchStoreName: { fontSize: 11, color: '#888', marginTop: 2 },
  promo: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#3C3489', borderRadius: 14, padding: 16 },
  promoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoIcon: { fontSize: 28 },
  promoTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  promoSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 16 },
  footer: { backgroundColor: '#1a1a1a', paddingHorizontal: 20, paddingVertical: 28, marginTop: 8 },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  footerLogoMark: { width: 30, height: 30, backgroundColor: '#534AB7', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  footerLogoLetter: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footerLogoText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footerDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 19, marginBottom: 20 },
  footerLinks: { gap: 10, marginBottom: 20 },
  footerLink: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  footerContacts: { gap: 10, marginBottom: 20, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 20 },
  footerContact: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: 11, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 16 },
})
