import { useMemo } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import type { Store } from '@libos/shared'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'

export function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <TouchableOpacity style={styles.storeCard} onPress={onPress}>
      <View style={[styles.storeAvatar, { backgroundColor: store.themeBg }]}>
        {store.logo ? (
          <Image source={{ uri: store.logo }} style={styles.storeLogoImg} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>🏪</Text>
        )}
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeAddr}>{store.address}</Text>
      </View>
      <View style={styles.storeRight}>
        <Text style={styles.rating}>
          ⭐ {(store.rating ?? 0).toFixed(1)}{!!store.reviewCount && ` (${store.reviewCount})`}
        </Text>
        <Text style={styles.itemCount}>{store._count?.products ?? 0} {tr.products}</Text>
        <View style={[styles.openBadge, { backgroundColor: store.isOpen ? '#22C55E' : '#6B7280' }]}>
          <Text style={{ fontSize: 10, color: '#fff' }}>
            {store.isOpen ? tr.open : tr.closed}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Ochiq/yopiq badge web bilan bir xil semantik rang (#22C55E / #6B7280),
// shuning uchun mavzudan qat'i nazar saqlanadi.
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  storeCard: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: 12, borderWidth: 0.5, borderColor: c.border, padding: 12, marginHorizontal: 16, alignItems: 'center', gap: 12 },
  storeAvatar: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeLogoImg: { width: '100%', height: '100%' },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: '500', color: c.text, marginBottom: 2 },
  storeAddr: { fontSize: 12, color: c.text2, marginBottom: 6 },
  storeRight: { alignItems: 'flex-end', gap: 2 },
  rating: { fontSize: 13, fontWeight: '500', color: c.text },
  itemCount: { fontSize: 11, color: c.text2 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
})
