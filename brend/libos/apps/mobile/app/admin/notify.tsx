import { useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native'
import { Text } from '../../components/Txt'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'

// Backenddagi cheklov bilan bir xil (routes/admin.ts → announceSchema).
const TITLE_MAX = 100
const BODY_MAX = 300

export default function AdminNotifyScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!token) return
    setSending(true)
    try {
      const { sent } = await adminApi.notify(token, title.trim(), body.trim())
      setTitle('')
      setBody('')
      Alert.alert("E'lon yuborildi", `${sent} ta mijozga yetkazildi.`, [
        { text: 'Yopish', onPress: () => router.back() },
      ])
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? "E'lon yuborilmadi")
    } finally {
      setSending(false)
    }
  }

  // Xabar qaytarib bo'lmaydi — yuborishdan oldin tasdiq so'raymiz.
  const confirmSend = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Xatolik', "Sarlavha va matn to'ldirilishi shart")
      return
    }
    Alert.alert(
      "E'lonni yuborasizmi?",
      "Xabar do'koningizdan buyurtma bergan va do'konni sevimliga qo'shgan barcha mijozlarga boradi. Uni qaytarib bo'lmaydi.",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Yuborish', onPress: send },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mijozlarga e'lon</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.hintText}>
            Xabar telefoniga push bo'lib boradi va ilova ichidagi bildirishnomalar
            ro'yxatida saqlanadi.
          </Text>
        </View>

        <Text style={styles.label}>Sarlavha</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Masalan: Yangi kolleksiya keldi"
          placeholderTextColor={colors.text3}
          maxLength={TITLE_MAX}
        />
        <Text style={styles.counter}>{title.length}/{TITLE_MAX}</Text>

        <Text style={styles.label}>Xabar matni</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={body}
          onChangeText={setBody}
          placeholder="Qisqa va aniq yozing — uzun matn bildirishnomada kesiladi"
          placeholderTextColor={colors.text3}
          maxLength={BODY_MAX}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>{body.length}/{BODY_MAX}</Text>

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={confirmSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <>
              <Ionicons name="megaphone-outline" size={20} color={colors.onBrand} />
              <Text style={styles.sendText}>Yuborish</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  content: { padding: 16, gap: 8 },
  hint: { flexDirection: 'row', gap: 10, backgroundColor: c.brandLight, borderRadius: 12, padding: 14, marginBottom: 8 },
  hintText: { flex: 1, fontSize: 13, color: c.text2, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600', color: c.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text, backgroundColor: c.surface },
  textarea: { minHeight: 120 },
  // Hisoblagich o'z maydoniga yopishsin (bo'limlar orasidagi bo'shliq kattaroq —
  // aks holda u qaysi maydonga tegishli ekani ko'rinmaydi).
  counter: { fontSize: 11, color: c.text3, textAlign: 'right', marginTop: -4 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.brand, borderRadius: 14, paddingVertical: 15, marginTop: 16 },
  sendText: { color: c.onBrand, fontSize: 15, fontWeight: '700' },
})
