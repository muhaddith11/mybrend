import { useMemo } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Text } from '../../components/Txt'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import type { Notification } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useAuthStore } from '../../store/auth'
import { formatDate } from '../../lib/date'
import { useTheme, type ThemeColors } from '../../store/theme'
import { ErrorState } from '../../components/ErrorState'

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  ORDER_STATUS: 'receipt-outline',
  STORE_ANNOUNCEMENT: 'megaphone-outline',
}

export default function NotificationsScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
    enabled: isLoggedIn,
  })
  const notifications = data?.notifications ?? []
  const hasUnread = notifications.some(n => !n.read)

  // O'qilgan qilingach ro'yxat ham, qo'ng'iroqchadagi son ham yangilanadi.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
  }

  const markAllRead = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: invalidate,
  })

  const openNotification = (n: Notification) => {
    // O'qilgan belgisi fonda ketadi — o'tishni kutib turmaymiz.
    if (!n.read) api.notifications.markRead(n.id).then(invalidate).catch(() => {})
    if (n.data?.orderId) router.push(`/orders/${n.data.orderId}`)
    else if (n.data?.storeSlug) router.push(`/store/${n.data.storeSlug}`)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr.ntTitle}</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <Ionicons name="checkmark-done-outline" size={22} color={colors.brand} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        refreshControl={
          isLoggedIn ? (
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand} />
          ) : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => openNotification(item)}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={TYPE_ICON[item.type] ?? 'notifications-outline'}
                size={18}
                color={colors.brand}
              />
            </View>
            <View style={styles.body}>
              <View style={styles.cardTop}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                {!item.read && <View style={styles.dot} />}
              </View>
              <Text style={styles.text} numberOfLines={3}>{item.body}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoggedIn ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={56} color={colors.border} />
              <Text style={styles.emptyText}>{tr.ntLoginView}</Text>
            </View>
          ) : isLoading ? null : isError ? (
            <ErrorState onRetry={() => refetch()} compact />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={56} color={colors.border} />
              <Text style={styles.emptyText}>{tr.ntEmpty}</Text>
              <Text style={styles.emptyHint}>{tr.ntEmptyHint}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  list: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: c.surface, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: c.border },
  cardUnread: { borderColor: c.brand },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.brandLight },
  body: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '600', color: c.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.brand },
  text: { fontSize: 13, color: c.text2, lineHeight: 18 },
  date: { fontSize: 12, color: c.text3 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12, paddingHorizontal: 32 },
  emptyText: { fontSize: 15, color: c.text3 },
  emptyHint: { fontSize: 13, color: c.text3, textAlign: 'center', opacity: 0.8 },
})
