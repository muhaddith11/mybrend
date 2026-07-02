import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'

export default function OpenStoreScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)

  const title = lang === 'ru' ? 'Откройте магазин на ZYFF' : lang === 'en' ? 'Open a store on ZYFF' : "ZYFF'da do'kon oching"
  const text = lang === 'ru'
    ? 'Хотите открыть магазин на ZYFF? Свяжитесь с нами — поможем начать онлайн-продажи уже сегодня. Размещайте свои товары, принимайте заказы и доставляйте по Коканду.'
    : lang === 'en'
    ? 'Want to open a store on ZYFF? Contact us — we will help you start selling online today. List your products, accept orders and deliver across Kokand.'
    : "ZYFF'da do'kon ochmoqchimisiz? Biz bilan bog'laning — bugun onlayn savdoni boshlab yuborishingizga yordam beramiz. O'z mahsulotlaringizni joylang, buyurtmalarni qabul qiling va Qo'qon bo'ylab yetkazib bering."
  const contactBtn = lang === 'ru' ? 'Связаться' : lang === 'en' ? 'Contact us' : "Bog'lanish"

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr.openStore}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>🏪</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL('mailto:info@zyff.uz')}>
          <Text style={styles.btnText}>{contactBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => Linking.openURL('https://t.me/zyff_uz')}>
          <Text style={styles.btnOutlineText}>Telegram: @zyff_uz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  content: { padding: 24, alignItems: 'center' },
  icon: { fontSize: 44, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10, textAlign: 'center' },
  text: { fontSize: 14, color: '#666', lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#534AB7', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnOutline: { borderWidth: 1, borderColor: '#534AB7', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center' },
  btnOutlineText: { color: '#534AB7', fontSize: 15, fontWeight: '600' },
})
