import { useMemo, useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Switch, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme, type ThemeColors } from '../../store/theme'
import { useAdminStore } from '../../store/admin'
import { adminApi } from '../../lib/adminApi'

export default function AdminSettings() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const token = useAdminStore(s => s.token)
  const qc = useQueryClient()

  const [form, setForm] = useState<Record<string, any>>({})
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

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
})
