import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import type { Store } from '@libos/shared'

const { width } = Dimensions.get('window')
const BANNER_W = width - 32
const BANNER_H = 170

type Slide =
  | { kind: 'app' }
  | { kind: 'store'; store: Store; badge: string }

const GRADIENTS = ['#F59E0B', '#8B5CF6', '#10B981']

export function HeroBanner({ stores }: { stores: Store[] }) {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [active, setActive] = useState(0)

  const slides: Slide[] = [
    { kind: 'app' },
    ...(stores[0] ? [{ kind: 'store' as const, store: stores[0], badge: "🏆 Tavsiya etilgan do'kon" }] : []),
    ...(stores[1] ? [{ kind: 'store' as const, store: stores[1], badge: "⭐ Premium do'kon" }] : []),
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
                style={[styles.slide, { backgroundColor: '#1E1B4B' }]}
                onPress={() => router.push('/stores')}
              >
                <View style={styles.orbBig} />
                <View style={styles.orbSmall} />
                <Text style={styles.appBadge}>✨ ZYFF — Qo'qon</Text>
                <Text style={styles.appTitle}>
                  Barcha kiyim do'konlari{'\n'}
                  <Text style={{ color: '#FBBF24' }}>bir joyda</Text>
                </Text>
                <View style={styles.ctaBtn}>
                  <Text style={styles.ctaBtnText}>Do'konlarni ko'rish →</Text>
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
                  <Text style={styles.visitBtnText}>Hozir tashrif buyuring →</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, active === i && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 16 },
  slide: {
    width: BANNER_W, height: BANNER_H, borderRadius: 16,
    padding: 20, overflow: 'hidden', justifyContent: 'center',
  },
  bannerImg: { ...StyleSheet.absoluteFillObject, width: BANNER_W, height: BANNER_H },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  // App slide
  orbBig: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(109,40,217,0.4)', top: -40, right: 0 },
  orbSmall: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,158,11,0.3)', bottom: -10, right: 60 },
  appBadge: { color: '#fff', fontSize: 11, fontWeight: '600', marginBottom: 8, opacity: 0.9 },
  appTitle: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 14 },
  ctaBtn: { alignSelf: 'flex-start', backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  ctaBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
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
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D3D1C7' },
  dotActive: { width: 18, backgroundColor: '#534AB7' },
})
