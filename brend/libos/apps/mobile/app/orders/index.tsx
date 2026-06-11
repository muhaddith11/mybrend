import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@libos/shared'

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PREPARING: '#8b5cf6',
  DELIVERING: '#10b981', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlandi', PREPARING: 'Tayyorlanmoqda',
  DELIVERING: "Yo'lda", DELIVERED: 'Yetkazildi', CANCELLED: 'Bekor',
}

export default function OrdersScreen() {
  const router = useRouter()
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.orders.my(),
  })

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyurtmalarim</Text>
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
              <Text style={styles.price}>{item.totalPrice.toLocaleString()} so'm</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={56} color="#ddd" />
              <Text style={styles.emptyText}>Hali buyurtma yo'q</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8, borderWidth: 0.5, borderColor: '#eee' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '500' },
  items: { fontSize: 13, color: '#666' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '700', color: '#534AB7' },
  date: { fontSize: 12, color: '#aaa' },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#aaa' },
})
