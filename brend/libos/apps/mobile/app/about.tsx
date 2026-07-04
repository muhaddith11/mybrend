import { useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'

export default function AboutScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const heading = lang === 'ru' ? 'О ZYFF' : lang === 'en' ? 'About ZYFF' : 'ZYFF haqida'
  const intro = lang === 'ru'
    ? 'ZYFF — мультибрендовая платформа одежды в городе Коканд. Мы объединяем лучшие магазины города в одном месте: ищите, сравнивайте и заказывайте напрямую.'
    : lang === 'en'
    ? 'ZYFF is a multi-brand clothing marketplace in Kokand, Uzbekistan. We bring the city’s best stores together in one place — search, compare and order directly.'
    : "ZYFF — Qo'qon shahridagi ko'p brendli kiyim marketplace platformasi. Biz shahardagi eng yaxshi do'konlarni bir joyda birlashtiramiz: qidiring, solishtiring va to'g'ridan-to'g'ri buyurtma bering."

  const blocks: { t: string; b: string }[] =
    lang === 'ru'
      ? [
          { t: 'Наши магазины', b: 'На платформе представлены Asma Design (премиальная мужская одежда), Boosner (100% оригинальные бренды — Adidas, Calvin Klein, New Balance) и One Pro Boutique (современная мужская одежда). У каждого магазина своя страница, товары и служба доставки.' },
          { t: 'Как это работает', b: 'Найдите товар → выберите магазин → добавьте в корзину → оформите заказ. Оплата наличными или картой (перевод через бот). Доставка по всему Узбекистану.' },
          { t: 'Расположение и контакты', b: '📍 г. Коканд, Узбекистан\n🌐 zyff.uz · 📷 Instagram: @zyff.uz' },
        ]
      : lang === 'en'
      ? [
          { t: 'Our stores', b: 'The platform features Asma Design (premium menswear), Boosner (100% original brands — Adidas, Calvin Klein, New Balance) and One Pro Boutique (modern menswear). Each store has its own page, products and delivery service.' },
          { t: 'How it works', b: 'Find a product → choose a store → add to cart → place your order. Payment by cash or card (transfer via bot). Delivery across Uzbekistan.' },
          { t: 'Location & contact', b: '📍 Kokand, Uzbekistan\n🌐 zyff.uz · 📷 Instagram: @zyff.uz' },
        ]
      : [
          { t: "Bizning do'konlarimiz", b: "Platformamizda Asma Design (premium erkaklar kiyimi), Boosner (100% original brendlar — Adidas, Calvin Klein, New Balance) va One Pro Boutique (zamonaviy erkaklar kiyimi) kabi do'konlar mavjud. Har bir do'kon o'z sahifasiga, mahsulotlariga va yetkazib berish xizmatiga ega." },
          { t: 'Qanday ishlaydi', b: "Mahsulotni qidiring → do'konni tanlang → savatga qo'shing → buyurtma bering. To'lov naqd yoki karta (bot orqali o'tkazma) orqali. O'zbekiston bo'ylab yetkazib berish mavjud." },
          { t: 'Joylashuv va aloqa', b: "📍 Qo'qon shahri, O'zbekiston\n🌐 zyff.uz · 📷 Instagram: @zyff.uz" },
        ]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{heading}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>🛍️</Text>
        <Text style={styles.intro}>{intro}</Text>

        {blocks.map(bl => (
          <View key={bl.t} style={styles.block}>
            <Text style={styles.blockTitle}>{bl.t}</Text>
            <Text style={styles.blockText}>{bl.b}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={() => router.push('/stores')}>
          <Text style={styles.btnText}>{tr.heroAppCta.replace(' →', '')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  content: { padding: 24, paddingBottom: 40 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 16 },
  intro: { fontSize: 15, color: c.text, lineHeight: 23, textAlign: 'center', marginBottom: 24 },
  block: { marginBottom: 20 },
  blockTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 6 },
  blockText: { fontSize: 14, color: c.text2, lineHeight: 21 },
  btn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  btnText: { color: c.white, fontSize: 15, fontWeight: '600' },
})
