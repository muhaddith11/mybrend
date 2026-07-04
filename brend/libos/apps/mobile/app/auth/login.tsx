import { useMemo, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api, useT } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'

export default function LoginScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [phone, setPhone] = useState('+998')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (text: string) => {
    // Faqat + va raqamlarga ruxsat
    let cleaned = text.replace(/[^\d+]/g, '')
    if (!cleaned.startsWith('+')) cleaned = '+' + cleaned
    if (cleaned.length > 13) cleaned = cleaned.slice(0, 13)
    setPhone(cleaned)
    setError('')
  }

  const handleSend = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 12) {
      setError(tr.mPhoneIncomplete)
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.auth.sendOtp(phone)
      router.push({ pathname: '/auth/verify', params: { phone } })
    } catch (e: any) {
      setError(e.message ?? tr.mErrorGeneric)
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
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>Z</Text>
          </View>
          <Text style={styles.logoText}>
            ZY<Text style={{ color: colors.brand }}>FF</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{tr.login}</Text>
          <Text style={styles.subtitle}>
            {tr.mLoginSub}
          </Text>

          {/* Telefon input */}
          <View style={[styles.inputWrap, error ? styles.inputError : null]}>
            <Text style={styles.flag}>🇺🇿</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={formatPhone}
              keyboardType="phone-pad"
              placeholder="+998 90 123 45 67"
              placeholderTextColor={colors.text3}
              autoFocus
              maxLength={13}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.hint}>{tr.mPhoneExample}</Text>

          {/* Davom etish tugmasi */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{tr.mGetCode}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>{tr.mTerms}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logoArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 },
  logoMark: { width: 44, height: 44, backgroundColor: c.brandDark, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: c.white, fontSize: 20, fontWeight: '600' },
  logoText: { fontSize: 28, fontWeight: '600', color: c.text, letterSpacing: -0.5 },
  card: { backgroundColor: c.surface, borderRadius: 20, padding: 24, shadowColor: c.brand, shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: c.text2, marginBottom: 24, lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 6, backgroundColor: c.surface2 },
  inputError: { borderColor: c.danger },
  flag: { fontSize: 22, marginRight: 10 },
  input: { flex: 1, fontSize: 18, color: c.text, paddingVertical: 12, letterSpacing: 1 },
  errorText: { fontSize: 12, color: c.danger, marginBottom: 4, marginLeft: 2 },
  hint: { fontSize: 12, color: c.text3, marginBottom: 24, marginLeft: 2 },
  btn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: c.white, fontSize: 16, fontWeight: '600' },
  terms: { textAlign: 'center', fontSize: 12, color: c.text3, marginTop: 24, lineHeight: 18 },
  termsLink: { color: c.brand },
})
