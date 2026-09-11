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
import { getStoreDesign } from '../lib/storeDesigns'

export function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  // Bazadagi logo ustun; bo'lmasa maxsus dizaynli do'konning bundled logotipi.
  const logo = store.logo
    ? { uri: resolveImg(store.logo) }
    : getStoreDesign(store.slug)?.assets?.logo
  const ring = store.themeColor || colors.brand

  return (
    <PressableScale style={styles.storeCard} onPress={onPress}>
      <View style={[styles.storeAvatar, { backgroundColor: store.themeBg, borderColor: ring }]}>
        {logo ? (
          <Image source={logo} style={styles.storeLogoImg} resizeMode="cover" />
        ) : (
          <Ionicons name="storefront" size={22} color={ring} />
        )}
        <View style={[styles.statusDot, { backgroundColor: store.isOpen ? '#22C55E' : '#9CA3AF' }]} />
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
        <View style={styles.addrRow}>
          <Ionicons name="location-sharp" size={11} color={colors.text3} />
          <Text style={styles.storeAddr} numberOfLines={1}>{store.address}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingPill}>
            {store.reviewCount ? (
              <>
                <Ionicons name="star" size={11} color="#E3A008" />
                <Text style={styles.ratingText}>{(store.rating ?? 0).toFixed(1)}</Text>
              </>
            ) : (
              <Text style={styles.newText}>{lang === 'ru' ? 'Новый' : lang === 'en' ? 'New' : 'Yangi'}</Text>
            )}
          </View>
          <Text style={styles.dotSep}>·</Text>
          <Text style={styles.itemCount}>{store._count?.products ?? 0} {tr.products}</Text>
          {store.hasDelivery && !!store.deliveryTime && (
            <>
              <Text style={styles.dotSep}>·</Text>
              <View style={styles.deliveryRow}>
                <Ionicons name="bicycle-outline" size={12} color={colors.text2} />
                <Text style={styles.itemCount}>{store.deliveryTime} {tr.mMinutes}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View
        style={[
          styles.openBadge,
          { backgroundColor: store.isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)' },
        ]}
      >
        <View style={[styles.openDot, { backgroundColor: store.isOpen ? '#22C55E' : '#6B7280' }]} />
        <Text style={[styles.openText, { color: store.isOpen ? '#16A34A' : '#6B7280' }]}>
          {store.isOpen ? tr.open : tr.closed}
        </Text>
      </View>
    </PressableScale>
  )
}

// Ochiq/yopiq rang web bilan bir xil semantik (#22C55E / #6B7280), shuning
// uchun mavzudan qat'i nazar saqlanadi.
const makeStyles = (c: ThemeColors) => StyleSheet.create({
  storeCard: {
    flexDirection: 'row', backgroundColor: c.surface, borderRadius: radius.xl,
    padding: space.md, marginHorizontal: space.lg, alignItems: 'center', gap: space.md,
    shadowColor: c.brand, shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  storeAvatar: {
    width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 1.5,
  },
  storeLogoImg: { width: '100%', height: '100%' },
  statusDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: c.surface },
  storeInfo: { flex: 1, gap: 3 },
  storeName: { fontSize: font.body, fontWeight: '700', color: c.text },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  storeAddr: { fontSize: font.caption, color: c.text2, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: font.caption, fontWeight: '700', color: c.text },
  newText: { fontSize: font.caption, fontWeight: '700', color: c.accent },
  dotSep: { fontSize: font.caption, color: c.text3 },
  itemCount: { fontSize: font.caption, color: c.text2 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  openDot: { width: 5, height: 5, borderRadius: 2.5 },
  openText: { fontSize: 10, fontWeight: '700' },
})
