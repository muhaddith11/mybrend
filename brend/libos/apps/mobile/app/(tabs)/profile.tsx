import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth'

export default function ProfileScreen() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuthStore()

  const menuItems = [
    { icon: 'receipt-outline', label: 'Buyurtmalarim', onPress: () => router.push('/orders') },
    { icon: 'heart-outline', label: "Sevimli do'konlar", onPress: () => {} },
    { icon: 'location-outline', label: 'Manzillarim', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Yordam', onPress: () => {} },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {isLoggedIn && user ? (
        /* Kirgan foydalanuvchi */
        <>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.name ?? user.phone).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.name ?? 'Foydalanuvchi'}</Text>
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

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Chiqish</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* Kirmagan foydalanuvchi */
        <>
          <View style={styles.loginCard}>
            <Ionicons name="person-circle-outline" size={64} color="#534AB7" />
            <Text style={styles.loginTitle}>Tizimga kiring</Text>
            <Text style={styles.loginText}>
              Buyurtmalaringizni kuzating va sevimli do'konlarni saqlang
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginBtnText}>Kirish</Text>
            </TouchableOpacity>
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
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginTop: 24, padding: 16, backgroundColor: '#fff5f5', borderRadius: 12 },
  logoutText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },
  loginCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: '#eee' },
  loginTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  loginText: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  loginBtn: { marginTop: 8, backgroundColor: '#534AB7', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
