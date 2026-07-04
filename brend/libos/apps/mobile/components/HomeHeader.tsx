import { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCartStore } from '../store/cart'
import { useTheme, type ThemeColors } from '../store/theme'

export function HomeHeader() {
  const router = useRouter()
  const cartCount = useCartStore(s => s.totalCount())
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}><Text style={styles.logoLetter}>Z</Text></View>
        <Text style={styles.logoText}>
          ZY<Text style={{ color: colors.accent }}>FF</Text>
        </Text>
      </View>
      <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
        <Ionicons name="bag-outline" size={20} color={colors.brand} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 34, height: 34, backgroundColor: c.brand, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: c.white, fontSize: 16, fontWeight: '800' },
  logoText: { fontSize: 19, fontWeight: '800', color: c.text, letterSpacing: -0.3 },
  cartBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#E23B3B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: c.white, fontSize: 10, fontWeight: '700' },
})
