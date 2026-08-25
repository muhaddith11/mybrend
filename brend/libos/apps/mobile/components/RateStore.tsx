import { useMemo, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { Text } from './Txt'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useT, translateApiError } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'
import { invalidatePublicCaches } from '../lib/adminCache'

const STARS = [1, 2, 3, 4, 5]

/**
 * Do'kon bahosi — buyurtma yetkazilgandan keyin ko'rinadi.
 *
 * Faqat yulduzcha, matn yo'q: bir bosishda tugaydigan oqim ko'proq odam baho
 * qo'yishiga olib keladi va moderatsiya talab qilmaydi.
 *
 * Backend bir buyurtmaga BIR baho qabul qiladi (`Review.orderId` unikal), shuning
 * uchun yuborilgandan keyin komponent minnatdorchilik holatiga o'tadi.
 */
export function RateStore({ orderId }: { orderId: string }) {
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const qc = useQueryClient()
  const [selected, setSelected] = useState(0)
  const [done, setDone] = useState(false)

  const send = useMutation({
    mutationFn: (rating: number) => api.orders.review(orderId, rating),
    onSuccess: () => {
      setDone(true)
      // Buyurtma qayta o'qilganda `review` maydoni to'lgan bo'ladi (blok qayta
      // chiqmaydi), do'kon ro'yxatlarida esa yangi o'rtacha baho ko'rinadi.
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      qc.invalidateQueries({ queryKey: ['my-orders'] })
      invalidatePublicCaches(qc)
    },
    onError: (e: any) => Alert.alert('Xatolik', translateApiError(e, tr)),
  })

  if (done) {
    return (
      <View style={[styles.card, styles.thanksCard]}>
        <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
        <Text style={styles.thanks}>{tr.mRateThanks}</Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{tr.mRateStore}</Text>
      <Text style={styles.sub}>{tr.mRateStoreSub}</Text>

      <View style={styles.stars}>
        {STARS.map(n => (
          <TouchableOpacity
            key={n}
            onPress={() => setSelected(n)}
            disabled={send.isPending}
            // Yulduzchalar kichik — bosish maydonini kengaytiramiz
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel={`${n}`}
          >
            <Ionicons
              name={n <= selected ? 'star' : 'star-outline'}
              size={36}
              color={n <= selected ? colors.accent : colors.text3}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, (!selected || send.isPending) && styles.btnDisabled]}
        onPress={() => selected && send.mutate(selected)}
        disabled={!selected || send.isPending}
      >
        {send.isPending
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.btnText}>{tr.mRateSend}</Text>}
      </TouchableOpacity>
    </View>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 18,
    marginBottom: 14,
  },
  thanksCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thanks: { fontSize: 14, fontWeight: '600', color: c.text },
  title: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 4 },
  sub: { fontSize: 13, color: c.text2, lineHeight: 18, marginBottom: 16 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 },
  btn: { backgroundColor: c.brand, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: c.white, fontSize: 15, fontWeight: '600' },
})
