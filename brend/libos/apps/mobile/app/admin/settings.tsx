import { useMemo, useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'
import { uploadImage } from '../../lib/upload'
import { resolveImg } from '../../lib/links'

export default function AdminSettings() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const qc = useQueryClient()

  const [form, setForm] = useState<Record<string, any>>({})
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // Do'kon rasmini (logo yoki banner) kamera/galereyadan olib Cloudinary'ga yuklaydi.
  const pickImage = async (field: 'logo' | 'banner', from: 'camera' | 'library') => {
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
    setUploadingField(field)
    try {
      const url = await uploadImage(res.assets[0].uri, token!)
      set(field, url)
    } catch (e: any) {
      Alert.alert('Xatolik', e.message ?? "Rasmni yuklab bo'lmadi")
    } finally {
      setUploadingField(null)
    }
  }

  const { data: store, isLoading } = useQuery({
    queryKey: ['admin-store'],
    queryFn: () => adminApi.getStore(token!),
    enabled: !!token,
  })

  useEffect(() => {
    if (store) {
      setForm({
        logo: store.logo ?? '',
        banner: (store as any).banner ?? '',
        description: store.description ?? '',
        address: store.address ?? '',
        phone: store.phone ?? '',
        workingHours: store.workingHours ?? '',
        instagram: store.instagram ?? '',
        telegram: (store as any).telegram ?? '',
        deliveryTime: store.deliveryTime != null ? String(store.deliveryTime) : '',
        cardNumber: store.cardNumber ?? '',
        cardHolder: store.cardHolder ?? '',
        telegramChatId: (store as any).telegramChatId ?? '',
        isOpen: store.isOpen ?? true,
        hasDelivery: store.hasDelivery ?? true,
        hasPickup: store.hasPickup ?? true,
        hasCashOnDoor: store.hasCashOnDoor ?? true,
      })
    }
  }, [store])

  const save = useMutation({
    mutationFn: () => adminApi.updateStore(token!, {
      logo: form.logo || undefined,
      banner: form.banner || undefined,
      description: form.description || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      workingHours: form.workingHours || undefined,
      instagram: form.instagram || undefined,
      telegram: form.telegram || undefined,
      deliveryTime: form.deliveryTime ? parseInt(form.deliveryTime, 10) : undefined,
      cardNumber: form.cardNumber || undefined,
      cardHolder: form.cardHolder || undefined,
      telegramChatId: form.telegramChatId || undefined,
      isOpen: form.isOpen,
      hasDelivery: form.hasDelivery,
      hasPickup: form.hasPickup,
      hasCashOnDoor: form.hasCashOnDoor,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-store'] })
      Alert.alert('Saqlandi', "Do'kon sozlamalari yangilandi")
    },
    onError: (e: any) => Alert.alert('Xatolik', e.message ?? "Saqlab bo'lmadi"),
  })

  // DIQQAT: bu funksiyalar JSX ichida <F/> emas, {F(...)} sifatida chaqiriladi —
  // aks holda render ichida yangi komponent turi yaratilib, TextInput har bosishda
  // fokusni yo'qotardi.
  const F = (label: string, k: string, opts?: { keyboard?: 'numeric'; multiline?: boolean }) => (
    <View style={{ marginBottom: 4 }} key={k}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, opts?.multiline && styles.inputMultiline]}
        value={form[k] ?? ''}
        onChangeText={v => set(k, v)}
        placeholderTextColor={colors.text3}
        keyboardType={opts?.keyboard === 'numeric' ? 'numeric' : 'default'}
        multiline={opts?.multiline}
      />
    </View>
  )

  const T = (label: string, k: string) => (
    <View style={styles.switchRow} key={k}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={!!form[k]} onValueChange={v => set(k, v)} trackColor={{ false: colors.border, true: colors.brand }} thumbColor={colors.white} />
    </View>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Do'kon sozlamalari</Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Do'kon rasmlari — logo (ro'yxatdagi rasm) + banner (do'kon sahifasi shapkasi) */}
          <Text style={styles.sectionTitle}>Do'kon rasmi</Text>
          <View style={styles.imgRow}>
            <View style={styles.imgCol}>
              <Text style={styles.imgColLabel}>Logo (ro'yxatda ko'rinadi)</Text>
              <View style={styles.logoPreview}>
                {form.logo
                  ? <Image source={{ uri: resolveImg(form.logo) }} style={styles.imgFill} resizeMode="cover" />
                  : <Ionicons name="storefront-outline" size={28} color={colors.text3} />}
                {uploadingField === 'logo' && <View style={styles.imgLoading}><ActivityIndicator color="#fff" /></View>}
              </View>
              <View style={styles.imgBtns}>
                <TouchableOpacity style={styles.imgBtn} onPress={() => pickImage('logo', 'camera')} disabled={!!uploadingField}>
                  <Ionicons name="camera-outline" size={18} color={colors.brand} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.imgBtn} onPress={() => pickImage('logo', 'library')} disabled={!!uploadingField}>
                  <Ionicons name="images-outline" size={18} color={colors.brand} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.imgColLabel}>Banner (do'kon sahifasi shapkasi)</Text>
          <View style={styles.bannerPreview}>
            {form.banner
              ? <Image source={{ uri: resolveImg(form.banner) }} style={styles.imgFill} resizeMode="cover" />
              : <Ionicons name="image-outline" size={28} color={colors.text3} />}
            {uploadingField === 'banner' && <View style={styles.imgLoading}><ActivityIndicator color="#fff" /></View>}
          </View>
          <View style={styles.imgBtns}>
            <TouchableOpacity style={[styles.imgBtn, styles.imgBtnWide]} onPress={() => pickImage('banner', 'camera')} disabled={!!uploadingField}>
              <Ionicons name="camera-outline" size={18} color={colors.brand} />
              <Text style={styles.imgBtnText}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.imgBtn, styles.imgBtnWide]} onPress={() => pickImage('banner', 'library')} disabled={!!uploadingField}>
              <Ionicons name="images-outline" size={18} color={colors.brand} />
              <Text style={styles.imgBtnText}>Galereya</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Ma'lumot</Text>
          {F('Manzil', 'address')}
          {F('Telefon', 'phone')}
          {F('Ish vaqti', 'workingHours')}
          {F('Instagram (username yoki havola)', 'instagram')}
          {F('Telegram (username yoki havola)', 'telegram')}
          {F('Yetkazish vaqti (daqiqa)', 'deliveryTime', { keyboard: 'numeric' })}
          {F('Tavsif', 'description', { multiline: true })}

          <Text style={styles.sectionTitle}>To'lov (bot orqali o'tkazma)</Text>
          {F('Karta raqami', 'cardNumber', { keyboard: 'numeric' })}
          {F('Karta egasi', 'cardHolder')}
          {F('Telegram ID (bot xabarlari)', 'telegramChatId', { keyboard: 'numeric' })}
          <Text style={styles.hint}>
            🤖 Buyurtma va karta to'lovi tasdig'i xabarlari shu Telegram ID'ga keladi.
            ID'ni olish: do'kon botini oching → «/start» yuboring → bot sizning ID'ingizni
            qaytaradi → shu yerga kiriting.
          </Text>

          <Text style={styles.sectionTitle}>Xizmatlar</Text>
          {T("Do'kon ochiq", 'isOpen')}
          {T('Yetkazib berish', 'hasDelivery')}
          {T('Olib ketish', 'hasPickup')}
          {T('Eshik oldida naqd', 'hasCashOnDoor')}

          <TouchableOpacity style={[styles.saveBtn, save.isPending && { opacity: 0.6 }]} onPress={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Saqlash</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: c.text2, marginBottom: 6, marginTop: 8 },
  hint: { fontSize: 12, color: c.text3, lineHeight: 17, marginTop: 6, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 12, fontSize: 15, color: c.text, backgroundColor: c.surface },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: c.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: c.border },
  switchLabel: { fontSize: 14, color: c.text },
  saveBtn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  imgRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  imgCol: { alignItems: 'flex-start' },
  imgColLabel: { fontSize: 12, color: c.text3, marginTop: 12, marginBottom: 6 },
  logoPreview: { width: 88, height: 88, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bannerPreview: { width: '100%', height: 120, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imgFill: { width: '100%', height: '100%' },
  imgLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  imgBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  imgBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface },
  imgBtnWide: { flex: 1 },
  imgBtnText: { fontSize: 13, fontWeight: '600', color: c.text },
})
