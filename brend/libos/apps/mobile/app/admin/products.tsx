import { useMemo, useState } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native'
import { Text } from '../../components/Txt'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'

export default function AdminProducts() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const qc = useQueryClient()
  const [selectedCat, setSelectedCat] = useState<string | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getProducts(token!),
    enabled: !!token,
  })

  // Kategoriyalar (mahsulotlardan) + tanlangan bo'yicha filtr
  const categories = Array.from(
    new Map(products.filter(p => p.category).map(p => [p.category!.id, p.category!])).values()
  )
  const filtered = selectedCat ? products.filter(p => p.category?.id === selectedCat) : products

  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("O'chirish", `"${name}" mahsulotini o'chirasizmi?`, [
      { text: 'Bekor', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: () => del.mutate(id) },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mahsulotlar</Text>
        <TouchableOpacity onPress={() => router.push('/admin/product-form')}>
          <Ionicons name="add-circle" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <View style={styles.catBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            <TouchableOpacity style={[styles.catChip, !selectedCat && styles.catChipActive]} onPress={() => setSelectedCat(null)}>
              <Text style={[styles.catChipText, !selectedCat && styles.catChipTextActive]}>Hammasi ({products.length})</Text>
            </TouchableOpacity>
            {categories.map(cat => {
              const cnt = products.filter(p => p.category?.id === cat.id).length
              return (
                <TouchableOpacity key={cat.id} style={[styles.catChip, selectedCat === cat.id && styles.catChipActive]} onPress={() => setSelectedCat(cat.id)}>
                  <Text style={[styles.catChipText, selectedCat === cat.id && styles.catChipTextActive]}>{cat.name} ({cnt})</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.imgWrap}>
              {item.images?.[0]
                ? <Image source={{ uri: item.images[0] }} style={styles.img} resizeMode="cover" />
                : <View style={styles.imgPlaceholder}><Ionicons name="shirt-outline" size={22} color={colors.text3} /></View>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>{item.price.toLocaleString()} so'm</Text>
              <Text style={styles.meta}>{item.inStock ? 'Mavjud' : 'Tugagan'}{item.category?.name ? ` · ${item.category.name}` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: '/admin/product-form', params: { id: item.id } })}>
              <Ionicons name="create-outline" size={20} color={colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(item.id, item.name)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? 'Yuklanmoqda…' : "Hali mahsulot yo'q. + tugmasi bilan qo'shing."}</Text>
        }
      />
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  catBar: { paddingVertical: 12, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg },
  catChipActive: { borderColor: c.accent, backgroundColor: c.accentSoft },
  catChipText: { fontSize: 13, color: c.text2, fontWeight: '500' },
  catChipTextActive: { color: c.accent, fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: c.border },
  imgWrap: { width: 54, height: 54, borderRadius: 8, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '500', color: c.text },
  price: { fontSize: 13, fontWeight: '600', color: c.brand, marginTop: 2 },
  meta: { fontSize: 11, color: c.text2, marginTop: 2 },
  actionBtn: { padding: 6 },
  empty: { textAlign: 'center', color: c.text2, marginTop: 40, fontSize: 14, paddingHorizontal: 24, lineHeight: 20 },
})
