import { useCallback, useMemo } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from './Txt'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { useTheme, type ThemeColors } from '../store/theme'
import { Logo } from './Logo'
import { CityPicker } from './CityPicker'

export function HomeHeader() {
  const router = useRouter()
  const cartCount = useCartStore(s => s.totalCount())
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  // Bosh sahifa fokusga kelganda yangilanadi (doimiy so'rov yubormaymiz).
  const { data: unread, refetch } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.notifications.unreadCount(),
    enabled: isLoggedIn,
  })
  useFocusEffect(useCallback(() => { if (isLoggedIn) refetch() }, [isLoggedIn]))
  const unreadCount = unread?.count ?? 0

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Logo size={20} />
        <View style={styles.divider} />
        <CityPicker />
      </View>
      {isLoggedIn && (
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color={colors.brand} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 12 },
  divider: { width: 1, height: 16, backgroundColor: c.border },
  cartBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#E23B3B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: c.white, fontSize: 10, fontWeight: '700' },
})
