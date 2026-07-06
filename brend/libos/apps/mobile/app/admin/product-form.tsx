import { useMemo, useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert, Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi, type ProductInput } from '../../lib/adminApi'
import { uploadImage } from '../../lib/upload'

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const PRESET_COLORS = ['Qora', 'Oq', 'Kulrang', "Ko'k", 'Qizil', 'Yashil', 'Sariq', 'Jigarrang', 'Bej', 'Pushti']

export default function ProductForm() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isEdit = !!id
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const qc = useQueryClient()

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined)
  const [sizes, setSizes] = useState<string[]>([])
  const [sizeInput, setSizeInput] = useState('')
  const [productColors, setProductColors] = useState<string[]>([])
  const [colorInput, setColorInput] = useState('')
  const [inStock, setInStock] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories(token!),
    enabled: !!token,
  })

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getProducts(token!),
    enabled: !!token && isEdit,
  })

  useEffect(() => {
    if (!isEdit || !products) return
    const p = products.find(x => x.id === id)
    if (!p) return
    setName(p.name)
    setSku((p as any).sku ?? '')
    setPrice(String(p.price))
    setOriginalPrice(p.originalPrice != null ? String(p.originalPrice) : '')
    setDescription((p as any).description ?? '')
    setImages(p.images ?? [])
    setCategorySlug((p.category as any)?.slug)
    const vSizes = [...new Set((p.variants ?? []).map(v => v.size).filter(Boolean))] as string[]
    const vColors = [...new Set((p.variants ?? []).map(v => v.color).filter(Boolean))] as string[]
    setSizes(((p as any).sizes?.length ? (p as any).sizes : vSizes) ?? [])
    setProductColors(((p as any).colors?.length ? (p as any).colors : vColors) ?? [])
    setInStock(p.inStock)
    setFeatured(!!p.featured)
    setIsNew(!!(p as any).isNew)
  }, [products, isEdit, id])

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }
  const addCustom = (arr: string[], set: (v: string[]) => void, val: string, clear: () => void) => {
    const t = val.trim()
    if (t && !arr.includes(t)) set([...arr, t])
    clear()
  }

  // Kamera yoki galereyadan rasm olib, Cloudinary'ga yuklaymiz
  const pickImage = async (from: 'camera' | 'library') => {
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
      setImages(prev => [...prev, url])
    } catch (e: any) {
      Alert.alert('Xatolik', e.message ?? "Rasmni yuklab bo'lmadi")
    } finally {
      setUploading(false)
    }
  }

  const save = useMutation({
    mutationFn: (body: ProductInput) =>
      isEdit ? adminApi.updateProduct(token!, id!, body) : adminApi.createProduct(token!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      router.back()
    },
    onError: (e: any) => Alert.alert('Xatolik', e.message ?? "Saqlab bo'lmadi"),
  })

  const handleSave = () => {
    const priceNum = parseFloat(price)
    if (!name.trim() || !priceNum) {
      Alert.alert('Xatolik', 'Nom va narx majburiy')
      return
    }
    const variants: ProductInput['variants'] = []
    if (sizes.length || productColors.length) {
      const ss = sizes.length ? sizes : [undefined]
      const cc = productColors.length ? productColors : [undefined]
      ss.forEach(s => cc.forEach(c => variants!.push({ size: s, color: c, quantity: 0 })))
    }
    save.mutate({
      name: name.trim(),
      sku: sku.trim() || undefined,
      price: priceNum,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      description: description.trim() || undefined,
      images,
      sizes,
      colors: productColors,
      categorySlug,
      inStock,
      featured,
      isNew,
      variants,
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Tahrirlash' : 'Yangi mahsulot'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Nomi *" value={name} onChange={setName} placeholder="Mahsulot nomi" c={colors} styles={styles} />
        <Field label="Mahsulot kodi (SKU)" value={sku} onChange={setSku} placeholder="Masalan: ONP-042" c={colors} styles={styles} />
        <Text style={styles.hint}>🔒 Faqat siz ko'rasiz — mijozga ko'rinmaydi. Buyurtma kelganда kod bilan chiqadi.</Text>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Narx *" value={price} onChange={setPrice} placeholder="0" keyboard="numeric" c={colors} styles={styles} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Eski narx (chegirma)" value={originalPrice} onChange={setOriginalPrice} placeholder="0" keyboard="numeric" c={colors} styles={styles} />
          </View>
        </View>
        <Field label="Tavsif" value={description} onChange={setDescription} placeholder="Mahsulot haqida" multiline c={colors} styles={styles} />

        {/* Rasmlar */}
        <Text style={styles.label}>Rasmlar</Text>
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
            {images.map((uri, idx) => (
              <View key={uri + idx} style={styles.thumb}>
                <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                <TouchableOpacity style={styles.thumbDel} onPress={() => setImages(images.filter((_, i) => i !== idx))}>
                  <Ionicons name="close" size={13} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        <View style={styles.imgBtns}>
          <TouchableOpacity style={styles.imgBtn} onPress={() => pickImage('camera')} disabled={uploading}>
            <Ionicons name="camera-outline" size={20} color={colors.brand} />
            <Text style={styles.imgBtnText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imgBtn} onPress={() => pickImage('library')} disabled={uploading}>
            <Ionicons name="images-outline" size={20} color={colors.brand} />
            <Text style={styles.imgBtnText}>Galereya</Text>
          </TouchableOpacity>
        </View>
        {uploading && (
          <View style={styles.uploadingRow}>
            <ActivityIndicator size="small" color={colors.brand} />
            <Text style={styles.hint}>Yuklanmoqda…</Text>
          </View>
        )}

        {/* Kategoriya */}
        <Text style={styles.label}>Kategoriya</Text>
        <View style={styles.chips}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, categorySlug === cat.slug && styles.chipActive]}
              onPress={() => setCategorySlug(categorySlug === cat.slug ? undefined : cat.slug)}
            >
              <Text style={[styles.chipText, categorySlug === cat.slug && styles.chipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
          {categories.length === 0 && <Text style={styles.meta}>Kategoriya topilmadi</Text>}
        </View>

        {/* O'lchamlar */}
        <Text style={styles.label}>O'lchamlar</Text>
        <View style={styles.chips}>
          {[...new Set([...PRESET_SIZES, ...sizes])].map(sz => (
            <TouchableOpacity key={sz} style={[styles.chip, sizes.includes(sz) && styles.chipActive]} onPress={() => toggle(sizes, setSizes, sz)}>
              <Text style={[styles.chipText, sizes.includes(sz) && styles.chipTextActive]}>{sz}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput style={styles.addInput} value={sizeInput} onChangeText={setSizeInput} placeholder="Boshqa o'lcham (masalan 42)" placeholderTextColor={colors.text3} />
          <TouchableOpacity style={styles.addBtn} onPress={() => addCustom(sizes, setSizes, sizeInput, () => setSizeInput(''))}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Ranglar */}
        <Text style={styles.label}>Ranglar</Text>
        <View style={styles.chips}>
          {[...new Set([...PRESET_COLORS, ...productColors])].map(cl => (
            <TouchableOpacity key={cl} style={[styles.chip, productColors.includes(cl) && styles.chipActive]} onPress={() => toggle(productColors, setProductColors, cl)}>
              <Text style={[styles.chipText, productColors.includes(cl) && styles.chipTextActive]}>{cl}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput style={styles.addInput} value={colorInput} onChangeText={setColorInput} placeholder="Boshqa rang" placeholderTextColor={colors.text3} />
          <TouchableOpacity style={styles.addBtn} onPress={() => addCustom(productColors, setProductColors, colorInput, () => setColorInput(''))}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Togglelar */}
        <View style={styles.switchCard}>
          <ToggleRow label="Mavjud (sotuvda)" value={inStock} onChange={setInStock} c={colors} styles={styles} />
          <ToggleRow label="Yangi (yangi belgisi)" value={isNew} onChange={setIsNew} c={colors} styles={styles} />
          <ToggleRow label="Tavsiya etilgan (featured)" value={featured} onChange={setFeatured} c={colors} styles={styles} last />
        </View>

        <TouchableOpacity style={[styles.saveBtn, save.isPending && { opacity: 0.6 }]} onPress={handleSave} disabled={save.isPending}>
          {save.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Saqlash' : "Qo'shish"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function ToggleRow({ label, value, onChange, c, styles, last }: { label: string; value: boolean; onChange: (v: boolean) => void; c: ThemeColors; styles: any; last?: boolean }) {
  return (
    <View style={[styles.switchRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: c.border, true: c.accent }} thumbColor={c.white} />
    </View>
  )
}

function Field({ label, value, onChange, placeholder, keyboard, multiline, c, styles }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
  keyboard?: 'default' | 'numeric'; multiline?: boolean; c: ThemeColors; styles: any
}) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.text3}
        keyboardType={keyboard === 'numeric' ? 'numeric' : 'default'}
        multiline={multiline}
      />
    </View>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  content: { padding: 16, gap: 8, paddingBottom: 48 },
  row2: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '700', color: c.text2, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 13, fontSize: 15, color: c.text, backgroundColor: c.surface },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  chipActive: { borderColor: c.accent, backgroundColor: c.accentSoft },
  chipText: { fontSize: 13, color: c.text2, fontWeight: '500' },
  chipTextActive: { color: c.accent, fontWeight: '700' },
  meta: { fontSize: 12, color: c.text2 },
  hint: { fontSize: 11, color: c.text3, marginTop: 6 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
  addInput: { flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, fontSize: 14, color: c.text, backgroundColor: c.surface },
  addBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center' },
  imgBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  imgBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface },
  imgBtnText: { fontSize: 14, fontWeight: '600', color: c.text },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  thumb: { width: 78, height: 78, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: c.surface2 },
  thumbImg: { width: '100%', height: '100%' },
  thumbDel: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  switchCard: { backgroundColor: c.surface, borderRadius: 14, borderWidth: 0.5, borderColor: c.border, paddingHorizontal: 16, marginTop: 20 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border },
  switchLabel: { fontSize: 14, color: c.text, fontWeight: '500' },
  saveBtn: { backgroundColor: c.brand, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
