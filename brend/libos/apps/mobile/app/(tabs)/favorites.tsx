import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth'
import { StoreCard } from '../../components/StoreCard'

export default function FavoritesScreen() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.stores.favorites(),
    enabled: isLoggedIn,
  })

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sevimlilar</Text>
      </View>

      {!isLoggedIn ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color="#ddd" />
          <Text style={styles.emptyTitle}>Tizimga kiring</Text>
          <Text style={styles.emptyText}>Sevimli do'konlaringizni ko'rish uchun kiring</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Kirish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data?.stores ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <StoreCard store={item} onPress={() => router.push(`/store/${item.slug}`)} />
          )}
          ListEmptyComponent={
            isLoading ? (
              <Text style={styles.emptyText}>Yuklanmoqda...</Text>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="heart-outline" size={64} color="#ddd" />
                <Text style={styles.emptyTitle}>Hali sevimli do'kon yo'q</Text>
                <Text style={styles.emptyText}>Do'kon sahifasida ♡ bosing</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', paddingHorizontal: 32 },
  loginBtn: { marginTop: 8, backgroundColor: '#534AB7', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  list: { paddingVertical: 16, gap: 10 },
})
