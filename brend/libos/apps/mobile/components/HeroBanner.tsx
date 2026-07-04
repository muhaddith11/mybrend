import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import type { Store } from '@libos/shared'
import { useT } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useTheme } from '../store/theme'

const { width } = Dimensions.get('window')
const BANNER_W = width - 32
const BANNER_H = 170

type Slide =
  | { kind: 'app' }
  | { kind: 'store'; store: Store; badge: string }

const GRADIENTS = ['#F59E0B', '#8B5CF6', '#10B981']

export function HeroBanner({ stores }: { stores: Store[] }) {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const [active, setActive] = useState(0)

  const slides: Slide[] = [
    { kind: 'app' },
    ...(stores[0] ? [{ kind: 'store' as const, store: stores[0], badge: tr.mBadgeRecommended }] : []),
    ...(stores[1] ? [{ kind: 'store' as const, store: stores[1], badge: tr.mBadgePremium }] : []),
  ]

  // Avtomatik aylanish
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % slides.length
        scrollRef.current?.scrollTo({ x: next * BANNER_W, animated: true })
        return next
      })
    }, 3500)
    return () => clearInterval(t)
  }, [slides.length])

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W)
    if (idx !== active) setActive(idx)
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        snapToInterval={BANNER_W}
        decelerationRate="fast"
      >
        {slides.map((slide, i) => {
          if (slide.kind === 'app') {
            return (
              <TouchableOpacity
                key="app"
                activeOpacity={0.9}
                style={styles.slide}
                onPress={() => router.push('/stores')}
              >
                <LinearGradient
                  colors={['#1B1F4B', '#2E2A6B', '#3B2A6B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.orbBig} />
                <View style={styles.orbSmall} />
                <Text style={styles.appBadge}>✨ ZYFF — Qo'qon</Text>
                <Text style={styles.appTitle}>
                  {tr.heroAppL1} {tr.heroAppHL}{'\n'}
                  <Text style={{ color: '#F5C453' }}>{tr.heroAppL3}</Text>
                </Text>
                <View style={styles.ctaBtn}>
                  <Text style={styles.ctaBtnText}>{tr.heroAppCta}</Text>
                </View>
                <Text style={styles.bgLetter}>Z</Text>
              </TouchableOpacity>
            )
          }
          const bg = slide.store.banner ? '#000' : GRADIENTS[i % GRADIENTS.length]
          return (
            <TouchableOpacity
              key={slide.store.id}
              activeOpacity={0.9}
              style={[styles.slide, { backgroundColor: bg }]}
              onPress={() => router.push(`/store/${slide.store.slug}`)}
            >
              {slide.store.banner ? (
                <Image source={{ uri: slide.store.banner }} style={styles.bannerImg} resizeMode="cover" />
              ) : (
                <Text style={styles.storeInitial}>{slide.store.name.charAt(0)}</Text>
              )}
              <View style={styles.overlay} />
              <View style={styles.storeContent}>
                <Text style={styles.storeBadge}>{slide.badge}</Text>
                <Text style={styles.storeTitle}>{slide.store.name}</Text>
                {!!slide.store.address && (
                  <Text style={styles.storeAddr} numberOfLines={1}>📍 {slide.store.address}</Text>
                )}
                <View style={styles.visitBtn}>
                  <Text style={styles.visitBtnText}>{tr.mVisitNow}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: colors.border },
                active === i && { width: 18, backgroundColor: colors.accent },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 16 },
  slide: {
    width: BANNER_W, height: BANNER_H, borderRadius: 24,
    padding: 22, overflow: 'hidden', justifyContent: 'center',
  },
  bannerImg: { ...StyleSheet.absoluteFillObject, width: BANNER_W, height: BANNER_H },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  // App slide (premium navy & gold)
  orbBig: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(227,160,8,0.16)', top: -30, right: -20 },
  orbSmall: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, right: 40 },
  appBadge: { color: '#F5C453', fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 0.3 },
  appTitle: { color: '#fff', fontSize: 23, fontWeight: '800', lineHeight: 30, marginBottom: 16, letterSpacing: -0.3 },
  ctaBtn: { alignSelf: 'flex-start', backgroundColor: '#E3A008', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 11 },
  ctaBtnText: { color: '#1B1F4B', fontSize: 13, fontWeight: '700' },
  bgLetter: { position: 'absolute', right: -10, bottom: -40, fontSize: 180, fontWeight: '800', color: 'rgba(255,255,255,0.04)' },
  // Store slide
  storeInitial: { position: 'absolute', right: 10, top: 10, fontSize: 130, fontWeight: '800', color: 'rgba(255,255,255,0.15)' },
  storeContent: { position: 'relative', zIndex: 2 },
  storeBadge: { color: '#fff', fontSize: 11, fontWeight: '600', marginBottom: 8 },
  storeTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  storeAddr: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginBottom: 12 },
  visitBtn: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  visitBtnText: { color: '#1E1B4B', fontSize: 13, fontWeight: '600' },
  // Dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
})
