import { useMemo, useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import type { LookbookLook } from '@libos/shared'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi, type AdminProduct } from '../../lib/adminApi'
import { uploadImage } from '../../lib/upload'
import { resolveImg } from '../../lib/links'

// Lookbook menejeri — har bir "look" = 1 rasm + shu do'kon mahsulotlaridan tuzilgan
// obraz. Xaridor look'ni bosganда u qaysi mahsulotlardan yasalganini ko'radi.
export default function AdminLookbook() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const qc = useQueryClient()

  const [looks, setLooks] = useState<LookbookLook[]>([])
  const [uploading, setUploading] = useState(false)
  const [pickerFor, setPickerFor] = useState<number | null>(null)

  const { data: store, isLoading } = useQuery({
    queryKey: ['admin-store'],
    queryFn: () => adminApi.getStore(token!),
    enabled: !!token,
  })
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getProducts(token!),
    enabled: !!token,
  })

  // Boshlang'ich: yangi lookbookLooks; agar bo'sh bo'lsa, eski lookbook rasmlaridan
  // ko'chiramiz (mahsulotsiz) — mavjud rasmlar yo'qolmasin, admin mahsulot biriktirsin.
  useEffect(() => {
    if (!store) return
    const existing = (store as any).lookbookLooks
    if (Array.isArray(existing) && existing.length > 0) {
      setLooks(existing.map((l: any) => ({ image: String(l.image ?? ''), productIds: Array.isArray(l.productIds) ? l.productIds : [] })))
    } else {
      const old = (store as any).lookbook
      setLooks(Array.isArray(old) ? old.map((uri: string) => ({ image: uri, productIds: [] })) : [])
    }
  }, [store])

  const addLook = async (from: 'camera' | 'library') => {
    const perm = from === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Ruxsat kerak', from === 'camera' ? 'Kameraga ruxsat bering' : 'Galereyaga ruxsat bering')
      return
    }
    const res = from === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ImagePicker.MediaTypeOptions.Images })
    if (res.canceled || !res.assets?.[0]) return
    setUploading(true)
    try {
      const url = await uploadImage(res.assets[0].uri, token!)
      setLooks(ls => [...ls, { image: url, productIds: [] }])
    } catch (e: any) {
      Alert.alert('Xatolik', e.message ?? "Rasmni yuklab bo'lmadi")
    } finally {
      setUploading(false)
    }
  }

  const removeLook = (i: number) => setLooks(ls => ls.filter((_, idx) => idx !== i))
  const toggleProduct = (lookIdx: number, pid: string) => {
    setLooks(ls => ls.map((l, idx) => {
      if (idx !== lookIdx) return l
      const has = l.productIds.includes(pid)
      return { ...l, productIds: has ? l.productIds.filter(x => x !== pid) : [...l.productIds, pid] }
    }))
  }

  const save = useMutation({
    mutationFn: () => adminApi.updateStore(token!, { lookbookLooks: looks.filter(l => l.image) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-store'] })
      Alert.alert('Saqlandi', 'Lookbook yangilandi')
    },
    onError: (e: any) => Alert.alert('Xatolik', e.message ?? "Saqlab bo'lmadi"),
  })

  const productById = (id: string): AdminProduct | undefined => products?.find(p => p.id === id)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lookbook (obrazlar)</Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.hint}>
            Har bir "look" — bitta rasm va shu do'kondagi 2-4 ta mahsulotdan tuzilgan obraz.
            Xaridor look'ni bosganда qaysi mahsulotlardan yasalganini ko'radi.
          </Text>

          {looks.map((look, i) => (
            <View key={i} style={styles.lookCard}>
              <Image source={{ uri: resolveImg(look.image) }} style={styles.lookImg} resizeMode="cover" />
              <View style={styles.lookBody}>
                <View style={styles.lookTop}>
                  <Text style={styles.lookTitle}>Look {i + 1}</Text>
                  <TouchableOpacity onPress={() => removeLook(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                {look.productIds.length > 0 ? (
                  <View style={styles.chosenRow}>
                    {look.productIds.map(pid => {
                      const p = productById(pid)
                      return (
                        <View key={pid} style={styles.chosenChip}>
                          <Text style={styles.chosenChipText} numberOfLines={1}>{p?.name ?? '—'}</Text>
                        </View>
                      )
                    })}
                  </View>
                ) : (
                  <Text style={styles.noProd}>Mahsulot tanlanmagan</Text>
                )}

                <TouchableOpacity style={styles.selectBtn} onPress={() => setPickerFor(i)}>
                  <Ionicons name="pricetags-outline" size={16} color={colors.brand} />
                  <Text style={styles.selectBtnText}>Mahsulot tanlash ({look.productIds.length})</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {looks.length === 0 && <Text style={styles.empty}>Hali look qo'shilmagan.</Text>}

          <View style={styles.addBtns}>
            <TouchableOpacity style={styles.addBtn} onPress={() => addLook('camera')} disabled={uploading}>
              <Ionicons name="camera-outline" size={20} color={colors.brand} />
              <Text style={styles.addBtnText}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => addLook('library')} disabled={uploading}>
              <Ionicons name="images-outline" size={20} color={colors.brand} />
              <Text style={styles.addBtnText}>Galereya</Text>
            </TouchableOpacity>
          </View>
          {uploading && (
            <View style={styles.uploadingRow}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.hint}>Yuklanmoqda…</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.saveBtn, save.isPending && { opacity: 0.6 }]} onPress={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Saqlash</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Mahsulot tanlash modali */}
      <Modal visible={pickerFor !== null} transparent animationType="slide" onRequestClose={() => setPickerFor(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerFor(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Mahsulotlarni tanlang</Text>
              <TouchableOpacity onPress={() => setPickerFor(null)}>
                <Text style={styles.modalDone}>Tayyor</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(products ?? []).map(p => {
                const selected = pickerFor !== null && looks[pickerFor]?.productIds.includes(p.id)
                return (
                  <TouchableOpacity key={p.id} style={styles.prodRow} onPress={() => pickerFor !== null && toggleProduct(pickerFor, p.id)}>
                    <View style={styles.prodImgWrap}>
                      {p.images?.[0]
                        ? <Image source={{ uri: resolveImg(p.images[0]) }} style={styles.prodImg} resizeMode="cover" />
                        : <View style={styles.prodImgPh} />}
                    </View>
                    <Text style={styles.prodName} numberOfLines={1}>{p.name}</Text>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? colors.brand : colors.text3}
                    />
                  </TouchableOpacity>
                )
              })}
              {(products ?? []).length === 0 && <Text style={styles.empty}>Do'konda mahsulot yo'q. Avval mahsulot qo'shing.</Text>}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  hint: { fontSize: 12, color: c.text3, lineHeight: 17 },
  lookCard: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: 14, borderWidth: 0.5, borderColor: c.border, overflow: 'hidden' },
  lookImg: { width: 96, height: 140, backgroundColor: c.surface2 },
  lookBody: { flex: 1, padding: 12, gap: 8, justifyContent: 'space-between' },
  lookTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lookTitle: { fontSize: 14, fontWeight: '700', color: c.text },
  chosenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chosenChip: { backgroundColor: c.surface2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 140 },
  chosenChipText: { fontSize: 12, color: c.text2 },
  noProd: { fontSize: 12, color: c.text3, fontStyle: 'italic' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  selectBtnText: { fontSize: 13, fontWeight: '600', color: c.brand },
  empty: { fontSize: 13, color: c.text3, textAlign: 'center', paddingVertical: 20 },
  addBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  addBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface },
  addBtnText: { fontSize: 14, fontWeight: '600', color: c.text },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, maxHeight: '80%' },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: c.text },
  modalDone: { fontSize: 15, fontWeight: '600', color: c.brand },
  prodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: c.border },
  prodImgWrap: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden', backgroundColor: c.surface2 },
  prodImg: { width: '100%', height: '100%' },
  prodImgPh: { width: '100%', height: '100%', backgroundColor: c.surface2 },
  prodName: { flex: 1, fontSize: 14, color: c.text },
})
