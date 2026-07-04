import { useMemo, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api, useT } from '@libos/shared'
import { useCartStore } from '../../store/cart'
import { useWishlistStore } from '../../store/wishlist'
import { useLangStore } from '../../store/lang'
import { useTheme, type ThemeColors } from '../../store/theme'
import { getStoreDesign } from '../../lib/storeDesigns'
import { resolveImg } from '../../lib/links'

const { width } = Dimensions.get('window')

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors } = useTheme()
  const addToCart = useCartStore(s => s.addItem)
  const cartCount = useCartStore(s => s.totalCount())
  const wishlistHas = useWishlistStore(s => s.has)
  const wishlistToggle = useWishlistStore(s => s.toggle)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedImg, setSelectedImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [selectErr, setSelectErr] = useState('')

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.byId(id),
  })

  // Do'kon bespoke dizayni bo'lsa (asma/boosner/onepro), mahsulot sahifasini ham
  // shu do'kon ko'rinishida (masalan asma — qora/oltin) ochamiz — web bilan parity.
  const design = product ? getStoreDesign((product as any).store?.slug) : null
  const pc: ThemeColors = design
    ? {
        ...colors,
        bg: design.bg, surface: design.surface, surface2: design.surface,
        text: design.text, text2: design.textMuted, text3: design.textMuted,
        border: design.border, brand: design.accent, brandLight: design.surface,
        white: design.accentText,
      }
    : colors
  const styles = useMemo(() => makeStyles(pc), [colors, design])

  if (isLoading) {
    return <View style={styles.loading}><Text style={{ color: pc.text2 }}>{tr.mLoading}</Text></View>
  }
  if (!product) return null

  const themeColor = design?.accent ?? (product as any).store?.themeColor ?? colors.brand
  const images: string[] = (product.images ?? []).map(resolveImg).filter(Boolean) as string[]
  const inStock = product.inStock ?? true
  // Razmer/rang mahsulotda massiv sifatida saqlanadi (sizes/colors); variants bo'sh
  // bo'lsa ham shulardan o'qiymiz.
  const sizes = ((product as any).sizes?.length
    ? (product as any).sizes
    : [...new Set((product.variants ?? []).map(v => v.size).filter(Boolean))]) as string[]
  const variantColors = ((product as any).colors?.length
    ? (product as any).colors
    : [...new Set((product.variants ?? []).map(v => v.color).filter(Boolean))]) as string[]

  const isWishlisted = wishlistHas(product.id)
  const handleToggleWishlist = () => {
    wishlistToggle({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: images[0],
      storeId: product.storeId,
      storeName: (product as any).store?.name ?? '',
      storeSlug: (product as any).store?.slug ?? '',
      themeBg: (product as any).store?.themeBg,
    })
  }

  const handleAddToCart = () => {
    // Razmer/rang bor bo'lsa — tanlanmasdan savatga qo'shib bo'lmaydi
    if (sizes.length > 0 && !selectedSize) {
      setSelectErr(lang === 'ru' ? 'Выберите размер' : lang === 'en' ? 'Select a size' : "O'lchamni tanlang")
      return
    }
    if (variantColors.length > 0 && !selectedColor) {
      setSelectErr(lang === 'ru' ? 'Выберите цвет' : lang === 'en' ? 'Select a color' : 'Rangni tanlang')
      return
    }
    setSelectErr('')
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      storeId: product.storeId,
      storeName: (product as any).store?.name ?? '',
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleToggleWishlist} style={styles.heartBtn}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? colors.danger : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/cart')}
            style={styles.cartBtn}
          >
            <Ionicons name="bag-outline" size={22} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: themeColor }]}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rasm */}
        <View style={styles.imgContainer}>
          {images[selectedImg] ? (
            <Image source={{ uri: images[selectedImg] }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.imgPlaceholder, { backgroundColor: themeColor + '18' }]}>
              <Ionicons name="shirt-outline" size={80} color={themeColor} />
            </View>
          )}
        </View>

        {/* Rasm galereyasi (bir nechta rasm bo'lsa) */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbs}
          >
            {images.map((src, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.thumb, selectedImg === i && { borderColor: themeColor }]}
                onPress={() => setSelectedImg(i)}
              >
                <Image source={{ uri: src }} style={styles.thumbImg} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Nom va narx */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: themeColor }]}>
                {product.price.toLocaleString()} {tr.som}
              </Text>
              {!!product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.originalPrice}>
                  {product.originalPrice.toLocaleString()} {tr.som}
                </Text>
              )}
            </View>
          </View>

          {/* Do'kon nomi */}
          <TouchableOpacity
            style={styles.storeRow}
            onPress={() => router.push(`/store/${(product as any).store?.slug}`)}
          >
            <Ionicons name="storefront-outline" size={15} color={colors.text3} />
            <Text style={styles.storeName}>{(product as any).store?.name}</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.text3} />
          </TouchableOpacity>

          {/* O'lcham tanlash */}
          {sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{tr.prSize}</Text>
              <View style={styles.chips}>
                {sizes.map(size => (
                  <TouchableOpacity
                    key={size!}
                    style={[
                      styles.chip,
                      selectedSize === size && { backgroundColor: themeColor, borderColor: themeColor },
                    ]}
                    onPress={() => { setSelectedSize(size!); setSelectErr('') }}
                  >
                    <Text style={[styles.chipText, selectedSize === size && { color: '#fff' }]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Rang tanlash */}
          {variantColors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{tr.prColor}</Text>
              <View style={styles.chips}>
                {variantColors.map(color => (
                  <TouchableOpacity
                    key={color!}
                    style={[
                      styles.chip,
                      selectedColor === color && { backgroundColor: themeColor, borderColor: themeColor },
                    ]}
                    onPress={() => { setSelectedColor(color!); setSelectErr('') }}
                  >
                    <Text style={[styles.chipText, selectedColor === color && { color: '#fff' }]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bor / tugagan holati */}
          <View style={styles.stockRow}>
            <View style={[styles.stockDot, { backgroundColor: inStock ? '#22c55e' : '#ef4444' }]} />
            <Text style={[styles.stockText, { color: inStock ? '#16a34a' : '#ef4444' }]}>
              {inStock ? tr.mInStockShort : tr.mSoldOut}
            </Text>
          </View>

          {/* Tavsif */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{tr.mDescription}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Savatchaga qo'shish */}
      <View style={styles.footer}>
        {!!selectErr && (
          <View style={styles.selectErrRow}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
            <Text style={styles.selectErrText}>{selectErr}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: !inStock ? colors.border : added ? '#22c55e' : themeColor }]}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <Ionicons name={added ? 'checkmark' : 'bag-add-outline'} size={20} color="#fff" />
          <Text style={styles.addBtnText}>
            {!inStock ? tr.mSoldOut : added ? tr.mAddedToCartShort : tr.addToCart}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 6 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartBtn: { padding: 6 },
  cartBtn: { padding: 6, position: 'relative' },
  badge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  imgContainer: { width, height: width * 0.9 },
  image: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  thumbs: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  thumb: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbImg: { width: '100%', height: '100%' },
  content: { padding: 20 },
  titleRow: { marginBottom: 8 },
  name: { fontSize: 20, fontWeight: '600', color: c.text, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 22, fontWeight: '700' },
  originalPrice: { fontSize: 14, color: c.text3, textDecorationLine: 'line-through' },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 0.5, borderBottomColor: c.border },
  storeName: { fontSize: 13, color: c.text2, flex: 1 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: c.border },
  chipText: { fontSize: 13, color: c.text2 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  description: { fontSize: 14, color: c.text2, lineHeight: 22 },
  footer: { padding: 16, borderTopWidth: 0.5, borderTopColor: c.border, backgroundColor: c.surface },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12 },
  addBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  selectErrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 },
  selectErrText: { fontSize: 13, color: c.danger, fontWeight: '600' },
})
