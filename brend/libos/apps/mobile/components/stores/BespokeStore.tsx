import { useMemo, useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Dimensions, useWindowDimensions, Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  FadeIn, FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
} from 'react-native-reanimated'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, useT } from '@libos/shared'
import type { Product, Store } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { WishlistHeartButton } from '../WishlistHeartButton'
import { AddToCartButton } from '../AddToCartButton'
import type { StoreDesign } from '../../lib/storeDesigns'
import { instagramUrl, telegramUrl, telHref, resolveImg } from '../../lib/links'

const { width } = Dimensions.get('window')
const CARD_W = (width - 32 - 12) / 2

type StoreDetail = Store & { products: Product[] }

export function BespokeStore({ store, design }: { store: StoreDetail; design: StoreDesign }) {
  const router = useRouter()
  const tr = useT(useLangStore(s => s.lang))
  const { height } = useWindowDimensions()
  const { isLoggedIn } = useAuthStore()
  const qc = useQueryClient()
  const styles = useMemo(() => makeStyles(design), [design])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const scrollRef = useRef<ScrollView>(null)
  const gridY = useRef(0)
  const lookbookY = useRef(0)

  const HERO_H = Math.min(Math.max(height * 0.62, 440), 620)

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.stores.favorites(),
    enabled: isLoggedIn,
  })
  const isFavorited = !!favorites?.stores.some(s => s.id === store.id)
  const toggleFavorite = useMutation({
    mutationFn: () => api.stores.toggleFavorite(store.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })
  const onHeart = () => {
    if (!isLoggedIn) { router.push('/auth/login'); return }
    toggleFavorite.mutate()
  }

  const categories = Array.from(
    new Map(store.products.filter(p => p.category).map(p => [p.category!.id, p.category!])).values()
  )
  const filtered = selectedCategory
    ? store.products.filter(p => p.category?.id === selectedCategory)
    : store.products
  const featured = store.products.filter(p => (p as any).featured).slice(0, 6)
  const featuredList = featured.length ? featured : store.products.slice(0, 6)

  // ── Kontakt ma'lumotlari (website uslubidagi footer uchun) ──
  const lang = useLangStore(s => s.lang)
  const phone = (store as any).phone as string | undefined
  const igUrl = instagramUrl((store as any).instagram)
  const tgUrl = telegramUrl((store as any).telegram)
  const hours = (store as any).workingHours as string | undefined
  const hasCoords = typeof store.lat === 'number' && typeof store.lng === 'number'
  const lookbook = (store as any).lookbook as string[] | undefined
  const hasLookbook = Array.isArray(lookbook) && lookbook.length > 0
  const L = {
    contact: lang === 'ru' ? 'КОНТАКТЫ' : lang === 'en' ? 'CONTACT' : 'ALOQA',
    hours: lang === 'ru' ? 'Часы работы' : lang === 'en' ? 'Working hours' : 'Ish vaqti',
  }

  // Scroll indikator sakrashi (web'dagi kabi)
  const bounce = useSharedValue(0)
  useEffect(() => {
    bounce.value = withRepeat(withSequence(withTiming(8, { duration: 900 }), withTiming(0, { duration: 900 })), -1, false)
  }, [])
  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bounce.value }] }))

  return (
    <View style={styles.root}>
      {/* Yuqori boshqaruv (hero ustida) */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={design.mode === 'dark' ? '#fff' : design.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onHeart} disabled={toggleFavorite.isPending}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorited ? design.accent : (design.mode === 'dark' ? '#fff' : design.text)}
          />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── HERO ── */}
        <View style={[styles.hero, { height: HERO_H }]}>
          {store.banner ? (
            <Image source={{ uri: resolveImg(store.banner) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: design.bg }]} />
          )}
          <LinearGradient
            colors={
              design.mode === 'dark'
                ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']
                : ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.05)', design.bg]
            }
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            <Animated.Text entering={FadeInDown.delay(200).duration(700)} style={styles.kicker}>
              {design.hero.kicker.toUpperCase()}
            </Animated.Text>

            <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={styles.heroTitle}>
              {design.hero.uppercase ? design.hero.title1.toUpperCase() : design.hero.title1}
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(550).duration(800)}
              style={[styles.heroTitle, styles.heroTitle2]}
            >
              {design.hero.uppercase ? design.hero.title2.toUpperCase() : design.hero.title2}
            </Animated.Text>

            <Animated.Text entering={FadeInDown.delay(750).duration(800)} style={styles.heroSub}>
              {store.description || design.hero.sub}
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(950).duration(800)} style={styles.heroBtns}>
              <TouchableOpacity
                style={styles.ctaPrimary}
                activeOpacity={0.85}
                onPress={() => scrollRef.current?.scrollTo({ y: Math.max(gridY.current - 20, HERO_H - 40), animated: true })}
              >
                <Text style={styles.ctaPrimaryText}>{design.hero.ctaCollection}</Text>
              </TouchableOpacity>
              {hasLookbook && (
                <TouchableOpacity
                  style={styles.ctaSecondary}
                  activeOpacity={0.85}
                  onPress={() => scrollRef.current?.scrollTo({ y: Math.max(lookbookY.current - 10, HERO_H - 40), animated: true })}
                >
                  <Text style={styles.ctaSecondaryText}>{design.hero.ctaLookbook}</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          {/* Scroll indikator */}
          <Animated.View entering={FadeIn.delay(1400)} style={styles.scrollIndicator}>
            <Animated.View style={bounceStyle}>
              <Ionicons name="chevron-down" size={22} color={design.mode === 'dark' ? 'rgba(255,255,255,0.7)' : design.textMuted} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* ── FEATURED ── */}
        {featuredList.length > 0 && (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.section}>
            <Text style={styles.sectionKicker}>{tr.popularProducts.toUpperCase()}</Text>
            <View style={styles.divider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 16 }}>
              {featuredList.map(p => (
                <FeaturedCard key={p.id} product={p} design={design} styles={styles} cur={tr.som} onPress={() => router.push(`/product/${p.id}`)} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* ── BRAND STORY ── */}
        {!!store.description && (
          <Animated.View entering={FadeInUp.duration(600)} style={[styles.section, styles.storySection]}>
            <Text style={styles.storyKicker}>{design.location.toUpperCase()}</Text>
            <View style={[styles.divider, { alignSelf: 'center' }]} />
            <Text style={styles.storyText}>{store.description}</Text>
          </Animated.View>
        )}

        {/* ── LOOKBOOK (tayyor obrazlar galereyasi) ── */}
        {hasLookbook && (
          <View style={styles.section} onLayout={e => { lookbookY.current = e.nativeEvent.layout.y }}>
            <Text style={styles.sectionKicker}>LOOKBOOK</Text>
            <View style={styles.divider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 16 }}>
              {lookbook!.map((uri, i) => (
                <View key={i} style={styles.lookCard}>
                  <Image source={{ uri: resolveImg(uri) }} style={styles.imgFill} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── KATEGORIYALAR ── */}
        {categories.length > 0 && (
          <View style={styles.catRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
              <Chip label={tr.mAllCategory} active={!selectedCategory} design={design} styles={styles} onPress={() => setSelectedCategory(null)} />
              {categories.map(cat => (
                <Chip key={cat.id} label={cat.name} active={selectedCategory === cat.id} design={design} styles={styles} onPress={() => setSelectedCategory(cat.id)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── MAHSULOTLAR GRID ── */}
        <View style={styles.grid} onLayout={e => { gridY.current = e.nativeEvent.layout.y }}>
          {filtered.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInUp.delay(Math.min(i, 8) * 60).duration(500)}>
              <GridCard product={p} design={design} styles={styles} cur={tr.som} onPress={() => router.push(`/product/${p.id}`)} />
            </Animated.View>
          ))}
          {filtered.length === 0 && <Text style={styles.empty}>{tr.mProductsNotFound}</Text>}
        </View>

        {/* ── ALOQA / FOOTER (website uslubida) ── */}
        <View style={styles.contactSection}>
          <Text style={styles.contactKicker}>{L.contact}</Text>
          <View style={[styles.divider, { alignSelf: 'center' }]} />
          <Text style={styles.contactName}>{store.name}</Text>

          <View style={styles.contactList}>
            {!!phone && (
              <TouchableOpacity style={styles.contactRow} activeOpacity={0.7} onPress={() => Linking.openURL(telHref(phone)!)}>
                <Ionicons name="call-outline" size={17} color={design.accent} />
                <Text style={styles.contactText}>{phone}</Text>
              </TouchableOpacity>
            )}
            {!!store.address && (
              <TouchableOpacity
                style={styles.contactRow}
                activeOpacity={hasCoords ? 0.7 : 1}
                onPress={() => hasCoords && Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`)}
              >
                <Ionicons name="location-outline" size={17} color={design.accent} />
                <Text style={styles.contactText}>{store.address}</Text>
              </TouchableOpacity>
            )}
            {!!hours && (
              <View style={styles.contactRow}>
                <Ionicons name="time-outline" size={17} color={design.accent} />
                <Text style={styles.contactText}>{L.hours}: {hours}</Text>
              </View>
            )}
          </View>

          {(!!igUrl || !!tgUrl) && (
            <View style={styles.socialRow}>
              {!!igUrl && (
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85} onPress={() => Linking.openURL(igUrl)}>
                  <Ionicons name="logo-instagram" size={18} color={design.accentText} />
                  <Text style={styles.socialBtnText}>Instagram</Text>
                </TouchableOpacity>
              )}
              {!!tgUrl && (
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85} onPress={() => Linking.openURL(tgUrl)}>
                  <Ionicons name="paper-plane-outline" size={17} color={design.accentText} />
                  <Text style={styles.socialBtnText}>Telegram</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.established}>{design.established} · {design.location}</Text>
          <Text style={styles.copy}>© 2026 {store.name} — ZYFF</Text>
        </View>
      </ScrollView>
    </View>
  )
}

function Chip({ label, active, design, styles, onPress }: { label: string; active: boolean; design: StoreDesign; styles: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && { backgroundColor: design.accent, borderColor: design.accent }]}>
      <Text style={[styles.chipText, active && { color: design.accentText }]}>{label}</Text>
    </TouchableOpacity>
  )
}

function FeaturedCard({ product, design, styles, cur, onPress }: { product: Product; design: StoreDesign; styles: any; cur: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.featCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.featImg}>
        {product.images?.[0]
          ? <Image source={{ uri: resolveImg(product.images[0]) }} style={styles.imgFill} resizeMode="cover" />
          : <View style={[styles.imgFill, { backgroundColor: design.surface }]} />}
        <WishlistHeartButton product={product} size={13} />
        <AddToCartButton product={product} bg={design.accent} style={styles.addOnImg} />
      </View>
      <Text style={styles.featName} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.featPrice}>{product.price.toLocaleString()} {cur}</Text>
    </TouchableOpacity>
  )
}

function GridCard({ product, design, styles, cur, onPress }: { product: Product; design: StoreDesign; styles: any; cur: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.gridImg}>
        {product.images?.[0]
          ? <Image source={{ uri: resolveImg(product.images[0]) }} style={styles.imgFill} resizeMode="cover" />
          : <View style={[styles.imgFill, { backgroundColor: design.surface, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="shirt-outline" size={34} color={design.accent} />
            </View>}
        <WishlistHeartButton product={product} size={13} />
        <AddToCartButton product={product} bg={design.accent} style={styles.addOnImg} />
      </View>
      <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.gridPrice}>{product.price.toLocaleString()} {cur}</Text>
    </TouchableOpacity>
  )
}

const makeStyles = (d: StoreDesign) => StyleSheet.create({
  root: { flex: 1, backgroundColor: d.bg },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },

  hero: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  heroContent: { position: 'relative', zIndex: 2, alignItems: 'center', paddingHorizontal: 28 },
  kicker: { fontFamily: d.fonts.body, fontSize: 12, letterSpacing: 4, color: d.accent, marginBottom: 16, textAlign: 'center' },
  heroTitle: { fontFamily: d.fonts.heading, fontSize: 46, lineHeight: 50, color: d.mode === 'dark' ? '#F5F5F5' : '#fff', textAlign: 'center', letterSpacing: d.hero.letterSpacing },
  heroTitle2: { color: d.accent, fontStyle: d.hero.italic2 ? 'italic' : 'normal', fontFamily: d.hero.italic2 ? 'CormorantGaramond_500Medium_Italic' : d.fonts.heading },
  heroSub: { fontFamily: d.fonts.body, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 18, maxWidth: 320 },
  heroBtns: { marginTop: 28, flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  ctaPrimary: { backgroundColor: d.accent, paddingHorizontal: 26, paddingVertical: 13, borderRadius: d.radius },
  ctaPrimaryText: { fontFamily: d.fonts.bodyBold, fontSize: 13, letterSpacing: 1.5, color: d.accentText, textTransform: 'uppercase' },
  ctaSecondary: { borderWidth: 1, borderColor: d.accent, paddingHorizontal: 26, paddingVertical: 12, borderRadius: d.radius, backgroundColor: 'transparent' },
  ctaSecondaryText: { fontFamily: d.fonts.bodyBold, fontSize: 13, letterSpacing: 1.5, color: d.accent, textTransform: 'uppercase' },
  lookCard: { width: 260, height: 360, borderRadius: d.radius, overflow: 'hidden', backgroundColor: d.surface },
  scrollIndicator: { position: 'absolute', bottom: 20, alignSelf: 'center', zIndex: 3 },

  section: { paddingTop: 32, paddingLeft: 16 },
  sectionKicker: { fontFamily: d.fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: d.accent, marginBottom: 10 },
  divider: { width: 40, height: 2, backgroundColor: d.accent, marginBottom: 18 },

  featCard: { width: 150 },
  featImg: { width: 150, height: 190, borderRadius: d.radius, overflow: 'hidden', backgroundColor: d.surface },
  featName: { fontFamily: d.fonts.body, fontSize: 13, color: d.text, marginTop: 8 },
  featPrice: { fontFamily: d.fonts.bodyBold, fontSize: 14, color: d.accent, marginTop: 2 },

  storySection: { paddingRight: 16, alignItems: 'center' },
  storyKicker: { fontFamily: d.fonts.bodyBold, fontSize: 11, letterSpacing: 3, color: d.textMuted, marginBottom: 10 },
  storyText: { fontFamily: d.fonts.body, fontSize: 16, lineHeight: 26, color: d.text, textAlign: 'center', maxWidth: 340 },

  catRow: { marginTop: 28, marginBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: d.radius, borderWidth: 1, borderColor: d.border, backgroundColor: d.surface },
  chipText: { fontFamily: d.fonts.body, fontSize: 13, color: d.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  gridCard: { width: CARD_W, marginBottom: 18 },
  gridImg: { width: CARD_W, height: CARD_W * 1.15, borderRadius: d.radius, overflow: 'hidden', backgroundColor: d.surface },
  gridName: { fontFamily: d.fonts.body, fontSize: 13, color: d.text, marginTop: 8, lineHeight: 17, minHeight: 34 },
  gridPrice: { fontFamily: d.fonts.bodyBold, fontSize: 14, color: d.accent, marginTop: 2 },
  imgFill: { width: '100%', height: '100%' },
  addOnImg: { position: 'absolute', right: 8, bottom: 8 },
  empty: { fontFamily: d.fonts.body, color: d.textMuted, textAlign: 'center', width: '100%', marginTop: 30 },

  // ── Kontakt / footer ──
  contactSection: { marginTop: 40, paddingTop: 34, paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: d.border, backgroundColor: d.surface },
  contactKicker: { fontFamily: d.fonts.bodyBold, fontSize: 12, letterSpacing: 3, color: d.accent, marginBottom: 12 },
  contactName: { fontFamily: d.fonts.heading, fontSize: 26, color: d.text, marginBottom: 20, textAlign: 'center' },
  contactList: { alignSelf: 'stretch', gap: 12, marginBottom: 22 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  contactText: { fontFamily: d.fonts.body, fontSize: 15, color: d.text, textAlign: 'center' },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 26 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: d.accent, paddingHorizontal: 22, paddingVertical: 12, borderRadius: d.radius },
  socialBtnText: { fontFamily: d.fonts.bodyBold, fontSize: 13, letterSpacing: 0.5, color: d.accentText },
  established: { fontFamily: d.fonts.body, fontSize: 12, letterSpacing: 1, color: d.textMuted, marginBottom: 8, textAlign: 'center' },
  copy: { fontFamily: d.fonts.body, fontSize: 11, color: d.textMuted, opacity: 0.7, textAlign: 'center' },
})
