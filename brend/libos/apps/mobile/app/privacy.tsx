import { useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, type ThemeColors } from '../store/theme'

// Web /privacy sahifasi bilan bir xil matn (o'zbekcha, statik)
const SECTIONS: { h: string; p?: string; li?: string[] }[] = [
  {
    h: "1. Biz yig'adigan ma'lumotlar",
    li: [
      "Ism va telefon raqami (ro'yxatdan o'tish va buyurtma berishda);",
      'Yetkazib berish manzili va xaritadagi joylashuv (faqat yetkazib berish uchun);',
      'Buyurtma tarixi va savatdagi mahsulotlar;',
      "Bot orqali to'lov tanlangan bo'lsa — Telegram hisobingiz (chat) va to'lov cheki rasmi.",
    ],
  },
  {
    h: "2. Ma'lumotlardan foydalanish",
    p: "Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:",
    li: [
      'Buyurtmalarni qabul qilish, qayta ishlash va yetkazib berish;',
      "Buyurtma holati to'g'risida SMS va Telegram orqali xabar berish;",
      "Qo'llab-quvvatlash va xizmat sifatini yaxshilash.",
    ],
  },
  {
    h: "3. Ma'lumotlarni uchinchi tomonlar bilan ulashish",
    p: "Buyurtma bergan do'konga (sotuvchiga) buyurtmani bajarish uchun zarur ma'lumotlar (ism, telefon, manzil) yetkaziladi. SMS xabarlari operator (Eskiz.uz) orqali, Telegram xabarlari Telegram orqali yuboriladi. Biz sizning shaxsiy ma'lumotlaringizni hech kimga sotmaymiz va reklama maqsadida uchinchi tomonlarga bermaymiz.",
  },
  {
    h: "4. To'lov ma'lumotlari",
    p: "Bot orqali karta o'tkazmasida pul to'g'ridan-to'g'ri sotuvchining kartasiga o'tkaziladi. Biz sizning karta raqamingizni saqlamaymiz va to'lovni o'zimiz qayta ishlamaymiz — faqat to'lov chekini sotuvchiga tasdiqlash uchun yetkazamiz.",
  },
  {
    h: "5. Ma'lumotlarni saqlash va xavfsizlik",
    p: "Ma'lumotlar himoyalangan serverlarda saqlanadi va ularni himoya qilish uchun zarur texnik choralar ko'riladi. Shunga qaramay, internet orqali uzatishning 100% xavfsizligi kafolatlanmaydi.",
  },
  {
    h: '6. Sizning huquqlaringiz',
    p: "Siz o'zingiz haqingizdagi ma'lumotlarni ko'rish, tuzatish yoki o'chirishni so'rashingiz mumkin. Buning uchun quyidagi aloqa orqali bizga murojaat qiling.",
  },
  {
    h: '7. Bolalar',
    p: "Xizmatimiz 18 yoshga to'lmagan shaxslarga mo'ljallanmagan va biz ataylab bolalardan ma'lumot yig'maymiz.",
  },
  {
    h: "8. O'zgartirishlar",
    p: "Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin. Yangilangan versiya shu sahifada e'lon qilinadi.",
  },
]

export default function PrivacyScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maxfiylik siyosati</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Oxirgi yangilanish: 2026-yil 28-iyun</Text>
        <Text style={styles.lead}>
          ZYFF («biz», «platforma») — Qo'qon shahridagi kiyim do'konlarini bitta joyga jamlagan
          onlayn marketplace. Ushbu siyosat siz ZYFF veb-sayti va mobil ilovasidan foydalanganingizda
          qanday shaxsiy ma'lumotlar yig'ilishini, ulardan qanday foydalanishimizni va ularni qanday
          himoya qilishimizni tushuntiradi.
        </Text>

        {SECTIONS.map(s => (
          <View key={s.h} style={styles.section}>
            <Text style={styles.h2}>{s.h}</Text>
            {s.p ? <Text style={styles.p}>{s.p}</Text> : null}
            {s.li?.map(item => (
              <Text key={item} style={styles.li}>•  {item}</Text>
            ))}
          </View>
        ))}

        <View style={styles.contact}>
          <Text style={styles.p}>Savollaringiz bo'lsa bog'laning:</Text>
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
