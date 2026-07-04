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
  const [lbUploading, setLbUploading] = useState(false)

  // Lookbook rasmini kamera/galereyadan olib Cloudinary'ga yuklaydi va ro'yxatga qo'shadi
  const pickLookbook = async (from: 'camera' | 'library') => {
    const perm = from === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Ruxsat kerak', from === 'camera' ? 'Kameraga ruxsat bering' : 'Galereyaga ruxsat bering')
      return
    }
    const res = from === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.75 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.75, mediaTypes: ImagePicker.MediaTypeOptions.Images })
    if (res.canceled || !res.assets?.[0]) return
    setLbUploading(true)
    try {
      const url = await uploadImage(res.assets[0].uri, token!)
      setForm(f => ({ ...f, lookbook: [...(Array.isArray(f.lookbook) ? f.lookbook : []), url] }))
    } catch (e: any) {
      Alert.alert('Xatolik', e.message ?? "Rasmni yuklab bo'lmadi")
    } finally {
      setLbUploading(false)
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
        description: store.description ?? '',
        address: store.address ?? '',
        phone: store.phone ?? '',
        workingHours: store.workingHours ?? '',
        instagram: store.instagram ?? '',
        telegram: (store as any).telegram ?? '',
        lookbook: Array.isArray((store as any).lookbook) ? (store as any).lookbook : [],
        deliveryTime: store.deliveryTime != null ? String(store.deliveryTime) : '',
        cardNumber: store.cardNumber ?? '',
        cardHolder: store.cardHolder ?? '',
        isOpen: store.isOpen ?? true,
        hasDelivery: store.hasDelivery ?? true,
        hasPickup: store.hasPickup ?? true,
        hasCashOnDoor: store.hasCashOnDoor ?? true,
      })
    }
  }, [store])

  const save = useMutation({
    mutationFn: () => adminApi.updateStore(token!, {
      description: form.description || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      workingHours: form.workingHours || undefined,
      instagram: form.instagram || undefined,
      telegram: form.telegram || undefined,
      lookbook: Array.isArray(form.lookbook) ? form.lookbook : undefined,
      deliveryTime: form.deliveryTime ? parseInt(form.deliveryTime, 10) : undefined,
      cardNumber: form.cardNumber || undefined,
      cardHolder: form.cardHolder || undefined,
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

          <Text style={styles.sectionTitle}>Lookbook (tayyor obrazlar)</Text>
          <Text style={styles.lbHint}>Do'kon sahifasida chiroyli galereya sifatida ko'rinadi. Model/obraz rasmlarini yuklang.</Text>
          {Array.isArray(form.lookbook) && form.lookbook.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 8 }}>
              {form.lookbook.map((uri: string, idx: number) => (
                <View key={uri + idx} style={styles.lbThumb}>
                  <Image source={{ uri: resolveImg(uri) }} style={styles.lbThumbImg} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.lbDel}
                    onPress={() => setForm(f => ({ ...f, lookbook: (f.lookbook as string[]).filter((_, i) => i !== idx) }))}
                  >
                    <Ionicons name="close" size={13} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.lbBtns}>
            <TouchableOpacity style={styles.lbBtn} onPress={() => pickLookbook('camera')} disabled={lbUploading}>
              <Ionicons name="camera-outline" size={20} color={colors.brand} />
              <Text style={styles.lbBtnText}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.lbBtn} onPress={() => pickLookbook('library')} disabled={lbUploading}>
              <Ionicons name="images-outline" size={20} color={colors.brand} />
              <Text style={styles.lbBtnText}>Galereya</Text>
            </TouchableOpacity>
          </View>
          {lbUploading && (
            <View style={styles.lbUploading}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.lbHint}>Yuklanmoqda…</Text>
            </View>
          )}

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
  input: { borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 12, fontSize: 15, color: c.text, backgroundColor: c.surface },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: c.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: c.border },
  switchLabel: { fontSize: 14, color: c.text },
  saveBtn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  lbHint: { fontSize: 12, color: c.text3, marginTop: 4, lineHeight: 17 },
  lbThumb: { width: 96, height: 128, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: c.surface2 },
  lbThumbImg: { width: '100%', height: '100%' },
  lbDel: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  lbBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  lbBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface },
  lbBtnText: { fontSize: 14, fontWeight: '600', color: c.text },
  lbUploading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
})
