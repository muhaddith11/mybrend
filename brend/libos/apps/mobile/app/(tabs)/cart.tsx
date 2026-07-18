import { useMemo } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Text } from '../../components/Txt'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useCartStore } from '../../store/cart'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'
import { resolveImg } from '../../lib/links'

export default function CartScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { items, updateQty, removeItem, totalPrice, itemsByStore } = useCartStore()

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tr.cart}</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>{tr.mCartEmpty}</Text>
          <Text style={styles.emptyText}>{tr.mCartEmptySub}</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
            <Text style={styles.shopBtnText}>{tr.mGoToStores}</Text>
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
        <Text style={styles.headerTitle}>{tr.cart}</Text>
        <Text style={styles.headerCount}>{items.length} {tr.mItemsWord}</Text>
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
                <Ionicons name="storefront-outline" size={15} color={colors.brand} />
                <Text style={styles.storeGroupName}>{storeName}</Text>
              </View>

              {/* Mahsulotlar */}
              {storeItems.map(item => (
                <View key={`${item.productId}_${item.size}_${item.color}`} style={styles.item}>
                  <View style={styles.itemImg}>
                    {item.image ? (
                      <Image source={{ uri: resolveImg(item.image) }} style={styles.img} resizeMode="cover" />
                    ) : (
                      <View style={styles.imgPlaceholder}>
                        <Ionicons name="shirt-outline" size={24} color={colors.text3} />
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
                    <Text style={styles.itemPrice}>{item.price.toLocaleString()} {tr.som}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <TouchableOpacity
                      onPress={() => removeItem(item.productId, item.size, item.color)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(item.productId, item.quantity - 1, item.size, item.color)}
                      >
                        <Ionicons name="remove" size={14} color={colors.brand} />
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(item.productId, item.quantity + 1, item.size, item.color)}
                      >
                        <Ionicons name="add" size={14} color={colors.brand} />
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
                  {tr.mOrderNow} — {storeTotal.toLocaleString()} {tr.som}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          )
        }}
        ListFooterComponent={
          storeIds.length > 1 ? (
            <View style={styles.totalBar}>
              <Text style={styles.totalLabel}>{tr.mTotalAllStores}</Text>
              <Text style={styles.totalPrice}>{totalPrice().toLocaleString()} {tr.som}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 20, fontWeight: '600', color: c.text },
  headerCount: { fontSize: 13, color: c.text2 },
  list: { padding: 12, gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: c.text },
  emptyText: { fontSize: 14, color: c.text2, textAlign: 'center' },
  shopBtn: { marginTop: 8, backgroundColor: c.brand, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: c.white, fontWeight: '600', fontSize: 14 },
  storeGroup: { backgroundColor: c.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: c.border },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderBottomWidth: 0.5, borderBottomColor: c.border },
  storeGroupName: { fontSize: 13, fontWeight: '600', color: c.brand },
  item: { flexDirection: 'row', padding: 12, gap: 10, borderBottomWidth: 0.5, borderBottomColor: c.border },
  itemImg: { width: 70, height: 70, borderRadius: 8, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, color: c.text, lineHeight: 18, marginBottom: 3 },
  itemVariant: { fontSize: 11, color: c.text2, marginBottom: 4 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: c.brand },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center', color: c.text },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.brand, margin: 12, padding: 14, borderRadius: 10 },
  checkoutText: { color: c.white, fontWeight: '600', fontSize: 14 },
  totalBar: { backgroundColor: c.surface, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0.5, borderColor: c.border },
  totalLabel: { fontSize: 14, color: c.text2 },
  totalPrice: { fontSize: 16, fontWeight: '700', color: c.text },
})
