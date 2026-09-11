import { useMemo, useState, useEffect } from 'react'
import { View, TextInput, StyleSheet, FlatList } from 'react-native'
import { Text } from '../../components/Txt'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StoreCard } from '../../components/StoreCard'
import { StoreCardSkeletonList } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { CityPicker } from '../../components/CityPicker'
import { useLangStore } from '../../store/lang'
import { useCityStore } from '../../store/city'
import { useTheme, type ThemeColors, font } from '../../store/theme'
import { CITIES_WITH_STORES } from '../../lib/cities'

export default function StoresScreen() {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [search, setSearch] = useState('')
  const city = useCityStore(s => s.city)
  const cityHasStores = CITIES_WITH_STORES.has(city)
  // Har harfda tarmoq so'rovi yubormaslik uchun 300ms debounce
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-stores', debounced, city],
    queryFn: () => api.stores.list({ search: debounced, city }),
  })

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr.mAllStores}</Text>
        <CityPicker />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.text3} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { outlineStyle: 'none' } as any]}
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
            <StoreCardSkeletonList count={7} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} compact />
          ) : !cityHasStores ? (
            <View style={styles.comingSoon}>
              <Ionicons name="storefront-outline" size={32} color={colors.text3} />
              <Text style={styles.comingSoonText}>{tr.mOtherCitiesSoon}</Text>
            </View>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: c.text, flexShrink: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: c.surface2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: font.body, color: c.text },
  list: { paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: c.text2, marginTop: 40, fontSize: font.body },
  comingSoon: { alignItems: 'center', gap: 10, marginTop: 40, paddingHorizontal: 40 },
  comingSoonText: { textAlign: 'center', color: c.text2, fontSize: font.body },
})
