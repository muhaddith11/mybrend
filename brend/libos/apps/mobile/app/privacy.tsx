import { useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { Lang } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'

type Section = { h: string; p?: string; li?: string[] }
type Content = { title: string; updated: string; lead: string; sections: Section[]; contact: string }

// Web /privacy sahifasi bilan bir xil matn — uz/ru/en (shared'ga tegmasdan, mobil ichida)
const CONTENT: Record<Lang, Content> = {
  uz: {
    title: 'Maxfiylik siyosati',
    updated: 'Oxirgi yangilanish: 2026-yil 28-iyun',
    lead: "ZYFF («biz», «platforma») — Qo'qon shahridagi kiyim do'konlarini bitta joyga jamlagan onlayn marketplace. Ushbu siyosat siz ZYFF veb-sayti va mobil ilovasidan foydalanganingizda qanday shaxsiy ma'lumotlar yig'ilishini, ulardan qanday foydalanishimizni va ularni qanday himoya qilishimizni tushuntiradi.",
    contact: "Savollaringiz bo'lsa bog'laning:",
    sections: [
      { h: "1. Biz yig'adigan ma'lumotlar", li: [
        "Ism va telefon raqami (ro'yxatdan o'tish va buyurtma berishda);",
        'Yetkazib berish manzili va xaritadagi joylashuv (faqat yetkazib berish uchun);',
        'Buyurtma tarixi va savatdagi mahsulotlar;',
        "Bot orqali to'lov tanlangan bo'lsa — Telegram hisobingiz (chat) va to'lov cheki rasmi.",
      ] },
      { h: "2. Ma'lumotlardan foydalanish", p: "Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:", li: [
        'Buyurtmalarni qabul qilish, qayta ishlash va yetkazib berish;',
        "Buyurtma holati to'g'risida SMS va Telegram orqali xabar berish;",
        "Qo'llab-quvvatlash va xizmat sifatini yaxshilash.",
      ] },
      { h: "3. Ma'lumotlarni uchinchi tomonlar bilan ulashish", p: "Buyurtma bergan do'konga (sotuvchiga) buyurtmani bajarish uchun zarur ma'lumotlar (ism, telefon, manzil) yetkaziladi. SMS xabarlari operator (Eskiz.uz) orqali, Telegram xabarlari Telegram orqali yuboriladi. Biz sizning shaxsiy ma'lumotlaringizni hech kimga sotmaymiz va reklama maqsadida uchinchi tomonlarga bermaymiz." },
      { h: "4. To'lov ma'lumotlari", p: "Bot orqali karta o'tkazmasida pul to'g'ridan-to'g'ri sotuvchining kartasiga o'tkaziladi. Biz sizning karta raqamingizni saqlamaymiz va to'lovni o'zimiz qayta ishlamaymiz — faqat to'lov chekini sotuvchiga tasdiqlash uchun yetkazamiz." },
      { h: "5. Ma'lumotlarni saqlash va xavfsizlik", p: "Ma'lumotlar himoyalangan serverlarda saqlanadi va ularni himoya qilish uchun zarur texnik choralar ko'riladi. Shunga qaramay, internet orqali uzatishning 100% xavfsizligi kafolatlanmaydi." },
      { h: '6. Sizning huquqlaringiz', p: "Siz o'zingiz haqingizdagi ma'lumotlarni ko'rish, tuzatish yoki o'chirishni so'rashingiz mumkin. Buning uchun quyidagi aloqa orqali bizga murojaat qiling." },
      { h: '7. Bolalar', p: "Xizmatimiz 18 yoshga to'lmagan shaxslarga mo'ljallanmagan va biz ataylab bolalardan ma'lumot yig'maymiz." },
      { h: "8. O'zgartirishlar", p: "Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin. Yangilangan versiya shu sahifada e'lon qilinadi." },
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Последнее обновление: 28 июня 2026 г.',
    lead: 'ZYFF («мы», «платформа») — онлайн-маркетплейс, объединяющий магазины одежды города Коканд в одном месте. Эта политика объясняет, какие персональные данные собираются при использовании веб-сайта и мобильного приложения ZYFF, как мы их используем и как защищаем.',
    contact: 'Если у вас есть вопросы, свяжитесь с нами:',
    sections: [
      { h: '1. Какие данные мы собираем', li: [
        'Имя и номер телефона (при регистрации и оформлении заказа);',
        'Адрес доставки и местоположение на карте (только для доставки);',
        'История заказов и товары в корзине;',
        'Если выбрана оплата через бот — ваш аккаунт Telegram (чат) и изображение чека об оплате.',
      ] },
      { h: '2. Использование данных', p: 'Собранные данные используются в следующих целях:', li: [
        'Приём, обработка и доставка заказов;',
        'Уведомление о статусе заказа по SMS и через Telegram;',
        'Поддержка и улучшение качества сервиса.',
      ] },
      { h: '3. Передача данных третьим лицам', p: 'Магазину (продавцу), у которого оформлен заказ, передаются данные, необходимые для его выполнения (имя, телефон, адрес). SMS-сообщения отправляются через оператора (Eskiz.uz), сообщения Telegram — через Telegram. Мы не продаём ваши персональные данные и не передаём их третьим лицам в рекламных целях.' },
      { h: '4. Платёжные данные', p: 'При переводе картой через бот деньги переводятся напрямую на карту продавца. Мы не храним номер вашей карты и не обрабатываем платёж сами — только передаём чек об оплате продавцу для подтверждения.' },
      { h: '5. Хранение и безопасность данных', p: 'Данные хранятся на защищённых серверах, и для их защиты принимаются необходимые технические меры. Тем не менее, 100% безопасность передачи через интернет не гарантируется.' },
      { h: '6. Ваши права', p: 'Вы можете запросить просмотр, исправление или удаление своих данных. Для этого свяжитесь с нами по контактам ниже.' },
      { h: '7. Дети', p: 'Наш сервис не предназначен для лиц младше 18 лет, и мы намеренно не собираем данные детей.' },
      { h: '8. Изменения', p: 'Эта политика может периодически обновляться. Обновлённая версия публикуется на этой странице.' },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 28 June 2026',
    lead: "ZYFF (\"we\", \"the platform\") is an online marketplace bringing Kokand's clothing stores together in one place. This policy explains what personal data is collected when you use the ZYFF website and mobile app, how we use it and how we protect it.",
    contact: 'If you have any questions, contact us:',
    sections: [
      { h: '1. Data we collect', li: [
        'Name and phone number (at registration and checkout);',
        'Delivery address and map location (for delivery only);',
        'Order history and cart items;',
        'If bot payment is chosen — your Telegram account (chat) and the payment receipt image.',
      ] },
      { h: '2. How we use data', p: 'The collected data is used for the following purposes:', li: [
        'Receiving, processing and delivering orders;',
        'Notifying you of order status via SMS and Telegram;',
        'Support and improving service quality.',
      ] },
      { h: '3. Sharing data with third parties', p: 'The store (seller) where the order is placed receives the data needed to fulfil the order (name, phone, address). SMS messages are sent via the operator (Eskiz.uz), Telegram messages via Telegram. We do not sell your personal data or share it with third parties for advertising.' },
      { h: '4. Payment data', p: "For a card transfer via the bot, money goes directly to the seller's card. We do not store your card number or process the payment ourselves — we only pass the payment receipt to the seller for confirmation." },
      { h: '5. Data storage and security', p: 'Data is stored on secure servers and necessary technical measures are taken to protect it. Nevertheless, 100% security of transmission over the internet cannot be guaranteed.' },
      { h: '6. Your rights', p: 'You may request to view, correct or delete your data. To do so, contact us using the details below.' },
      { h: '7. Children', p: 'Our service is not intended for persons under 18, and we do not knowingly collect data from children.' },
      { h: '8. Changes', p: 'This policy may be updated from time to time. The updated version will be posted on this page.' },
    ],
  },
}

export default function PrivacyScreen() {
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
