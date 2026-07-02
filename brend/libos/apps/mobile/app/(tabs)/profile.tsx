import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useT, type Lang } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuthStore()
  const { lang, setLang } = useLangStore()
  const tr = useT(lang)

  const menuItems = [
    { icon: 'receipt-outline', label: tr.myOrders, onPress: () => router.push('/orders') },
    { icon: 'heart-outline', label: tr.mFavStores, onPress: () => router.push('/favorites') },
    { icon: 'help-circle-outline', label: tr.help, onPress: () => router.push('/help') },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr.profile}</Text>
      </View>

      {isLoggedIn && user ? (
        <>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.name ?? user.phone).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.name ?? tr.user}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
          </View>

          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon as any} size={20} color="#534AB7" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}

          {/* Sozlamalar — til */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>{tr.settings}</Text>
            <View style={styles.langRow}>
              <Ionicons name="globe-outline" size={20} color="#534AB7" />
              <Text style={styles.menuLabel}>{tr.language}</Text>
            </View>
            <View style={styles.langBtns}>
              {LANGS.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                  onPress={() => setLang(l.code)}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>{tr.logout}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountLink}
            onPress={() => router.push('/auth/delete-account')}
          >
            <Text style={styles.deleteAccountText}>{tr.mDeleteAccount}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.loginCard}>
            <Ionicons name="person-circle-outline" size={64} color="#534AB7" />
            <Text style={styles.loginTitle}>{tr.loginToProfile}</Text>
            <Text style={styles.loginText}>{tr.mLoginCardText}</Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginBtnText}>{tr.login}</Text>
            </TouchableOpacity>
          </View>

          {/* Til (kirmagan foydalanuvchi ham tanlashi mumkin) */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>{tr.settings}</Text>
            <View style={styles.langRow}>
              <Ionicons name="globe-outline" size={20} color="#534AB7" />
              <Text style={styles.menuLabel}>{tr.language}</Text>
            </View>
            <View style={styles.langBtns}>
              {LANGS.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                  onPress={() => setLang(l.code)}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {menuItems.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name={item.icon as any} size={20} color="#bbb" />
              <Text style={[styles.menuLabel, { color: '#bbb' }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#e0e0e0" />
            </TouchableOpacity>
          ))}
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 0.5, borderColor: '#eee' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEEDFE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#534AB7' },
  userName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  userPhone: { fontSize: 13, color: '#888', marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 1, borderRadius: 2 },
  menuLabel: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  settingsSection: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#eee' },
  settingsTitle: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  langBtns: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fafafa' },
  langBtnActive: { borderColor: '#534AB7', backgroundColor: '#f5f4ff' },
  langFlag: { fontSize: 16 },
  langLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  langLabelActive: { color: '#534AB7' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginTop: 24, padding: 16, backgroundColor: '#fff5f5', borderRadius: 12 },
  logoutText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },
  deleteAccountLink: { alignItems: 'center', paddingVertical: 8, marginBottom: 16 },
  deleteAccountText: { fontSize: 12, color: '#bbb', textDecorationLine: 'underline' },
  loginCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: '#eee' },
  loginTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  loginText: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  loginBtn: { marginTop: 8, backgroundColor: '#534AB7', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
