import { useMemo, useState, useRef, useEffect } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { Text } from '../../components/Txt'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'

const CODE_LENGTH = 6

export default function VerifyScreen() {
  const { phone, name } = useLocalSearchParams<{ phone: string; name?: string }>()
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const login = useAuthStore(s => s.login)
  const setUser = useAuthStore(s => s.setUser)

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [resending, setResending] = useState(false)

  const inputs = useRef<TextInput[]>([])

  // Qayta yuborish taymer — bitta interval (0 ga yetganda to'xtaydi, qayta
  // yuborilganda resendTimer 60 ga qaytarilib yana sanaydi)
  useEffect(() => {
    const t = setInterval(() => setResendTimer(s => (s <= 0 ? 0 : s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

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
      // Yangi foydalanuvchi kirishda ism kiritgan bo'lsa — profilga saqlaymiz.
      // (Mavjud ismni ustiga yozmaymiz; o'zgartirish profil sahifasida.)
      const trimmed = (name ?? '').trim()
      if (trimmed && !user.name) {
        try {
          const updated = await api.auth.updateProfile({ name: trimmed })
          setUser(updated)
        } catch {
          // ism saqlanmasa ham kirishga xalaqit bermaymiz — keyin profildan tahrirlaydi
        }
      }
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

  const maskedPhone = (phone ?? '').replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 *** $4 $5')

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Orqaga */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Ikon */}
          <View style={styles.iconWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={34} color={colors.accent} />
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
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
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
                  <ActivityIndicator size="small" color={colors.brand} />
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { flex: 1, padding: 24 },
  backBtn: { marginTop: 8, marginBottom: 8, alignSelf: 'flex-start', padding: 4 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 80, height: 80, backgroundColor: c.accentSoft, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 10 },
  subtitle: { fontSize: 14, color: c.text2, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  phoneText: { fontWeight: '600', color: c.text },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  codeBox: {
    width: 48, height: 58, borderRadius: 14,
    borderWidth: 1.5, borderColor: c.border,
    backgroundColor: c.surface, fontSize: 24, fontWeight: '700', color: c.text,
    textAlign: 'center', textAlignVertical: 'center', padding: 0,
  },
  codeBoxFilled: { borderColor: c.accent, backgroundColor: c.accentSoft },
  codeBoxError: { borderColor: c.danger, backgroundColor: c.surface2 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  errorText: { fontSize: 13, color: c.danger },
  btn: { width: '100%', backgroundColor: c.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: c.white, fontSize: 16, fontWeight: '600' },
  resendRow: { marginTop: 20, alignItems: 'center' },
  resendTimer: { fontSize: 13, color: c.text2 },
  timerNum: { color: c.brand, fontWeight: '600' },
  resendBtn: { fontSize: 14, color: c.brand, fontWeight: '600' },
})
