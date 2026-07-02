import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCartStore } from '../store/cart'

export function HomeHeader() {
  const router = useRouter()
  const cartCount = useCartStore(s => s.totalCount())

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}><Text style={styles.logoLetter}>Z</Text></View>
        <Text style={styles.logoText}>
          ZY<Text style={{ color: '#534AB7' }}>FF</Text>
        </Text>
      </View>
      <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
        <Ionicons name="bag-outline" size={24} color="#1a1a1a" />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 34, height: 34, backgroundColor: '#3C3489', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#fff', fontSize: 16, fontWeight: '500' },
  logoText: { fontSize: 22, fontWeight: '500', color: '#1a1a1a', letterSpacing: -0.5 },
  cartBtn: { padding: 4, position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#534AB7', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
})
