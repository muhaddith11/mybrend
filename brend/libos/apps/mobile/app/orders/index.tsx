import { useMemo } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '../../components/Txt'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'
import { ErrorState } from '../../components/ErrorState'

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PREPARING: '#8b5cf6',
  DELIVERING: '#06b6d4', DELIVERED: '#16a34a', CANCELLED: '#ef4444',
}

export default function OrdersScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const STATUS_LABEL: Record<string, string> = {
    PENDING: tr.stPending, CONFIRMED: tr.stConfirmed, PREPARING: tr.stPreparing,
    DELIVERING: tr.stDelivering, DELIVERED: tr.stDelivered, CANCELLED: tr.stCancelled,
  }
  // Backend /orders/my { orders: [...] } shaklida qaytaradi — myOrders() to'g'ri
  // shaklni beradi (my() bare massiv kutib bo'sh ro'yxat chiqarardi).
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.orders.myOrders(),
  })
  const orders = data?.orders ?? []

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr.myOrders}</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/orders/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.storeName}>{(item as any).store?.name}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.items} numberOfLines={1}>
              {item.items.map(i => i.product.name).join(', ')}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.price}>{item.totalPrice.toLocaleString()} {tr.som}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? null : isError ? (
            <ErrorState onRetry={() => refetch()} compact />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={56} color={colors.border} />
              <Text style={styles.emptyText}>{tr.noOrders}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

// Buyurtma statusi ranglari — semantik (web bilan bir xil), mavzudan qat'i nazar saqlanadi.
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 8, borderWidth: 0.5, borderColor: c.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: 15, fontWeight: '600', color: c.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '500' },
  items: { fontSize: 13, color: c.text2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '700', color: c.brand },
  date: { fontSize: 12, color: c.text3 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: c.text3 },
})
