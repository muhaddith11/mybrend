import { useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, type ThemeColors } from '../store/theme'

// Web /terms sahifasi bilan bir xil matn (o'zbekcha, statik)
const SECTIONS: { h: string; p?: string; li?: string[] }[] = [
  {
    h: '1. Platforma roli',
    p: "ZYFF — xaridorlar va do'konlarni (sotuvchilarni) bog'lovchi marketplace. Mahsulotlar do'konlarga tegishli; oldi-sotdi shartnomasi xaridor va tegishli do'kon o'rtasida tuziladi. ZYFF mahsulot sifati yoki yetkazib berish uchun bevosita sotuvchi javobgar ekanini ta'kidlaydi.",
  },
  {
    h: "2. Buyurtma va to'lov",
    p: "Buyurtmalar har do'kon bo'yicha alohida rasmiylashtiriladi. To'lov naqd (yetkazib berishda) yoki karta orqali (bot vositasida to'g'ridan-to'g'ri sotuvchiga) amalga oshiriladi. To'lov tasdig'i sotuvchi tomonidan beriladi.",
  },
  {
    h: '3. Yetkazib berish',
    p: "Yetkazib berish shartlari va muddatlari tegishli do'kon tomonidan belgilanadi.",
  },
  {
    h: '4. Foydalanuvchi majburiyatlari',
    li: [
      "To'g'ri va haqqoniy ma'lumot kiritish;",
      'Platformadan qonuniy maqsadlarda foydalanish;',
      'Boshqalarning huquqlarini buzmaslik.',
    ],
  },
  {
    h: '5. Javobgarlik',
    p: "ZYFF platformaning uzluksiz ishlashiga harakat qiladi, lekin texnik uzilishlar yoki sotuvchilar harakati natijasidagi zararlar uchun javobgarlikni o'z zimmasiga olmaydi.",
  },
  {
    h: "6. O'zgartirishlar",
    p: "Shartlar yangilanishi mumkin; yangilangan versiya shu sahifada e'lon qilinadi.",
  },
]

export default function TermsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foydalanish shartlari</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Oxirgi yangilanish: 2026-yil 28-iyun</Text>
        <Text style={styles.lead}>
          ZYFF platformasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz.
          Iltimos ularni diqqat bilan o'qing.
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
          <Text style={styles.p}>Aloqa:</Text>
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
