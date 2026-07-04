import { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'

export default function DeliveryScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const title = lang === 'ru' ? 'Условия доставки' : lang === 'en' ? 'Delivery terms' : 'Yetkazib berish shartlari'
  const text = lang === 'ru'
    ? 'Бесплатная доставка при заказе от 300 000 сум. Доставка по всему Узбекистану. Время и стоимость доставки зависят от магазина — указаны на странице каждого магазина.'
    : lang === 'en'
    ? 'Free delivery on orders over 300,000 UZS. Delivery across Uzbekistan. Delivery time and cost depend on the store — shown on each store page.'
    : "300 000 so'mdan yuqori xaridlarga bepul yetkazib berish. O'zbekiston bo'ylab yetkazib berish mavjud. Yetkazish vaqti va narxi do'konga qarab farq qiladi — har bir do'kon sahifasida ko'rsatilgan."

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr.delivery}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>🚚</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/')}>
          <Text style={styles.btnText}>{tr.home}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  content: { padding: 24, alignItems: 'center' },
  icon: { fontSize: 44, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 10, textAlign: 'center' },
  text: { fontSize: 14, color: c.text2, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center' },
  btnText: { color: c.white, fontSize: 15, fontWeight: '600' },
})
