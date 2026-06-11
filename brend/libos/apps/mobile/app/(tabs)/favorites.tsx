import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sevimlilar</Text>
      </View>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={64} color="#ddd" />
        <Text style={styles.emptyTitle}>Hali sevimli do'kon yo'q</Text>
        <Text style={styles.emptyText}>Do'kon sahifasida ♡ bosing</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  emptyText: { fontSize: 13, color: '#888' },
})
