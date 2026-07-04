import { useMemo, useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StoreCard } from '../../components/StoreCard'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'

export default function StoresScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [search, setSearch] = useState('')
  // Har harfda tarmoq so'rovi yubormaslik uchun 300ms debounce
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['all-stores', debounced],
    queryFn: () => api.stores.list({ search: debounced }),
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
          placeholderTextColor={colors.text3}
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

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: c.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: c.surface2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: c.text },
  list: { paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: c.text2, marginTop: 40, fontSize: 14 },
})
