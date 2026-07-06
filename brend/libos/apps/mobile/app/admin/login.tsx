import { useMemo, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'

export default function AdminLoginScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const login = useAdminStore(s => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Login va parolni kiriting')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { token, owner } = await adminApi.login(email.trim(), password)
      await login(token, owner)
      router.replace('/admin')
    } catch (e: any) {
      setError(e.message ?? "Login yoki parol noto'g'ri")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name="storefront" size={36} color={colors.brand} />
        </View>
        <Text style={styles.title}>Do'kon egasi paneli</Text>
        <Text style={styles.subtitle}>Do'koningizni boshqarish uchun kiring</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Login (email)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => { setEmail(t); setError('') }}
            placeholder="admin@do'kon"
            placeholderTextColor={colors.text3}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Parol</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={t => { setPassword(t); setError('') }}
            placeholder="••••••••"
            placeholderTextColor={colors.text3}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirish</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 16, padding: 4 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: c.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: c.text2, textAlign: 'center', marginBottom: 28 },
  card: { backgroundColor: c.surface, borderRadius: 20, padding: 20, borderWidth: 0.5, borderColor: c.border },
  label: { fontSize: 13, fontWeight: '600', color: c.text2, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 13, fontSize: 15, color: c.text, backgroundColor: c.surface2 },
  error: { fontSize: 13, color: c.danger, marginTop: 12 },
  btn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
