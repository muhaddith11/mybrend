import { useEffect, useRef, useMemo } from 'react'
import { Animated, View, StyleSheet, type ViewStyle } from 'react-native'
import { useTheme, type ThemeColors } from '../store/theme'

// Yumshoq "pulse" skeleton. Reanimated worklet'lariga bog'liq emas — oddiy
// RN Animated bilan, har joyda ishonchli ishlaydi. Ranglar mavzu tokenlaridan
// (skeleton1/skeleton2) olinadi, shuning uchun dark rejimda ham to'g'ri.
export function Skeleton({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const { colors } = useTheme()
  const opacity = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return <Animated.View style={[{ backgroundColor: colors.skeleton1, opacity }, style]} />
}

// Bosh sahifa/do'konlar ro'yxatidagi StoreCard bilan bir o'lchamli skeleton.
export function StoreCardSkeleton() {
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <View style={styles.card}>
      <Skeleton style={styles.avatar} />
      <View style={styles.info}>
        <Skeleton style={styles.lineWide} />
        <Skeleton style={styles.lineNarrow} />
      </View>
      <View style={styles.right}>
        <Skeleton style={styles.badge} />
      </View>
    </View>
  )
}

// Bir nechta skeleton kartani ko'rsatish uchun qulay yordamchi.
export function StoreCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => <StoreCardSkeleton key={i} />)}
    </View>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: 12, borderWidth: 0.5, borderColor: c.border, padding: 12, marginHorizontal: 16, marginBottom: 10, alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 10 },
  info: { flex: 1, gap: 8 },
  lineWide: { width: '70%', height: 13, borderRadius: 6 },
  lineNarrow: { width: '45%', height: 11, borderRadius: 6 },
  right: { alignItems: 'flex-end' },
  badge: { width: 48, height: 18, borderRadius: 20 },
})
