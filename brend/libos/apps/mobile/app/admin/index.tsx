import { useMemo, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useTheme, useThemeStore, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'

export default function AdminDashboard() {
  const router = useRouter()
  const { colors, dark } = useTheme()
  const toggleTheme = useThemeStore(s => s.toggle)
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { token, owner, logout } = useAdminStore()

  useEffect(() => {
    if (!token) router.replace('/admin/login')
  }, [token])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(token!),
    enabled: !!token,
  })

  const handleLogout = async () => {
    await logout()
    router.replace('/admin/login')
  }

  if (!token) return null

  const statCards = [
    { icon: 'cube-outline', label: 'Mahsulotlar', value: stats?.productCount ?? '—' },
    { icon: 'receipt-outline', label: 'Buyurtmalar', value: stats?.totalOrders ?? '—' },
    { icon: 'time-outline', label: 'Kutilmoqda', value: stats?.pendingOrders ?? '—' },
    { icon: 'cash-outline', label: 'Daromad', value: stats?.totalRevenue != null ? `${Number(stats.totalRevenue).toLocaleString()} so'm` : '—' },
  ]

  const menu = [
    { icon: 'cube-outline', label: 'Mahsulotlar', desc: "Qo'shish, tahrirlash, o'chirish", to: '/admin/products' },
    { icon: 'images-outline', label: 'Lookbook (obrazlar)', desc: 'Rasm + mahsulotlardan obraz', to: '/admin/lookbook' },
    { icon: 'receipt-outline', label: 'Buyurtmalar', desc: 'Holatni boshqarish', to: '/admin/orders' },
    { icon: 'settings-outline', label: "Do'kon sozlamalari", desc: "Ma'lumot, to'lov, yetkazish", to: '/admin/settings' },
  ] as const

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{owner?.name ?? "Do'kon paneli"}</Text>
          <Text style={styles.headerSub}>{owner?.email}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.hIconBtn}>
            <Ionicons name={dark ? 'moon' : 'moon-outline'} size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.hIconBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={colors.brand} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map(s => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon as any} size={22} color={colors.accent} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tez amal — mahsulot qo'shish */}
        <TouchableOpacity style={styles.addProductBtn} onPress={() => router.push('/admin/product-form')}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.addProductText}>Yangi mahsulot qo'shish</Text>
        </TouchableOpacity>

        {menu.map(m => (
          <TouchableOpacity key={m.to} style={styles.menuItem} onPress={() => router.push(m.to)}>
            <View style={styles.menuIcon}>
              <Ionicons name={m.icon as any} size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Text style={styles.menuDesc}>{m.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text3} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: c.text },
  headerSub: { fontSize: 13, color: c.text2, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  hIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 12 },
  addProductBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.brand, borderRadius: 14, paddingVertical: 15, marginBottom: 4 },
  addProductText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 6, borderWidth: 0.5, borderColor: c.border },
  statValue: { fontSize: 18, fontWeight: '700', color: c.text },
  statLabel: { fontSize: 12, color: c.text2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: c.border },
  menuIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: c.text },
  menuDesc: { fontSize: 12, color: c.text2, marginTop: 2 },
})
