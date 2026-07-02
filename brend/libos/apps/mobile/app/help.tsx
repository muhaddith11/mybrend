import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'

const CONTACTS = [
  { icon: 'call-outline' as const, label: '+998 50 250 05 50', href: 'tel:+998502500550' },
  { icon: 'mail-outline' as const, label: 'info@zyff.uz', href: 'mailto:info@zyff.uz' },
  { icon: 'paper-plane-outline' as const, label: 'Telegram: @zyff_uz', href: 'https://t.me/zyff_uz' },
  { icon: 'logo-instagram' as const, label: 'Instagram: @zyff.uz', href: 'https://instagram.com/zyff.uz' },
]

export default function HelpScreen() {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)

  const title = lang === 'ru' ? 'Чем можем помочь?' : lang === 'en' ? 'How can we help?' : 'Qanday yordam bera olamiz?'
  const text = lang === 'ru'
    ? 'Служба поддержки работает ежедневно с 9:00 до 22:00. Свяжитесь с нами одним из способов ниже:'
    : lang === 'en'
    ? 'Support is available daily from 9:00 to 22:00. Contact us in one of the ways below:'
    : "Qo'llab-quvvatlash xizmati har kuni 9:00 dan 22:00 gacha ishlaydi. Quyidagi usullardan biri orqali biz bilan bog'laning:"

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr.help}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>

        <View style={styles.list}>
          {CONTACTS.map(c => (
            <TouchableOpacity key={c.href} style={styles.item} onPress={() => Linking.openURL(c.href)}>
              <Ionicons name={c.icon} size={20} color="#534AB7" />
              <Text style={styles.itemText}>{c.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  content: { padding: 24, alignItems: 'center' },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  text: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  list: { alignSelf: 'stretch', gap: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fafafa', padding: 16, borderRadius: 10, marginBottom: 8, borderWidth: 0.5, borderColor: '#eee' },
  itemText: { flex: 1, fontSize: 14, color: '#1a1a1a' },
})
