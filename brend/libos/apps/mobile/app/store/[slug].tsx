import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, Image, Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { WishlistHeartButton } from '../../components/WishlistHeartButton'
import { LeafletWebMap } from '../../components/LeafletWebMap'
import { BespokeStore } from '../../components/stores/BespokeStore'
import { getStoreDesign } from '../../lib/storeDesigns'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

export default function StoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const tr = useT(useLangStore(s => s.lang))
  const { isLoggedIn } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => api.stores.bySlug(slug),
  })

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.stores.favorites(),
    enabled: isLoggedIn,
  })
  const isFavorited = !!store && !!favorites?.stores.some(s => s.id === store.id)

  const toggleFavorite = useMutation({
    mutationFn: () => api.stores.toggleFavorite(store!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })

  const handleHeartPress = () => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }
    toggleFavorite.mutate()
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>{tr.mLoading}</Text>
      </View>
    )
  }

  if (!store) return null

  // Bu do'kon uchun maxsus dizayn bo'lsa (asma/boosner/onepro) — o'z mini-sayti
  const design = getStoreDesign(slug)
  if (design) return <BespokeStore store={store} design={design} />

  const theme = {
    primary: store.themeColor,
    bg: store.themeBg,
  }

  // Kategoriyalarni mahsulotlardan chiqarish
  const categories = Array.from(
    new Map(store.products.map(p => [p.category.id, p.category])).values()
  )

  const filtered = selectedCategory
    ? store.products.filter(p => p.category.id === selectedCategory)
    : store.products

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{store.name}</Text>
          <View style={styles.headerMeta}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.headerRating}> {store.rating.toFixed(1)}</Text>
            <Text style={styles.headerDot}> · </Text>
            <View style={[styles.openDot, { backgroundColor: store.isOpen ? '#4ade80' : '#f87171' }]} />
            <Text style={styles.headerOpen}> {store.isOpen ? tr.open : tr.closed}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.heartBtn} onPress={handleHeartPress} disabled={toggleFavorite.isPending}>
          <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Do'kon ma'lumotlari */}
      <View style={[styles.infoBar, { backgroundColor: theme.primary + 'dd' }]}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={14} color="#fff" />
          <Text style={styles.infoText} numberOfLines={1}>{store.address}</Text>
        </View>
        <View style={styles.infoDivider} />
        {store.hasDelivery && (
          <View style={styles.infoItem}>
            <Ionicons name="bicycle-outline" size={14} color="#fff" />
            <Text style={styles.infoText}>{store.deliveryTime} {tr.mMinutes}</Text>
          </View>
        )}
        {store.hasPickup && (
          <View style={styles.infoItem}>
            <Ionicons name="bag-check-outline" size={14} color="#fff" />
            <Text style={styles.infoText}>{tr.mTagPickup}</Text>
          </View>
        )}
        {store.hasCashOnDoor && (
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color="#fff" />
            <Text style={styles.infoText}>{tr.mTagCash}</Text>
          </View>
        )}
      </View>

      {/* Kategoriyalar */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catContent}
        >
          <TouchableOpacity
            style={[
              styles.catChip,
              !selectedCategory && { backgroundColor: theme.primary },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>
              {tr.mAllCategory}
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                selectedCategory === cat.id && { backgroundColor: theme.primary },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[
                styles.catText,
                selectedCategory === cat.id && styles.catTextActive,
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Mahsulotlar grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            store={store}
            themeColor={theme.primary}
            cur={tr.som}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{tr.mProductsNotFound}</Text>
        }
        ListFooterComponent={
          typeof store.lat === 'number' && typeof store.lng === 'number' ? (
            <View style={styles.mapWrap}>
              <Text style={styles.mapTitle}>📍 {store.address}</Text>
              <LeafletWebMap
                mode="display"
                height={200}
                stores={[{ id: store.id, name: store.name, lat: store.lat, lng: store.lng, isOpen: store.isOpen }]}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

function ProductCard({
  product, store, themeColor, cur, onPress,
}: {
  product: Product
  store: Store
  themeColor: string
  cur: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={[styles.card, { width: CARD_WIDTH }]} onPress={onPress}>
      <View style={styles.cardImg}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.imgPlaceholder, { backgroundColor: themeColor + '22' }]}>
            <Ionicons name="shirt-outline" size={36} color={themeColor} />
          </View>
        )}
        <WishlistHeartButton product={product} store={store} size={14} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: themeColor }]}>
            {product.price.toLocaleString()} {cur}
          </Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#888', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  headerRating: { fontSize: 12, color: '#fff' },
  headerDot: { fontSize: 12, color: '#ffffff88' },
  openDot: { width: 7, height: 7, borderRadius: 4 },
  headerOpen: { fontSize: 12, color: '#fff' },
  heartBtn: { padding: 4 },
  infoBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: '#fff' },
  infoDivider: { flex: 1 },
  catScroll: { maxHeight: 50 },
  catContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#00000012', borderWidth: 0.5, borderColor: '#00000022' },
  catText: { fontSize: 13, color: '#444' },
  catTextActive: { color: '#fff', fontWeight: '500' },
  grid: { padding: 12, paddingBottom: 32 },
  row: { gap: 12, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: '#e0e0e0' },
  cardImg: { width: '100%', height: CARD_WIDTH * 0.9 },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 10 },
  productName: { fontSize: 13, color: '#1a1a1a', marginBottom: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 13, fontWeight: '600' },
  addBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 14 },
  mapWrap: { paddingHorizontal: 12, paddingBottom: 20, paddingTop: 4 },
  mapTitle: { fontSize: 13, color: '#444', marginBottom: 8, fontWeight: '500' },
})
