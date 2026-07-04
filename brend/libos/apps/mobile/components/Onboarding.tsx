import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const { width } = Dimensions.get('window')
const KEY = 'zyff_onboarding_v1'

type Slide = {
  colors: [string, string, string]
  accent: string
  badge: string
  initial: string
  title: string
  titleAccent?: string
  sub: string
}

// Web Onboarding bilan bir xil kontent
const SLIDES: Slide[] = [
  {
    colors: ['#0F0C29', '#302B63', '#24243e'],
    accent: '#FBBF24',
    badge: '✨ ZYFF',
    initial: 'Z',
    title: "Shahardagi barcha kiyim do'konlari —",
    titleAccent: 'bir joyda',
    sub: "Eng yaxshi do'konlarni toping, narxlarni solishtiring va to'g'ridan-to'g'ri xarid qiling.",
  },
  {
    colors: ['#14110b', '#2a2113', '#1a1a2e'],
    accent: '#D9B45B',
    badge: '👔 ASMA DESIGN',
    initial: 'A',
    title: 'Premium erkaklar kiyimi',
    sub: "Kostyum, ko'ylak va palto — Italiya sifati, zamonaviy uslub. Asma Design butigi.",
  },
  {
    colors: ['#0a0a0a', '#2b0a0a', '#000000'],
    accent: '#EF4444',
    badge: '🔥 BOOSNER',
    initial: 'B',
    title: '100% Original brendlar',
    sub: 'Adidas, Calvin Klein, New Balance va boshqalar — eng yaxshi narxlarda, kafolat bilan.',
  },
]

export function Onboarding() {
  const [show, setShow] = useState(false)
  const [i, setI] = useState(0)

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (!v) setShow(true) })
      .catch(() => {})
  }, [])

  const finish = () => {
    AsyncStorage.setItem(KEY, '1').catch(() => {})
    setShow(false)
  }
  const next = () => {
    if (i < SLIDES.length - 1) setI(i + 1)
    else finish()
  }

  if (!show) return null
  const s = SLIDES[i]
  const isLast = i === SLIDES.length - 1

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.root}>
        <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {/* Dekorativ nur */}
        <View style={[styles.glow, { backgroundColor: s.accent + '33', top: -60, right: -40 }]} />
        <View style={[styles.glow, { backgroundColor: 'rgba(255,255,255,0.05)', bottom: 120, left: -50, width: 180, height: 180 }]} />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {/* Skip */}
          <View style={styles.top}>
            <TouchableOpacity onPress={finish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.skip}>O'tkazib yuborish</Text>
            </TouchableOpacity>
          </View>

          {/* Kontent */}
          <View style={styles.center}>
            <Text style={[styles.watermark, { color: s.accent + '14' }]}>{s.initial}</Text>

            <Animated.View key={`badge-${i}`} entering={FadeIn.duration(400)} style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[styles.badgeText, { color: s.accent }]}>{s.badge}</Text>
            </Animated.View>

            <Animated.Text key={`title-${i}`} entering={FadeInDown.delay(100).duration(500)} style={styles.title}>
              {s.title}{s.titleAccent ? ' ' : ''}
              {s.titleAccent ? <Text style={{ color: s.accent }}>{s.titleAccent}</Text> : null}
            </Animated.Text>

            <Animated.Text key={`sub-${i}`} entering={FadeInDown.delay(220).duration(500)} style={styles.sub}>
              {s.sub}
            </Animated.Text>
          </View>

          {/* Pastki boshqaruv */}
          <View style={styles.bottom}>
            <View style={styles.dots}>
              {SLIDES.map((_, idx) => (
                <View key={idx} style={[styles.dot, idx === i && { width: 22, backgroundColor: s.accent }]} />
              ))}
            </View>
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: s.accent }]} onPress={next} activeOpacity={0.9}>
              <Text style={styles.nextText}>{isLast ? 'Boshlash' : 'Keyingi'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0C29' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 130 },
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 8 },
  skip: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  watermark: { position: 'absolute', fontSize: 260, fontWeight: '900' },
  badge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 22 },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 36, letterSpacing: -0.4 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 15, textAlign: 'center', lineHeight: 23, marginTop: 18, maxWidth: width - 80 },
  bottom: { paddingBottom: 12, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  nextBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  nextText: { color: '#0F0C29', fontSize: 16, fontWeight: '800' },
})
