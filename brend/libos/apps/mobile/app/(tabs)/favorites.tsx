import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth'
import { useWishlistStore, type WishlistItem } from '../../store/wishlist'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'
import { StoreCard } from '../../components/StoreCard'

type Tab = 'stores' | 'products'

export default function FavoritesScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { isLoggedIn } = useAuthStore()
  const [tab, setTab] = useState<Tab>('stores')
  const wishlistItems = useWishlistStore(s => s.items)

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.stores.favorites(),
    enabled: isLoggedIn,
  })

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr.mFavorites}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'stores' && styles.tabActive]} onPress={() => setTab('stores')}>
          <Text style={[styles.tabText, tab === 'stores' && styles.tabTextActive]}>{tr.mStoresTab}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'products' && styles.tabActive]} onPress={() => setTab('products')}>
          <Text style={[styles.tabText, tab === 'products' && styles.tabTextActive]}>{tr.mProductsTab}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'stores' ? (
        !isLoggedIn ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>{tr.loginToProfile}</Text>
            <Text style={styles.emptyText}>{tr.mLoginToSeeFav}</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginBtnText}>{tr.login}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={data?.stores ?? []}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <StoreCard store={item} onPress={() => router.push(`/store/${item.slug}`)} />
            )}
            ListEmptyComponent={
              isLoading ? (
                <Text style={styles.emptyText}>{tr.mLoading}</Text>
              ) : (
                <View style={styles.empty}>
                  <Ionicons name="heart-outline" size={64} color={colors.border} />
                  <Text style={styles.emptyTitle}>{tr.mNoFavStore}</Text>
                  <Text style={styles.emptyText}>{tr.mNoFavStoreSub}</Text>
                </View>
              )
            }
          />
        )
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.productId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WishlistProductRow item={item} cur={tr.som} onPress={() => router.push(`/product/${item.productId}`)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>{tr.mNoFavProduct}</Text>
              <Text style={styles.emptyText}>{tr.mNoFavProductSub}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

function WishlistProductRow({ item, cur, onPress }: { item: WishlistItem; cur: string; onPress: () => void }) {
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <TouchableOpacity style={styles.productRow} onPress={onPress}>
      <View style={styles.productImgWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImg} resizeMode="cover" />
        ) : (
          <View style={styles.productImgPlaceholder} />
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productStore}>{item.storeName}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>{item.price.toLocaleString()} {cur}</Text>
          {!!item.originalPrice && item.originalPrice > item.price && (
            <Text style={styles.productOriginalPrice}>{item.originalPrice.toLocaleString()}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { padding: 20, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 20, fontWeight: '600', color: c.text },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border, backgroundColor: c.surface },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: c.brand },
  tabText: { fontSize: 14, color: c.text2, fontWeight: '500' },
  tabTextActive: { color: c.brand },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: c.text },
  emptyText: { fontSize: 13, color: c.text2, textAlign: 'center', paddingHorizontal: 32 },
  loginBtn: { marginTop: 8, backgroundColor: c.brand, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: c.white, fontWeight: '600', fontSize: 15 },
  list: { paddingVertical: 16, gap: 10 },
  productRow: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: 12, borderWidth: 0.5, borderColor: c.border, padding: 12, marginHorizontal: 16, gap: 12 },
  productImgWrap: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: c.surface2 },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: { width: '100%', height: '100%', backgroundColor: c.surface2 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 13, color: c.text, marginBottom: 3 },
  productStore: { fontSize: 11, color: c.text2, marginBottom: 4 },
  productPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  productPrice: { fontSize: 13, fontWeight: '600', color: c.brand },
  productOriginalPrice: { fontSize: 11, color: c.text3, textDecorationLine: 'line-through' },
})
