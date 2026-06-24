import { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@libos/shared'

type Step = { key: string; label: string; icon: string }

// Bosqichlar yetkazish turiga qarab farq qiladi:
//  • DELIVERY → Qabul → Tasdiq → Tayyorlanmoqda → Yo'lda → Yetkazildi
//  • PICKUP   → Qabul → Tasdiq → Olib ketildi (DELIVERED enum'i, boshqa yorliq)
const DELIVERY_STEPS: Step[] = [
  { key: 'PENDING',    label: 'Qabul qilindi',   icon: 'checkmark-circle-outline' },
  { key: 'CONFIRMED',  label: 'Tasdiqlandi',      icon: 'storefront-outline' },
  { key: 'PREPARING',  label: 'Tayyorlanmoqda',   icon: 'construct-outline' },
  { key: 'DELIVERING', label: 'Yo\'lda',           icon: 'bicycle-outline' },
  { key: 'DELIVERED',  label: 'Yetkazildi',        icon: 'home-outline' },
]

const PICKUP_STEPS: Step[] = [
  { key: 'PENDING',   label: 'Qabul qilindi', icon: 'checkmark-circle-outline' },
  { key: 'CONFIRMED', label: 'Tasdiqlandi',    icon: 'storefront-outline' },
  { key: 'DELIVERED', label: 'Olib ketildi',   icon: 'bag-check-outline' },
]

function stepsFor(deliveryType?: string): Step[] {
  return deliveryType === 'PICKUP' ? PICKUP_STEPS : DELIVERY_STEPS
}

const DELIVERY_LABELS: Record<string, string> = {
  DELIVERY: 'Yetkazib berish',
  PICKUP: 'O\'zim olib ketaman',
  CASH_ON_DOOR: 'Eshik oldida naqd',
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: order, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.orders.byId(id),
    refetchInterval: 10000, // har 10 soniyada yangilanadi
  })

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    )
  }

  const steps = stepsFor(order.deliveryType)
  const currentIdx = steps.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="home-outline" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyurtma #{id.slice(-6).toUpperCase()}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Status tracker */}
        {!isCancelled ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Holat</Text>
            <View style={styles.tracker}>
              {steps.map((step, i) => {
                const done = i <= currentIdx
                const active = i === currentIdx
                return (
                  <View key={step.key} style={styles.trackerStep}>
                    <View style={styles.trackerLeft}>
                      <View style={[
                        styles.trackerDot,
                        done && styles.trackerDotDone,
                        active && styles.trackerDotActive,
                      ]}>
                        <Ionicons
                          name={step.icon as any}
                          size={14}
                          color={done ? '#fff' : '#ccc'}
                        />
                      </View>
                      {i < steps.length - 1 && (
                        <View style={[styles.trackerLine, done && i < currentIdx && styles.trackerLineDone]} />
                      )}
                    </View>
                    <Text style={[styles.trackerLabel, active && styles.trackerLabelActive]}>
                      {step.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        ) : (
          <View style={[styles.section, styles.cancelledCard]}>
            <Ionicons name="close-circle-outline" size={32} color="#ef4444" />
            <Text style={styles.cancelledText}>Buyurtma bekor qilindi</Text>
          </View>
        )}

        {/* Do'kon */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Do'kon</Text>
          <Text style={styles.value}>{(order as any).store?.name}</Text>
        </View>

        {/* Yetkazish */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Olish usuli</Text>
          <Text style={styles.value}>{DELIVERY_LABELS[order.deliveryType]}</Text>
          {order.address && <Text style={styles.subValue}>{order.address}</Text>}
        </View>

        {/* Mahsulotlar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mahsulotlar</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                {item.quantity} × {item.price.toLocaleString()} so'm
              </Text>
            </View>
          ))}
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Jami:</Text>
            <Text style={styles.totalPrice}>{order.totalPrice.toLocaleString()} so'm</Text>
          </View>
        </View>

        {/* Izoh */}
        {(order as any).note && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Izoh</Text>
            <Text style={styles.value}>{(order as any).note}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.homeBtnText}>Bosh sahifaga qaytish</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

// ActivityIndicator import qo'shamiz
import { ActivityIndicator } from 'react-native'

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8, borderWidth: 0.5, borderColor: '#eee' },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  subValue: { fontSize: 13, color: '#666' },
  tracker: { gap: 0 },
  trackerStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 48 },
  trackerLeft: { alignItems: 'center', width: 28 },
  trackerDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  trackerDotDone: { backgroundColor: '#534AB7' },
  trackerDotActive: { backgroundColor: '#534AB7', shadowColor: '#534AB7', shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  trackerLine: { width: 2, flex: 1, backgroundColor: '#eee', minHeight: 20, marginVertical: 2 },
  trackerLineDone: { backgroundColor: '#534AB7' },
  trackerLabel: { fontSize: 14, color: '#aaa', paddingTop: 5 },
  trackerLabelActive: { color: '#534AB7', fontWeight: '600' },
  cancelledCard: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  cancelledText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  itemName: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  itemPrice: { fontSize: 13, color: '#534AB7', fontWeight: '500' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 14, color: '#666' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  homeBtn: { backgroundColor: '#534AB7', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  homeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
