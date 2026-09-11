import { useMemo, useState } from 'react'
import { View, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from './Txt'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useCityStore } from '../store/city'
import { useTheme, type ThemeColors } from '../store/theme'
import { CITIES, CITIES_WITH_STORES, cityLabel, findCity } from '../lib/cities'

export function CityPicker() {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const { city, setCity } = useCityStore()
  const [open, setOpen] = useState(false)

  const current = findCity(city) ?? CITIES[0]

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.75}>
        <Ionicons name="location" size={14} color={colors.accent} />
        <Text style={styles.triggerText} numberOfLines={1}>{cityLabel(current, lang)}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.text2} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.head}>
              <Text style={styles.title}>{tr.mCity}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.text3} />
              </TouchableOpacity>
            </View>

            {CITIES.map(c => {
              const hasStores = CITIES_WITH_STORES.has(c.key)
              const selected = c.key === current.key
              return (
                <TouchableOpacity
                  key={c.key}
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => { setCity(c.key); setOpen(false) }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowText, selected && styles.rowTextActive]}>{cityLabel(c, lang)}</Text>
                    {!hasStores && <Text style={styles.soon}>{tr.mOtherCitiesSoon}</Text>}
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                </TouchableOpacity>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 150 },
  triggerText: { fontSize: 13, fontWeight: '600', color: c.text },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: c.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: c.border, gap: 10 },
  rowText: { fontSize: 15, color: c.text, fontWeight: '500' },
  rowTextActive: { color: c.brand, fontWeight: '700' },
  soon: { fontSize: 11, color: c.text3, marginTop: 2 },
})
