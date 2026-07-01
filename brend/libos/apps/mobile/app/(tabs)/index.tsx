import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, FlatList, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import type { Gender, Product, Store } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'

const TABS: { label: string; value: Gender }[] = [
  { label: 'Erkaklar', value: 'MEN' },
  { label: 'Ayollar', value: 'WOMEN' },
  { label: 'Bolalar', value: 'KIDS' },
]

export default function HomeScreen() {
  const router = useRouter()
  const [activeGender, setActiveGender] = useState<Gender>('MEN')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['stores', activeGender, search],
    queryFn: () => api.stores.list({ gender: activeGender, search }),
  })

  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.products.featured(),
  })

  const { data: discounted } = useQuery({
    queryKey: ['products', 'discounted'],
    queryFn: () => api.products.discounted(),
  })

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={data?.stores ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <StoreCard store={item} onPress={() => router.push(`/store/${item.slug}`)} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <View style={styles.logoMark}><Text style={styles.logoLetter}>Z</Text></View>
                <Text style={styles.logoText}>
                  ZY<Text style={{ color: '#534AB7' }}>FF</Text>
                </Text>
              </View>
              <View style={styles.headerIcons}>
                <Text style={styles.iconBtn}>🛒</Text>
              </View>
            </View>

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

function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.storeCard} onPress={onPress}>
      <View style={[styles.storeAvatar, { backgroundColor: store.themeBg }]}>
        {store.logo ? (
          <Image source={{ uri: store.logo }} style={styles.storeLogoImg} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>🏪</Text>
        )}
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeAddr}>{store.address}</Text>
        <View style={styles.storeTags}>
          {store.hasDelivery && <Tag label="Yetkazish" color="#E1F5EE" textColor="#0F6E56" />}
          {store.hasPickup && <Tag label="Bron" color="#EEEDFE" textColor="#3C3489" />}
          {store.hasCashOnDoor && <Tag label="Naqd" color="#FAEEDA" textColor="#633806" />}
        </View>
      </View>
      <View style={styles.storeRight}>
        <Text style={styles.rating}>⭐ {store.rating.toFixed(1)}</Text>
        <Text style={styles.itemCount}>{store._count.products} mahsulot</Text>
        <View style={[styles.openBadge, { backgroundColor: store.isOpen ? '#EAF3DE' : '#FCEBEB' }]}>
          <Text style={{ fontSize: 10, color: store.isOpen ? '#3B6D11' : '#A32D2D' }}>
            {store.isOpen ? 'Ochiq' : 'Yopiq'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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

function Tag({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={{ fontSize: 10, color: textColor }}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 34, height: 34, backgroundColor: '#3C3489', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#fff', fontSize: 16, fontWeight: '500' },
  logoText: { fontSize: 22, fontWeight: '500', color: '#1a1a1a', letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { fontSize: 22 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#F1EFE8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#2C2C2A' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7', marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#534AB7' },
  tabText: { fontSize: 14, color: '#888780', fontWeight: '500' },
  tabTextActive: { color: '#534AB7' },
  list: { paddingBottom: 24, gap: 10 },
  storeCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#D3D1C7', padding: 12, marginHorizontal: 16, alignItems: 'center', gap: 12 },
  storeAvatar: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeLogoImg: { width: '100%', height: '100%' },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 2 },
  storeAddr: { fontSize: 12, color: '#888780', marginBottom: 6 },
  storeTags: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  storeRight: { alignItems: 'flex-end', gap: 2 },
  rating: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  itemCount: { fontSize: 11, color: '#888780' },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
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
})
