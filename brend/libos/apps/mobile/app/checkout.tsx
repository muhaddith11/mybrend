import { useMemo, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Alert, Linking,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'
import { LeafletWebMap } from '../components/LeafletWebMap'

type DeliveryType = 'DELIVERY' | 'PICKUP' | 'CASH_ON_DOOR'
// Veb bilan bir xil: hozir faqat CASH va TRANSFER (bot orqali karta/QR) faol.
// CLICK/PAYME kod saqlanadi — keyin yoqish uchun ro'yxatga qaytarish kifoya.
type PaymentType = 'CASH' | 'CLICK' | 'PAYME' | 'TRANSFER'

export default function CheckoutScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors, dark } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { storeId } = useLocalSearchParams<{ storeId: string }>()
  const { isLoggedIn } = useAuthStore()
  const { itemsByStore, clearStore } = useCartStore()

  const [delivery, setDelivery] = useState<DeliveryType>('DELIVERY')
  const [payment, setPayment] = useState<PaymentType>('CASH')
  // Strukturali manzil: Kvartira (mahalla/dom/padez/etaj/kvartira) yoki Hovli (mahalla/uy)
  const [addrKind, setAddrKind] = useState<'apartment' | 'house'>('apartment')
  const [mahalla, setMahalla] = useState('')
  const [dom, setDom] = useState('')
  const [padez, setPadez] = useState('')
  const [etaj, setEtaj] = useState('')
  const [kvartira, setKvartira] = useState('')
  const [uy, setUy] = useState('')
  const [note, setNote] = useState('')
  // Xaritadan tanlangan aniq joylashuv (web bilan bir xil — lat/lng)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mapAddress, setMapAddress] = useState('')

  const composeAddress = () => {
    const parts: string[] = []
    if (mahalla.trim()) parts.push(`Mahalla: ${mahalla.trim()}`)
    if (addrKind === 'apartment') {
      if (dom.trim()) parts.push(`Dom: ${dom.trim()}`)
      if (padez.trim()) parts.push(`Padez: ${padez.trim()}`)
      if (etaj.trim()) parts.push(`Etaj: ${etaj.trim()}`)
      if (kvartira.trim()) parts.push(`Kv: ${kvartira.trim()}`)
    } else if (uy.trim()) {
      parts.push(`Uy: ${uy.trim()}`)
    }
    return parts.join(', ')
  }
  // Xaritadan joy tanlangan bo'lsa ham, strukturali manzil to'ldirilgan bo'lsa ham — yaroqli
  const addrFilled = !!coords || (!!mahalla.trim() && (addrKind === 'apartment' ? !!kvartira.trim() : !!uy.trim()))
  const [loading, setLoading] = useState(false)

  const items = itemsByStore()[storeId] ?? []
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const storeName = items[0]?.storeName ?? ''

  const { data: store } = useQuery({
    queryKey: ['store-detail', storeId],
    // limit=100 — do'kon ro'yxati 20 tadan oshsa ham (reyting past do'kon) topiladi
    queryFn: () => api.stores.list({ limit: 100 }).then(r => r.stores.find(s => s.id === storeId)),
    enabled: !!storeId,
  })

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.brand} />
          <Text style={styles.lockTitle}>{tr.mLoginRequired}</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>{tr.login}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleOrder = async () => {
    if (items.length === 0) {
      Alert.alert(tr.mErrorTitle, tr.mOrderFailed)
      return
    }
    if (delivery === 'DELIVERY' && !addrFilled) {
      Alert.alert(tr.mAddrTitle, tr.mAddrRequired)
      return
    }

    setLoading(true)
    try {
      const order = await api.orders.create({
        storeId,
        deliveryType: delivery,
        address: delivery === 'DELIVERY' ? ([mapAddress, composeAddress()].filter(Boolean).join(' — ') || undefined) : undefined,
        lat: delivery === 'DELIVERY' ? coords?.lat : undefined,
        lng: delivery === 'DELIVERY' ? coords?.lng : undefined,
        note: note.trim() || undefined,
        paymentProvider: payment === 'CASH' ? undefined : payment,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
      })

      // TRANSFER (bot orqali karta/QR): to'lov do'kon egasi tomonidan
      // tasdiqlanmaguncha savatdan o'chirilmaydi — buyurtma kuzatuv sahifasi
      // holat CONFIRMED bo'lganда tozalaydi. Naqd/boshqada — darhol tozalaymiz.
      if (payment !== 'TRANSFER') {
        clearStore(storeId)
      }

      // Click/Payme → paymentUrl, TRANSFER (bot orqali) → botUrl. Ikkalasi ham
      // tashqi sahifaga/botga yo'naltiradi (veb bilan bir xil mantiq).
      const redirectUrl = order.paymentUrl ?? order.botUrl
      if (redirectUrl) {
        await Linking.openURL(redirectUrl)
      }
      router.replace({ pathname: '/orders/[id]', params: { id: order.id } })
    } catch (e: any) {
      Alert.alert(tr.mErrorTitle, e.message ?? tr.mOrderFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr.coTitle}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Do'kon */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.mStore}</Text>
          <View style={styles.storeRow}>
            <Ionicons name="storefront-outline" size={18} color={colors.brand} />
            <Text style={styles.storeRowName}>{storeName}</Text>
          </View>
        </View>

        {/* Mahsulotlar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.coProducts}</Text>
          {items.map(item => (
            <View key={`${item.productId}_${item.size}_${item.color}`} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
              {(item.size || item.color) && (
                <Text style={styles.orderItemVariant}>{[item.size, item.color].filter(Boolean).join(' · ')}</Text>
              )}
              <Text style={styles.orderItemPrice}>
                {item.quantity} × {item.price.toLocaleString()} = {(item.quantity * item.price).toLocaleString()} {tr.som}
              </Text>
            </View>
          ))}
        </View>

        {/* Yetkazish usuli */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.mDeliveryMethod}</Text>
          {[
            { value: 'DELIVERY', icon: 'bicycle-outline', label: tr.mDelivDelivery, desc: store?.deliveryTime ? `~${store.deliveryTime} ${tr.mMinutes}` : '', show: store?.hasDelivery !== false },
            { value: 'PICKUP', icon: 'bag-check-outline', label: tr.mDelivPickupLabel, desc: tr.mDelivPickupDesc, show: store?.hasPickup !== false },
            { value: 'CASH_ON_DOOR', icon: 'cash-outline', label: tr.mDelivCashDoor, desc: tr.mDelivCashDesc, show: store?.hasCashOnDoor !== false },
          ].filter(o => o.show).map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionRow, delivery === opt.value && styles.optionActive]}
              onPress={() => setDelivery(opt.value as DeliveryType)}
            >
              <Ionicons name={opt.icon as any} size={20} color={delivery === opt.value ? colors.brand : colors.text3} />
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, delivery === opt.value && { color: colors.brand }]}>{opt.label}</Text>
                {opt.desc ? <Text style={styles.optionDesc}>{opt.desc}</Text> : null}
              </View>
              <View style={[styles.radio, delivery === opt.value && styles.radioActive]}>
                {delivery === opt.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manzil (faqat yetkazish uchun) — strukturali */}
        {delivery === 'DELIVERY' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{tr.mDeliveryAddr}</Text>

            {/* Xarita — aniq joyni belgilash (web bilan bir xil) */}
            <LeafletWebMap
              mode="picker"
              height={240}
              dark={dark}
              initial={coords}
              onSelect={(lat, lng, address) => { setCoords({ lat, lng }); setMapAddress(address) }}
            />
            {mapAddress
              ? <Text style={styles.mapAddr}>📍 {mapAddress}</Text>
              : <Text style={styles.mapHint}>
                  {lang === 'ru'
                    ? '🗺️ Отметьте свой дом на карте (необязательно)'
                    : lang === 'en'
                    ? '🗺️ Mark your home on the map (optional)'
                    : '🗺️ Xaritadan uyingizni belgilang (ixtiyoriy)'}
                </Text>}

            {/* Kvartira / Hovli */}
            <View style={styles.addrToggle}>
              {(['apartment', 'house'] as const).map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.addrToggleBtn, addrKind === k && styles.addrToggleActive]}
                  onPress={() => setAddrKind(k)}
                >
                  <Text style={[styles.addrToggleText, addrKind === k && styles.addrToggleTextActive]}>
                    {k === 'apartment' ? tr.mAddrApartment : tr.mAddrHouse}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.fieldInput} placeholder={tr.mAddrMahalla} placeholderTextColor={colors.text3} value={mahalla} onChangeText={setMahalla} />
            {addrKind === 'apartment' ? (
              <>
                <TextInput style={styles.fieldInput} placeholder={tr.mAddrDom} placeholderTextColor={colors.text3} value={dom} onChangeText={setDom} />
                <View style={styles.addrRow}>
                  <TextInput style={[styles.fieldInput, styles.addrHalf]} placeholder={tr.mAddrPadez} placeholderTextColor={colors.text3} value={padez} onChangeText={setPadez} keyboardType="numeric" />
                  <TextInput style={[styles.fieldInput, styles.addrHalf]} placeholder={tr.mAddrEtaj} placeholderTextColor={colors.text3} value={etaj} onChangeText={setEtaj} keyboardType="numeric" />
                </View>
                <TextInput style={styles.fieldInput} placeholder={tr.mAddrKv} placeholderTextColor={colors.text3} value={kvartira} onChangeText={setKvartira} keyboardType="numeric" />
              </>
            ) : (
              <TextInput style={styles.fieldInput} placeholder={tr.mAddrUy} placeholderTextColor={colors.text3} value={uy} onChangeText={setUy} />
            )}
          </View>
        )}

        {/* To'lov usuli */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr.coPayment}</Text>
          {/*
            Veb bilan bir xil: hozir faqat Naqd va Karta (bot orqali QR/karta
            o'tkazma). Click/Payme kod saqlanadi — keyin yoqish uchun shu ro'yxatga
            qaytarish kifoya: { value: 'CLICK', ... }, { value: 'PAYME', ... }
          */}
          {[
            { value: 'CASH', icon: '💵', label: tr.mPayCash, desc: tr.mPayCashDesc },
            { value: 'TRANSFER', icon: '💳', label: tr.mPayCard, desc: tr.mPayCardDesc },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionRow, payment === opt.value && styles.optionActive]}
              onPress={() => setPayment(opt.value as PaymentType)}
            >
              <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, payment === opt.value && { color: colors.brand }]}>{opt.label}</Text>
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
          <Text style={styles.sectionLabel}>{tr.coNote}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={tr.coNotePh}
            placeholderTextColor={colors.text3}
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
          <Text style={styles.totalLabel}>{tr.coTotal}:</Text>
          <Text style={styles.totalPrice}>{total.toLocaleString()} {tr.som}</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, loading && { opacity: 0.6 }]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderBtnText}>{tr.mOrderNow}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  lockTitle: { fontSize: 18, fontWeight: '600', color: c.text },
  loginBtn: { backgroundColor: c.brand, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: c.white, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  scroll: { padding: 16, gap: 12, paddingBottom: 8 },
  section: { backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 10, borderWidth: 0.5, borderColor: c.border },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: c.text3, textTransform: 'uppercase', letterSpacing: 0.5 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storeRowName: { fontSize: 15, fontWeight: '500', color: c.text },
  orderItem: { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: c.border },
  orderItemName: { fontSize: 14, color: c.text, fontWeight: '500' },
  orderItemVariant: { fontSize: 12, color: c.text2, marginTop: 1 },
  orderItemPrice: { fontSize: 13, color: c.brand, marginTop: 3 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface2 },
  optionActive: { borderColor: c.brand, backgroundColor: c.brandLight },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '500', color: c.text },
  optionDesc: { fontSize: 12, color: c.text2, marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: c.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.brand },
  textArea: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 12, fontSize: 14, color: c.text, backgroundColor: c.surface2, minHeight: 60, textAlignVertical: 'top' },
  mapAddr: { fontSize: 13, color: c.brand, fontWeight: '500' },
  mapHint: { fontSize: 12, color: c.text3 },
  addrToggle: { flexDirection: 'row', gap: 8 },
  addrToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', backgroundColor: c.surface2 },
  addrToggleActive: { borderColor: c.brand, backgroundColor: c.brand },
  addrToggleText: { fontSize: 14, color: c.text, fontWeight: '500' },
  addrToggleTextActive: { color: c.white },
  fieldInput: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 12, fontSize: 14, color: c.text, backgroundColor: c.surface2 },
  addrRow: { flexDirection: 'row', gap: 8 },
  addrHalf: { flex: 1 },
  footer: { backgroundColor: c.surface, padding: 16, gap: 12, borderTopWidth: 0.5, borderTopColor: c.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, color: c.text2 },
  totalPrice: { fontSize: 20, fontWeight: '700', color: c.text },
  orderBtn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: c.white, fontSize: 16, fontWeight: '600' },
})
