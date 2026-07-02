import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, FlatList, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import type { Gender, Product } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StoreCard } from '../../components/StoreCard'
import { WishlistHeartButton } from '../../components/WishlistHeartButton'
import { HeroBanner } from '../../components/HeroBanner'
import { HomeHeader } from '../../components/HomeHeader'

const TABS: { label: string; value: Gender }[] = [
  { label: 'Erkaklar', value: 'MEN' },
  { label: 'Ayollar', value: 'WOMEN' },
  { label: 'Bolalar', value: 'KIDS' },
]

export default function HomeScreen() {
  const router = useRouter()
  const [activeGender, setActiveGender] = useState<Gender>('MEN')
  const [search, setSearch] = useState('')

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
        placeholder="Do'kon yoki mahsulot qidiring..."
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
              <Text style={styles.productPrice}>{item.price.toLocaleString()} so'm</Text>
              <Text style={styles.searchStoreName}>{item.store?.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {searchLoading ? 'Qidirilmoqda...' : `"${searchQuery}" bo'yicha hech narsa topilmadi`}
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
                title="Ommabop mahsulotlar"
                products={featured.products}
                onPressProduct={p => router.push(`/product/${p.id}`)}
              />
            )}

            {!!discounted?.products.length && (
              <ProductRow
                title="Chegirmalar"
                products={discounted.products}
                onPressProduct={p => router.push(`/product/${p.id}`)}
              />
            )}

            <View style={styles.tabs}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab.value}
                  style={[styles.tab, activeGender === tab.value && styles.tabActive]}
                  onPress={() => setActiveGender(tab.value)}
                >
                  <Text style={[styles.tabText, activeGender === tab.value && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>Yuklanmoqda...</Text>
          ) : (
            <Text style={styles.empty}>Do'konlar topilmadi</Text>
          )
        }
      />
    </SafeAreaView>
  )
}

function ProductRow({
  title, products, onPressProduct,
}: {
  title: string
  products: Product[]
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
              <Text style={styles.productPrice}>{product.price.toLocaleString()} so'm</Text>
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
})
