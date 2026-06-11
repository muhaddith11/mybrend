import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@libos/shared'
import type { Gender } from '@libos/shared'
import { SafeAreaView } from 'react-native-safe-area-context'

const TABS: { label: string; value: Gender }[] = [
  { label: 'Erkaklar', value: 'MEN' },
  { label: 'Ayollar', value: 'WOMEN' },
  { label: 'Bolalar', value: 'KIDS' },
]

export default function HomeScreen() {
  const router = useRouter()
  const [activeGender, setActiveGender] = useState<Gender>('MEN')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['stores', activeGender, search],
    queryFn: () => api.stores.list({ gender: activeGender, search }),
  })

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}><Text style={styles.logoLetter}>L</Text></View>
          <Text style={styles.logoText}>
            Li<Text style={{ color: '#534AB7' }}>bos</Text>
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <Text style={styles.iconBtn}>🛒</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Do'kon yoki mahsulot qidiring..."
          placeholderTextColor="#888780"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeGender === tab.value && styles.tabActive]}
            onPress={() => setActiveGender(tab.value)}
          >
            <Text style={[styles.tabText, activeGender === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data?.stores ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.storeCard}
            onPress={() => router.push(`/store/${item.slug}`)}
          >
            <View style={[styles.storeAvatar, { backgroundColor: item.themeBg }]}>
              <Text style={{ fontSize: 28 }}>🏪</Text>
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeAddr}>{item.address}</Text>
              <View style={styles.storeTags}>
                {item.hasDelivery && <Tag label="Yetkazish" color="#E1F5EE" textColor="#0F6E56" />}
                {item.hasPickup && <Tag label="Bron" color="#EEEDFE" textColor="#3C3489" />}
                {item.hasCashOnDoor && <Tag label="Naqd" color="#FAEEDA" textColor="#633806" />}
              </View>
            </View>
            <View style={styles.storeRight}>
              <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
              <Text style={styles.itemCount}>{item._count.products} mahsulot</Text>
              <View style={[styles.openBadge, { backgroundColor: item.isOpen ? '#EAF3DE' : '#FCEBEB' }]}>
                <Text style={{ fontSize: 10, color: item.isOpen ? '#3B6D11' : '#A32D2D' }}>
                  {item.isOpen ? 'Ochiq' : 'Yopiq'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>Yuklanmoqda...</Text>
          ) : (
            <Text style={styles.empty}>Do'konlar topilmadi</Text>
          )
        }
      />
    </SafeAreaView>
  )
}

function Tag({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={{ fontSize: 10, color: textColor }}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 34, height: 34, backgroundColor: '#3C3489', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#fff', fontSize: 16, fontWeight: '500' },
  logoText: { fontSize: 22, fontWeight: '500', color: '#1a1a1a', letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { fontSize: 22 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#F1EFE8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#2C2C2A' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7', marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#534AB7' },
  tabText: { fontSize: 14, color: '#888780', fontWeight: '500' },
  tabTextActive: { color: '#534AB7' },
  list: { padding: 12, gap: 10 },
  storeCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#D3D1C7', padding: 12, alignItems: 'center', gap: 12 },
  storeAvatar: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 2 },
  storeAddr: { fontSize: 12, color: '#888780', marginBottom: 6 },
  storeTags: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  storeRight: { alignItems: 'flex-end', gap: 2 },
  rating: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  itemCount: { fontSize: 11, color: '#888780' },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
  empty: { textAlign: 'center', color: '#888780', marginTop: 40, fontSize: 14 },
})
