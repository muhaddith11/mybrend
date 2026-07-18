import { useMemo, useState } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native'
import { Text } from '../../components/Txt'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'

// Backend PATCH faqat shularni qabul qiladi. PENDING — boshlang'ich holat,
// qo'lda o'rnatilmaydi (faqat ko'rsatishda STATUS_LABEL/COLOR orqali chiqadi).
const SETTABLE_STATUSES = ['CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'] as const
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PREPARING: '#8b5cf6',
  DELIVERING: '#06b6d4', DELIVERED: '#16a34a', CANCELLED: '#ef4444',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlangan', PREPARING: 'Tayyorlanmoqda',
  DELIVERING: 'Yetkazilmoqda', DELIVERED: 'Yetkazildi', CANCELLED: 'Bekor qilindi',
}

export default function AdminOrders() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const qc = useQueryClient()
  const [editing, setEditing] = useState<string | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getOrders(token!),
    enabled: !!token,
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(token!, id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); setEditing(null) },
  })

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyurtmalar</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
              <TouchableOpacity
                style={[styles.badge, { backgroundColor: (STATUS_COLOR[item.status] ?? '#888') + '22' }]}
                onPress={() => setEditing(item.id)}
              >
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] ?? '#888' }]}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
                <Ionicons name="chevron-down" size={12} color={STATUS_COLOR[item.status] ?? '#888'} />
              </TouchableOpacity>
            </View>
            <Text style={styles.items} numberOfLines={4}>
              {item.items.map(i => {
                const v = [(i as any).size, (i as any).color].filter(Boolean).join('/')
                return `${i.quantity}× ${i.product.name}${v ? ` (${v})` : ''}${(i.product as any).sku ? ` [${(i.product as any).sku}]` : ''}`
              }).join(', ')}
            </Text>
            {item.address ? (
              <View style={styles.addrRow}>
                <Ionicons name="location-outline" size={13} color={colors.text3} />
                <Text style={styles.addr}>{item.address}</Text>
              </View>
            ) : null}
            <View style={styles.cardBottom}>
              <Text style={styles.price}>{item.totalPrice.toLocaleString()} so'm</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? 'Yuklanmoqda…' : "Buyurtmalar yo'q"}</Text>
        }
      />

      {/* Holat tanlash modali */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <Pressable style={styles.overlay} onPress={() => setEditing(null)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>Holatni o'zgartirish</Text>
            {SETTABLE_STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={styles.statusRow}
                onPress={() => editing && setStatus.mutate({ id: editing, status: s })}
              >
                <View style={[styles.dot, { backgroundColor: STATUS_COLOR[s] }]} />
                <Text style={styles.statusRowText}>{STATUS_LABEL[s]}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 6, borderWidth: 0.5, borderColor: c.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '700', color: c.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  items: { fontSize: 13, color: c.text2 },
  addr: { flex: 1, fontSize: 12, color: c.text3 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: c.brand },
  date: { fontSize: 12, color: c.text3 },
  empty: { textAlign: 'center', color: c.text2, marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statusRowText: { fontSize: 15, color: c.text },
})
