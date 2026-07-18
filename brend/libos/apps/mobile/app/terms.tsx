import { useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Text } from '../components/Txt'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { Lang } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'

type Section = { h: string; p?: string; li?: string[] }
type Content = { title: string; updated: string; lead: string; sections: Section[]; contact: string }

// Web /terms sahifasi bilan bir xil matn — uz/ru/en (shared'ga tegmasdan, mobil ichida)
const CONTENT: Record<Lang, Content> = {
  uz: {
    title: 'Foydalanish shartlari',
    updated: 'Oxirgi yangilanish: 2026-yil 28-iyun',
    lead: "ZYFF platformasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz. Iltimos ularni diqqat bilan o'qing.",
    contact: 'Aloqa:',
    sections: [
      { h: '1. Platforma roli', p: "ZYFF — xaridorlar va do'konlarni (sotuvchilarni) bog'lovchi marketplace. Mahsulotlar do'konlarga tegishli; oldi-sotdi shartnomasi xaridor va tegishli do'kon o'rtasida tuziladi. ZYFF mahsulot sifati yoki yetkazib berish uchun bevosita sotuvchi javobgar ekanini ta'kidlaydi." },
      { h: "2. Buyurtma va to'lov", p: "Buyurtmalar har do'kon bo'yicha alohida rasmiylashtiriladi. To'lov naqd (yetkazib berishda) yoki karta orqali (bot vositasida to'g'ridan-to'g'ri sotuvchiga) amalga oshiriladi. To'lov tasdig'i sotuvchi tomonidan beriladi." },
      { h: '3. Yetkazib berish', p: "Yetkazib berish shartlari va muddatlari tegishli do'kon tomonidan belgilanadi." },
      { h: '4. Foydalanuvchi majburiyatlari', li: [
        "To'g'ri va haqqoniy ma'lumot kiritish;",
        'Platformadan qonuniy maqsadlarda foydalanish;',
        'Boshqalarning huquqlarini buzmaslik.',
      ] },
      { h: '5. Javobgarlik', p: "ZYFF platformaning uzluksiz ishlashiga harakat qiladi, lekin texnik uzilishlar yoki sotuvchilar harakati natijasidagi zararlar uchun javobgarlikni o'z zimmasiga olmaydi." },
      { h: "6. O'zgartirishlar", p: "Shartlar yangilanishi mumkin; yangilangan versiya shu sahifada e'lon qilinadi." },
    ],
  },
  ru: {
    title: 'Условия использования',
    updated: 'Последнее обновление: 28 июня 2026 г.',
    lead: 'Используя платформу ZYFF, вы соглашаетесь со следующими условиями. Пожалуйста, внимательно ознакомьтесь с ними.',
    contact: 'Контакты:',
    sections: [
      { h: '1. Роль платформы', p: 'ZYFF — маркетплейс, связывающий покупателей и магазины (продавцов). Товары принадлежат магазинам; договор купли-продажи заключается между покупателем и соответствующим магазином. ZYFF подчёркивает, что за качество товара и доставку напрямую отвечает продавец.' },
      { h: '2. Заказ и оплата', p: 'Заказы оформляются отдельно по каждому магазину. Оплата производится наличными (при доставке) или картой (переводом напрямую продавцу через бот). Подтверждение оплаты предоставляет продавец.' },
      { h: '3. Доставка', p: 'Условия и сроки доставки устанавливаются соответствующим магазином.' },
      { h: '4. Обязанности пользователя', li: [
        'Вводить верную и достоверную информацию;',
        'Использовать платформу в законных целях;',
        'Не нарушать права других лиц.',
      ] },
      { h: '5. Ответственность', p: 'ZYFF стремится обеспечить бесперебойную работу платформы, но не несёт ответственности за ущерб, вызванный техническими сбоями или действиями продавцов.' },
      { h: '6. Изменения', p: 'Условия могут обновляться; обновлённая версия публикуется на этой странице.' },
    ],
  },
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 28 June 2026',
    lead: 'By using the ZYFF platform, you agree to the following terms. Please read them carefully.',
    contact: 'Contact:',
    sections: [
      { h: '1. Platform role', p: 'ZYFF is a marketplace connecting buyers and stores (sellers). Products belong to the stores; the sales contract is concluded between the buyer and the relevant store. ZYFF emphasizes that the seller is directly responsible for product quality and delivery.' },
      { h: '2. Orders and payment', p: 'Orders are placed separately for each store. Payment is made in cash (on delivery) or by card (transferred directly to the seller via the bot). Payment confirmation is provided by the seller.' },
      { h: '3. Delivery', p: 'Delivery terms and times are set by the relevant store.' },
      { h: '4. User obligations', li: [
        'Provide accurate and truthful information;',
        'Use the platform for lawful purposes;',
        'Do not violate the rights of others.',
      ] },
      { h: '5. Liability', p: 'ZYFF strives to keep the platform running smoothly but is not liable for damages caused by technical failures or the actions of sellers.' },
      { h: '6. Changes', p: 'The terms may be updated; the updated version will be posted on this page.' },
    ],
  },
}

export default function TermsScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const c = CONTENT[lang] ?? CONTENT.uz
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{c.title}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>{c.updated}</Text>
        <Text style={styles.lead}>{c.lead}</Text>

        {c.sections.map(s => (
          <View key={s.h} style={styles.section}>
            <Text style={styles.h2}>{s.h}</Text>
            {s.p ? <Text style={styles.p}>{s.p}</Text> : null}
            {s.li?.map(item => (
              <Text key={item} style={styles.li}>•  {item}</Text>
            ))}
          </View>
        ))}

        <View style={styles.contact}>
          <Text style={styles.p}>{c.contact}</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:info@zyff.uz')}>
            <Text style={styles.link}>info@zyff.uz</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://t.me/zyff_uz')}>
            <Text style={styles.link}>Telegram: @zyff_uz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  content: { padding: 20, paddingBottom: 40 },
  updated: { fontSize: 12, color: c.text3, marginBottom: 16 },
  lead: { fontSize: 14, color: c.text2, lineHeight: 22, marginBottom: 20 },
  section: { marginBottom: 18 },
  h2: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 8 },
  p: { fontSize: 14, color: c.text2, lineHeight: 21, marginBottom: 6 },
  li: { fontSize: 14, color: c.text2, lineHeight: 21, marginBottom: 4 },
  contact: { marginTop: 8, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: c.border, gap: 6 },
  link: { fontSize: 14, color: c.brand, fontWeight: '500' },
})
