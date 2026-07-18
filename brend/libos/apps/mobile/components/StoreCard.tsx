import { useMemo } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Text } from './Txt'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from './PressableScale'
import type { Store } from '@libos/shared'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors, space, radius, font } from '../store/theme'
import { resolveImg } from '../lib/links'

export function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <PressableScale style={styles.storeCard} onPress={onPress}>
      <View style={[styles.storeAvatar, { backgroundColor: store.themeBg }]}>
        {store.logo ? (
          <Image source={{ uri: resolveImg(store.logo) }} style={styles.storeLogoImg} resizeMode="cover" />
        ) : (
          <Ionicons name="storefront" size={24} color={colors.brand} />
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
    </PressableScale>
  )
}

// Ochiq/yopiq badge web bilan bir xil semantik rang (#22C55E / #6B7280),
// shuning uchun mavzudan qat'i nazar saqlanadi.
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  storeCard: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 0.5, borderColor: c.border, padding: space.md, marginHorizontal: space.lg, alignItems: 'center', gap: space.md },
  storeAvatar: { width: 52, height: 52, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeLogoImg: { width: '100%', height: '100%' },
  storeInfo: { flex: 1 },
  storeName: { fontSize: font.body, fontWeight: '500', color: c.text, marginBottom: 2 },
  storeAddr: { fontSize: font.small, color: c.text2, marginBottom: 6 },
  storeRight: { alignItems: 'flex-end', gap: 2 },
  rating: { fontSize: 13, fontWeight: '500', color: c.text },
  itemCount: { fontSize: font.caption, color: c.text2 },
  openBadge: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
})
