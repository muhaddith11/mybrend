import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '@libos/shared'

export default function LoginScreen() {
  const router = useRouter()
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
      setError('Telefon raqamni to\'liq kiriting')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.auth.sendOtp(phone)
      router.push({ pathname: '/auth/verify', params: { phone } })
    } catch (e: any) {
      setError(e.message ?? 'Xatolik yuz berdi')
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
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.logoText}>
            Li<Text style={{ color: '#534AB7' }}>bos</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Kirish</Text>
          <Text style={styles.subtitle}>
            Telefon raqamingizga SMS kod yuboramiz
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
              placeholderTextColor="#aaa"
              autoFocus
              maxLength={13}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.hint}>Masalan: +998901234567</Text>

          {/* Davom etish tugmasi */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Kod olish</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          Davom etish orqali siz{' '}
          <Text style={styles.termsLink}>foydalanish shartlari</Text>
          {' '}bilan roziliq bildirasiz
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ff' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logoArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 },
  logoMark: { width: 44, height: 44, backgroundColor: '#3C3489', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#fff', fontSize: 20, fontWeight: '600' },
  logoText: { fontSize: 28, fontWeight: '600', color: '#1a1a1a', letterSpacing: -0.5 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#534AB7', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 6, backgroundColor: '#fafafa' },
  inputError: { borderColor: '#ef4444' },
  flag: { fontSize: 22, marginRight: 10 },
  input: { flex: 1, fontSize: 18, color: '#1a1a1a', paddingVertical: 12, letterSpacing: 1 },
  errorText: { fontSize: 12, color: '#ef4444', marginBottom: 4, marginLeft: 2 },
  hint: { fontSize: 12, color: '#aaa', marginBottom: 24, marginLeft: 2 },
  btn: { backgroundColor: '#534AB7', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  terms: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 24, lineHeight: 18 },
  termsLink: { color: '#534AB7' },
})
