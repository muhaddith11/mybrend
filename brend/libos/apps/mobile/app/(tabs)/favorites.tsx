import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth'
import { useWishlistStore, type WishlistItem } from '../../store/wishlist'
import { useLangStore } from '../../store/lang'
import { StoreCard } from '../../components/StoreCard'

type Tab = 'stores' | 'products'

export default function FavoritesScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
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
            <Ionicons name="heart-outline" size={64} color="#ddd" />
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
                  <Ionicons name="heart-outline" size={64} color="#ddd" />
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
              <Ionicons name="heart-outline" size={64} color="#ddd" />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#534AB7' },
  tabText: { fontSize: 14, color: '#888780', fontWeight: '500' },
  tabTextActive: { color: '#534AB7' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', paddingHorizontal: 32 },
  loginBtn: { marginTop: 8, backgroundColor: '#534AB7', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  list: { paddingVertical: 16, gap: 10 },
  productRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#D3D1C7', padding: 12, marginHorizontal: 16, gap: 12 },
  productImgWrap: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F1EFE8' },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#F1EFE8' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 13, color: '#1a1a1a', marginBottom: 3 },
  productStore: { fontSize: 11, color: '#888', marginBottom: 4 },
  productPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  productPrice: { fontSize: 13, fontWeight: '600', color: '#534AB7' },
  productOriginalPrice: { fontSize: 11, color: '#aaa', textDecorationLine: 'line-through' },
})
