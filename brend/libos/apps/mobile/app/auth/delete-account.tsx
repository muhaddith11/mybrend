import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@libos/shared'
import { useAuthStore } from '../../store/auth'

const CODE_LENGTH = 6

export default function DeleteAccountScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const [step, setStep] = useState<'warn' | 'code'>('warn')
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputs = useRef<TextInput[]>([])

  const handleSendCode = async () => {
    if (!user?.phone) return
    setLoading(true)
    setError('')
    try {
      await api.auth.sendOtp(user.phone)
      setStep('code')
    } catch (e: any) {
      setError(e.message ?? 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    setError('')

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
    if (digit && index === CODE_LENGTH - 1) {
      const full = [...newCode.slice(0, -1), digit].join('')
      if (full.length === CODE_LENGTH) confirmDelete(full)
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const confirmDelete = async (fullCode?: string) => {
    const codeStr = fullCode ?? code.join('')
    if (codeStr.length < CODE_LENGTH) {
      setError('6 ta raqam kiriting')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.auth.deleteAccount(codeStr)
      await logout()
      Alert.alert("Hisob o'chirildi", "Hisobingiz va shaxsiy ma'lumotlaringiz o'chirildi")
      router.replace('/')
    } catch (e: any) {
      setError(e.message ?? "Noto'g'ri kod")
      setCode(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>

        {step === 'warn' ? (
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <Ionicons name="warning-outline" size={36} color="#ef4444" />
            </View>

            <Text style={styles.title}>Hisobni butunlay o'chirish</Text>
            <Text style={styles.subtitle}>
              Bu amalni ortga qaytarib bo'lmaydi. Hisobni o'chirsangiz:
            </Text>

            <View style={styles.list}>
              <Text style={styles.listItem}>• Ism, telefon raqam va profil ma'lumotlaringiz o'chiriladi</Text>
              <Text style={styles.listItem}>• Savat va sevimli do'konlar ro'yxati tozalanadi</Text>
              <Text style={styles.listItem}>• Ilovaga shu telefon raqam bilan qayta ro'yxatdan o'tishingiz mumkin</Text>
              <Text style={styles.listItem}>• Buyurtmalar tarixi qonun talabiga ko'ra do'konlar hisobotida saqlanib qoladi (shaxsiy ma'lumotsiz)</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.dangerBtn, loading && styles.btnDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.dangerBtnText}>Tasdiqlash kodini yuborish</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Bekor qilish</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>💬</Text>
            </View>

            <Text style={styles.title}>SMS kodni kiriting</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.phoneText}>{user?.phone}</Text>
              {'\n'}raqamiga yuborilgan 6 ta raqamni kiriting
            </Text>

            <View style={styles.codeRow}>
              {Array(CODE_LENGTH).fill(null).map((_, i) => (
                <TextInput
                  key={i}
                  ref={ref => { if (ref) inputs.current[i] = ref }}
                  style={[
                    styles.codeBox,
                    code[i] ? styles.codeBoxFilled : null,
                    error ? styles.codeBoxError : null,
                  ]}
                  value={code[i]}
                  onChangeText={text => handleChange(text, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={i === 0}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.dangerBtn, { width: '100%' }, (loading || code.join('').length < CODE_LENGTH) && styles.btnDisabled]}
              onPress={() => confirmDelete()}
              disabled={loading || code.join('').length < CODE_LENGTH}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.dangerBtnText}>Hisobni butunlay o'chirish</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ff' },
  container: { flex: 1, padding: 24 },
  backBtn: { marginTop: 8, marginBottom: 8, alignSelf: 'flex-start', padding: 4 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 80, height: 80, backgroundColor: '#fff5f5', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  phoneText: { fontWeight: '600', color: '#1a1a1a' },
  list: { alignSelf: 'stretch', marginBottom: 24, gap: 6 },
  listItem: { fontSize: 13, color: '#666', lineHeight: 19 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  codeBox: {
    width: 46, height: 56, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e0e0e0',
    backgroundColor: '#fff', fontSize: 22, fontWeight: '700', color: '#1a1a1a',
  },
  codeBoxFilled: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  codeBoxError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  errorText: { fontSize: 13, color: '#ef4444', marginBottom: 12, textAlign: 'center' },
  dangerBtn: { backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 16, alignItems: 'center', alignSelf: 'stretch' },
  btnDisabled: { opacity: 0.5 },
  dangerBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 14, fontWeight: '500' },
})
