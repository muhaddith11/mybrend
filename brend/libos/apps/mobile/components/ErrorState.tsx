import { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'

// Tarmoq/server xatosi holati — cheksiz spinner o'rniga ko'rsatiladi.
// packages/shared'ga tegmasdan, matnlar shu yerda inline (uz/ru/en).
interface Props {
  onRetry?: () => void
  message?: string
  compact?: boolean
}

export function ErrorState({ onRetry, message, compact }: Props) {
  const lang = useLangStore(s => s.lang)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const title =
    message ??
    (lang === 'ru'
      ? 'Не удалось загрузить. Проверьте интернет.'
      : lang === 'en'
      ? 'Failed to load. Check your connection.'
      : "Ma'lumotni yuklab bo'lmadi. Internetni tekshiring.")
  const retryLabel = lang === 'ru' ? 'Повторить' : lang === 'en' ? 'Try again' : 'Qayta urinish'

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <Ionicons name="cloud-offline-outline" size={compact ? 34 : 48} color={colors.text3} />
      <Text style={styles.text}>{title}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="refresh" size={16} color={colors.white} />
          <Text style={styles.btnText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  compact: { flex: 0, paddingVertical: 48 },
  text: { fontSize: 14, color: c.text2, textAlign: 'center', lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.brand, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 },
  btnText: { color: c.white, fontSize: 14, fontWeight: '600' },
})
