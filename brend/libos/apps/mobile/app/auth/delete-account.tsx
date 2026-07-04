import { useMemo, useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'

const CODE_LENGTH = 6

export default function DeleteAccountScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
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
      setError(e.message ?? tr.mErrorGeneric)
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
      setError(tr.mEnter6)
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.auth.deleteAccount(codeStr)
      await logout()
      Alert.alert(tr.mDeleteDone, tr.mDeleteDoneMsg)
      router.replace('/')
    } catch (e: any) {
      setError(e.message ?? tr.mWrongCode)
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
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {step === 'warn' ? (
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <Ionicons name="warning-outline" size={36} color={colors.danger} />
            </View>

            <Text style={styles.title}>{tr.mDeleteAccount}</Text>
            <Text style={styles.subtitle}>
              {tr.mDeleteWarnSub}
            </Text>

            <View style={styles.list}>
              <Text style={styles.listItem}>• {tr.mDelB1}</Text>
              <Text style={styles.listItem}>• {tr.mDelB2}</Text>
              <Text style={styles.listItem}>• {tr.mDelB3}</Text>
              <Text style={styles.listItem}>• {tr.mDelB4}</Text>
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
                <Text style={styles.dangerBtnText}>{tr.mSendCode}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>{tr.mCancel}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>💬</Text>
            </View>

            <Text style={styles.title}>{tr.mEnterSmsCode}</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.phoneText}>{user?.phone}</Text>
              {'\n'}{tr.mCodeSentSuffix}
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
                <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
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
                <Text style={styles.dangerBtnText}>{tr.mDeleteAccount}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { flex: 1, padding: 24 },
  backBtn: { marginTop: 8, marginBottom: 8, alignSelf: 'flex-start', padding: 4 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 80, height: 80, backgroundColor: c.surface2, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: c.text2, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  phoneText: { fontWeight: '600', color: c.text },
  list: { alignSelf: 'stretch', marginBottom: 24, gap: 6 },
  listItem: { fontSize: 13, color: c.text2, lineHeight: 19 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  codeBox: {
    width: 48, height: 58, borderRadius: 14,
    borderWidth: 1.5, borderColor: c.border,
    backgroundColor: c.surface, fontSize: 24, fontWeight: '700', color: c.text,
    textAlign: 'center', textAlignVertical: 'center', padding: 0,
  },
  codeBoxFilled: { borderColor: c.danger, backgroundColor: c.surface2 },
  codeBoxError: { borderColor: c.danger, backgroundColor: c.surface2 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  errorText: { fontSize: 13, color: c.danger, marginBottom: 12, textAlign: 'center' },
  dangerBtn: { backgroundColor: c.danger, borderRadius: 12, paddingVertical: 16, alignItems: 'center', alignSelf: 'stretch' },
  btnDisabled: { opacity: 0.5 },
  dangerBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: c.text2, fontSize: 14, fontWeight: '500' },
})
