import { useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'

type Step = { key: string; label: string; icon: string }

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  // Bosqichlar yetkazish turiga qarab farq qiladi (DELIVERY vs PICKUP)
  const DELIVERY_STEPS: Step[] = [
    { key: 'PENDING',    label: tr.stPending,    icon: 'checkmark-circle-outline' },
    { key: 'CONFIRMED',  label: tr.stConfirmed,  icon: 'storefront-outline' },
    { key: 'PREPARING',  label: tr.stPreparing,  icon: 'construct-outline' },
    { key: 'DELIVERING', label: tr.stDelivering, icon: 'bicycle-outline' },
    { key: 'DELIVERED',  label: tr.stDelivered,  icon: 'home-outline' },
  ]
  const PICKUP_STEPS: Step[] = [
    { key: 'PENDING',   label: tr.stPending,   icon: 'checkmark-circle-outline' },
    { key: 'CONFIRMED', label: tr.stConfirmed, icon: 'storefront-outline' },
    { key: 'DELIVERED', label: tr.stPickedUp,  icon: 'bag-check-outline' },
  ]
  const stepsFor = (deliveryType?: string): Step[] =>
    deliveryType === 'PICKUP' ? PICKUP_STEPS : DELIVERY_STEPS

  const DELIVERY_LABELS: Record<string, string> = {
    DELIVERY: tr.mDelivDelivery,
    PICKUP: tr.mDelivPickup,
    CASH_ON_DOOR: tr.mDelivCashDoor,
  }

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.orders.byId(id),
    refetchInterval: 10000, // har 10 soniyada yangilanadi
  })

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
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
          <Ionicons name="home-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>#{id.slice(-6).toUpperCase()}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Status tracker */}
        {!isCancelled ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{tr.mStatus}</Text>
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
                          color={done ? '#fff' : colors.text3}
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
            <Ionicons name="close-circle-outline" size={32} color={colors.danger} />
            <Text style={styles.cancelledText}>{tr.mOrderCancelled}</Text>
          </View>
        )}

        {/* Do'kon */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.mStore}</Text>
          <Text style={styles.value}>{(order as any).store?.name}</Text>
        </View>

        {/* Yetkazish */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.mDeliveryMethod}</Text>
          <Text style={styles.value}>{DELIVERY_LABELS[order.deliveryType]}</Text>
          {order.address && <Text style={styles.subValue}>{order.address}</Text>}
        </View>

        {/* Mahsulotlar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.coProducts}</Text>
          {order.items.map(item => {
            const variant = [(item as any).size, (item as any).color].filter(Boolean).join(' · ')
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                  {!!variant && <Text style={styles.itemVariant}>{variant}</Text>}
                </View>
                <Text style={styles.itemPrice}>
                  {item.quantity} × {item.price.toLocaleString()} {tr.som}
                </Text>
              </View>
            )
          })}
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>{tr.coTotal}:</Text>
            <Text style={styles.totalPrice}>{order.totalPrice.toLocaleString()} {tr.som}</Text>
          </View>
        </View>

        {/* Izoh */}
        {(order as any).note && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{tr.mNote}</Text>
            <Text style={styles.value}>{(order as any).note}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.homeBtnText}>{tr.mBackHome}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 16, fontWeight: '600', color: c.text },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  section: { backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 8, borderWidth: 0.5, borderColor: c.border },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: c.text3, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, color: c.text, fontWeight: '500' },
  subValue: { fontSize: 13, color: c.text2 },
  tracker: { gap: 0 },
  trackerStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 48 },
  trackerLeft: { alignItems: 'center', width: 28 },
  trackerDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
  trackerDotDone: { backgroundColor: c.brand },
  trackerDotActive: { backgroundColor: c.brand, shadowColor: c.brand, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  trackerLine: { width: 2, flex: 1, backgroundColor: c.border, minHeight: 20, marginVertical: 2 },
  trackerLineDone: { backgroundColor: c.brand },
  trackerLabel: { fontSize: 14, color: c.text3, paddingTop: 5 },
  trackerLabelActive: { color: c.brand, fontWeight: '600' },
  cancelledCard: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  cancelledText: { fontSize: 16, fontWeight: '600', color: c.danger },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: c.border },
  itemName: { fontSize: 14, color: c.text },
  itemVariant: { fontSize: 12, color: c.text2, marginTop: 2 },
  itemPrice: { fontSize: 13, color: c.brand, fontWeight: '500' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 14, color: c.text2 },
  totalPrice: { fontSize: 16, fontWeight: '700', color: c.text },
  homeBtn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  homeBtnText: { color: c.white, fontSize: 15, fontWeight: '600' },
})
