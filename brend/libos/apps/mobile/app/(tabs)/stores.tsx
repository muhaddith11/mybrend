import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StoreCard } from '../../components/StoreCard'
import { useLangStore } from '../../store/lang'

export default function StoresScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['all-stores', search],
    queryFn: () => api.stores.list({ search }),
  })

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr.mAllStores}</Text>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={tr.mSearchStoreName}
          placeholderTextColor="#888780"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={data?.stores ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <StoreCard store={item} onPress={() => router.push(`/store/${item.slug}`)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>{tr.mLoading}</Text>
          ) : (
            <Text style={styles.empty}>{tr.mStoresNotFound}</Text>
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#F1EFE8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#2C2C2A' },
  list: { paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: '#888780', marginTop: 40, fontSize: 14 },
})
