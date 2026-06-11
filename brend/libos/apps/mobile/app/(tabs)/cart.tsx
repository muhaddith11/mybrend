import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCartStore } from '../../store/cart'

export default function CartScreen() {
  const router = useRouter()
  const { items, updateQty, removeItem, totalPrice, itemsByStore } = useCartStore()

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Savat</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={64} color="#ddd" />
          <Text style={styles.emptyTitle}>Savat bo'sh</Text>
          <Text style={styles.emptyText}>Do'konlarga kiring va mahsulot tanlang</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
            <Text style={styles.shopBtnText}>Do'konlarga o'tish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const byStore = itemsByStore()
  const storeIds = Object.keys(byStore)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savat</Text>
        <Text style={styles.headerCount}>{items.length} ta mahsulot</Text>
      </View>

      <FlatList
        data={storeIds}
        keyExtractor={id => id}
        contentContainerStyle={styles.list}
        renderItem={({ item: storeId }) => {
          const storeItems = byStore[storeId]
          const storeName = storeItems[0].storeName
          const storeTotal = storeItems.reduce((s, i) => s + i.price * i.quantity, 0)

          return (
            <View style={styles.storeGroup}>
              {/* Do'kon sarlavhasi */}
              <View style={styles.storeHeader}>
                <Ionicons name="storefront-outline" size={15} color="#534AB7" />
                <Text style={styles.storeGroupName}>{storeName}</Text>
              </View>

              {/* Mahsulotlar */}
              {storeItems.map(item => (
                <View key={`${item.productId}_${item.size}_${item.color}`} style={styles.item}>
                  <View style={styles.itemImg}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.img} resizeMode="cover" />
                    ) : (
                      <View style={styles.imgPlaceholder}>
                        <Ionicons name="shirt-outline" size={24} color="#ccc" />
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {(item.size || item.color) && (
                      <Text style={styles.itemVariant}>
                        {[item.size, item.color].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>{item.price.toLocaleString()} so'm</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <TouchableOpacity
                      onPress={() => removeItem(item.productId, item.size, item.color)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#f87171" />
                    </TouchableOpacity>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(item.productId, item.quantity - 1, item.size, item.color)}
                      >
                        <Ionicons name="remove" size={14} color="#534AB7" />
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(item.productId, item.quantity + 1, item.size, item.color)}
                      >
                        <Ionicons name="add" size={14} color="#534AB7" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {/* Do'kon uchun checkout */}
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => router.push({
                  pathname: '/checkout',
                  params: { storeId },
                })}
              >
                <Text style={styles.checkoutText}>
                  Buyurtma berish — {storeTotal.toLocaleString()} so'm
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )
        }}
        ListFooterComponent={
          storeIds.length > 1 ? (
            <View style={styles.totalBar}>
              <Text style={styles.totalLabel}>Jami barcha do'konlar:</Text>
              <Text style={styles.totalPrice}>{totalPrice().toLocaleString()} so'm</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  headerCount: { fontSize: 13, color: '#888' },
  list: { padding: 12, gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center' },
  shopBtn: { marginTop: 8, backgroundColor: '#534AB7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  storeGroup: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: '#eee' },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  storeGroupName: { fontSize: 13, fontWeight: '600', color: '#534AB7' },
  item: { flexDirection: 'row', padding: 12, gap: 10, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  itemImg: { width: 70, height: 70, borderRadius: 8, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, color: '#1a1a1a', lineHeight: 18, marginBottom: 3 },
  itemVariant: { fontSize: 11, color: '#888', marginBottom: 4 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: '#534AB7' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#534AB7', margin: 12, padding: 14, borderRadius: 10 },
  checkoutText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  totalBar: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0.5, borderColor: '#eee' },
  totalLabel: { fontSize: 14, color: '#666' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
})
