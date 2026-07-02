import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'

const CODE_LENGTH = 6

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const login = useAuthStore(s => s.login)

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [resending, setResending] = useState(false)

  const inputs = useRef<TextInput[]>([])

  // Qayta yuborish taymer
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setInterval(() => setResendTimer(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendTimer])

  const handleChange = (text: string, index: number) => {
    // Faqat raqam
    const digit = text.replace(/\D/g, '').slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    setError('')

    // Keyingi katakka o'tish
    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }

    // Oxirgi raqam kiritilsa — avtomatik tekshirish
    if (digit && index === CODE_LENGTH - 1) {
      const full = [...newCode.slice(0, -1), digit].join('')
      if (full.length === CODE_LENGTH) verify(full)
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    // Backspace — oldingi katakka qaytish
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const verify = async (fullCode?: string) => {
    const codeStr = fullCode ?? code.join('')
    if (codeStr.length < CODE_LENGTH) {
      setError(tr.mEnter6)
      return
    }

    setLoading(true)
    setError('')
    try {
      const { token, user } = await api.auth.verifyOtp(phone, codeStr)
      await login(token, user)
      // Muvaffaqiyatli — bosh sahifaga
      router.replace('/')
    } catch (e: any) {
      setError(e.message ?? tr.mWrongCode)
      // Kodni tozalash
      setCode(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await api.auth.sendOtp(phone)
      setResendTimer(60)
      setCode(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } catch (e: any) {
      setError(e.message ?? tr.mErrorGeneric)
    } finally {
      setResending(false)
    }
  }

  const maskedPhone = phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 *** $4 $5')

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Orqaga */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Ikon */}
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>💬</Text>
          </View>

          <Text style={styles.title}>{tr.mEnterSmsCode}</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.phoneText}>{maskedPhone}</Text>
            {'\n'}{tr.mCodeSentSuffix}
          </Text>

          {/* 6 ta katak */}
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

          {/* Tasdiqlash tugmasi */}
          <TouchableOpacity
            style={[styles.btn, (loading || code.join('').length < CODE_LENGTH) && styles.btnDisabled]}
            onPress={() => verify()}
            disabled={loading || code.join('').length < CODE_LENGTH}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{tr.mConfirm}</Text>
            )}
          </TouchableOpacity>

          {/* Qayta yuborish */}
          <View style={styles.resendRow}>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>
                {tr.mResendLabel}{' '}
                <Text style={styles.timerNum}>
                  0:{resendTimer.toString().padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color="#534AB7" />
                ) : (
                  <Text style={styles.resendBtn}>{tr.mResendCode}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ff' },
  container: { flex: 1, padding: 24 },
  backBtn: { marginTop: 8, marginBottom: 8, alignSelf: 'flex-start', padding: 4 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 80, height: 80, backgroundColor: '#EEEDFE', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  phoneText: { fontWeight: '600', color: '#1a1a1a' },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  codeBox: {
    width: 46, height: 56, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e0e0e0',
    backgroundColor: '#fff', fontSize: 22, fontWeight: '700', color: '#1a1a1a',
  },
  codeBoxFilled: { borderColor: '#534AB7', backgroundColor: '#f5f4ff' },
  codeBoxError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  errorText: { fontSize: 13, color: '#ef4444' },
  btn: { width: '100%', backgroundColor: '#534AB7', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resendRow: { marginTop: 20, alignItems: 'center' },
  resendTimer: { fontSize: 13, color: '#888' },
  timerNum: { color: '#534AB7', fontWeight: '600' },
  resendBtn: { fontSize: 14, color: '#534AB7', fontWeight: '600' },
})
