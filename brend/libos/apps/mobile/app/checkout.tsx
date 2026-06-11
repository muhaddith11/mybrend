import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'

type DeliveryType = 'DELIVERY' | 'PICKUP' | 'CASH_ON_DOOR'
type PaymentType = 'CLICK' | 'PAYME' | 'CASH'

export default function CheckoutScreen() {
  const router = useRouter()
  const { storeId } = useLocalSearchParams<{ storeId: string }>()
  const { isLoggedIn } = useAuthStore()
  const { itemsByStore, clearStore } = useCartStore()

  const [delivery, setDelivery] = useState<DeliveryType>('DELIVERY')
  const [payment, setPayment] = useState<PaymentType>('CASH')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const items = itemsByStore()[storeId] ?? []
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const storeName = items[0]?.storeName ?? ''

  const { data: store } = useQuery({
    queryKey: ['store-detail', storeId],
    queryFn: () => api.stores.list({ search: '' }).then(r => r.stores.find(s => s.id === storeId)),
    enabled: !!storeId,
  })

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color="#534AB7" />
          <Text style={styles.lockTitle}>Kirish talab etiladi</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Tizimga kirish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleOrder = async () => {
    if (delivery === 'DELIVERY' && !address.trim()) {
      Alert.alert('Manzil', 'Yetkazib berish manzilini kiriting')
      return
    }

    setLoading(true)
    try {
      const order = await api.orders.create({
        storeId,
        deliveryType: delivery,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          variantId: undefined,
        })),
      })

      clearStore(storeId)

      if (payment === 'CLICK' || payment === 'PAYME') {
        const endpoint = payment === 'CLICK' ? '/payment/click/create-url' : '/payment/payme/create-url'
        // To'lov URL ga yo'naltirish — keyingi versiyada WebBrowser bilan
        router.replace({ pathname: '/orders/[id]', params: { id: order.id } })
      } else {
        router.replace({ pathname: '/orders/[id]', params: { id: order.id } })
      }
    } catch (e: any) {
      Alert.alert('Xatolik', e.message ?? 'Buyurtma berilmadi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyurtma berish</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Do'kon */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Do'kon</Text>
          <View style={styles.storeRow}>
            <Ionicons name="storefront-outline" size={18} color="#534AB7" />
            <Text style={styles.storeRowName}>{storeName}</Text>
          </View>
        </View>

        {/* Mahsulotlar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mahsulotlar</Text>
          {items.map(item => (
            <View key={`${item.productId}_${item.size}_${item.color}`} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
              {(item.size || item.color) && (
                <Text style={styles.orderItemVariant}>{[item.size, item.color].filter(Boolean).join(' · ')}</Text>
              )}
              <Text style={styles.orderItemPrice}>
                {item.quantity} × {item.price.toLocaleString()} = {(item.quantity * item.price).toLocaleString()} so'm
              </Text>
            </View>
          ))}
        </View>

        {/* Yetkazish usuli */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Olish usuli</Text>
          {[
            { value: 'DELIVERY', icon: 'bicycle-outline', label: 'Yetkazib berish', desc: store?.deliveryTime ? `~${store.deliveryTime} daqiqa` : '', show: store?.hasDelivery !== false },
            { value: 'PICKUP', icon: 'bag-check-outline', label: 'O\'zim olib ketaman (bron)', desc: 'Do\'konga borib olasiz', show: store?.hasPickup !== false },
            { value: 'CASH_ON_DOOR', icon: 'cash-outline', label: 'Eshik oldida naqd', desc: 'Yetkazilganda to\'lanadi', show: store?.hasCashOnDoor !== false },
          ].filter(o => o.show).map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionRow, delivery === opt.value && styles.optionActive]}
              onPress={() => setDelivery(opt.value as DeliveryType)}
            >
              <Ionicons name={opt.icon as any} size={20} color={delivery === opt.value ? '#534AB7' : '#888'} />
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, delivery === opt.value && { color: '#534AB7' }]}>{opt.label}</Text>
                {opt.desc ? <Text style={styles.optionDesc}>{opt.desc}</Text> : null}
              </View>
              <View style={[styles.radio, delivery === opt.value && styles.radioActive]}>
                {delivery === opt.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manzil (faqat yetkazish uchun) */}
        {delivery === 'DELIVERY' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Yetkazish manzili</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Ko'cha, uy, xonadon raqami..."
              placeholderTextColor="#aaa"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
          </View>
        )}

        {/* To'lov usuli */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>To'lov usuli</Text>
          {[
            { value: 'CASH', icon: '💵', label: 'Naqd pul', desc: 'Yetkazilganda yoki do\'konda' },
            { value: 'CLICK', icon: '🟡', label: 'Click', desc: 'Click ilovasi orqali' },
            { value: 'PAYME', icon: '🔵', label: 'Payme', desc: 'Payme ilovasi orqali' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionRow, payment === opt.value && styles.optionActive]}
              onPress={() => setPayment(opt.value as PaymentType)}
            >
              <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, payment === opt.value && { color: '#534AB7' }]}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, payment === opt.value && styles.radioActive]}>
                {payment === opt.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Izoh */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Izoh (ixtiyoriy)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Qo'shimcha ma'lumot..."
            placeholderTextColor="#aaa"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      {/* Footer — jami va tugma */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Jami:</Text>
          <Text style={styles.totalPrice}>{total.toLocaleString()} so'm</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, loading && { opacity: 0.6 }]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderBtnText}>Buyurtma berish</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  lockTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  loginBtn: { backgroundColor: '#534AB7', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: '#fff', fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  scroll: { padding: 16, gap: 12, paddingBottom: 8 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10, borderWidth: 0.5, borderColor: '#eee' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storeRowName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  orderItem: { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  orderItemName: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  orderItemVariant: { fontSize: 12, color: '#888', marginTop: 1 },
  orderItemPrice: { fontSize: 13, color: '#534AB7', marginTop: 3 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  optionActive: { borderColor: '#534AB7', backgroundColor: '#f5f4ff' },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '500', color: '#1a1a1a' },
  optionDesc: { fontSize: 12, color: '#888', marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#534AB7' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#534AB7' },
  textArea: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa', minHeight: 60, textAlignVertical: 'top' },
  footer: { backgroundColor: '#fff', padding: 16, gap: 12, borderTopWidth: 0.5, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, color: '#666' },
  totalPrice: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  orderBtn: { backgroundColor: '#534AB7', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
