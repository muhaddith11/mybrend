import { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import type { Product } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { useLangStore } from '../store/lang'
import { resolveImg } from '../lib/links'

// Mahsulot kartochkasi TAGIDAGI "savatga qo'shish" tugmasi (to'liq kenglikda bar).
// Rangi (bg) har joyga mos beriladi: ZYFF (brand — tungi rejimда moslashadi),
// bespoke do'kon (design.accent), oddiy do'kon (themeColor).
// Razmer/rang (variant) bor mahsulotда to'g'ridan-to'g'ri qo'shmaydi — mahsulot
// sahifasiga o'tadi (u yerda tanlab qo'shiladi). Oddiy mahsulotда darhol qo'shadi.
export function AddToCartButton({
  product, storeId, storeName, bg, textColor = '#fff', style,
}: {
  product: Product
  storeId?: string
  storeName?: string
  bg: string
  textColor?: string
  style?: StyleProp<ViewStyle>
}) {
  const router = useRouter()
  const lang = useLangStore(s => s.lang)
  const addToCart = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  const label = added
    ? (lang === 'ru' ? 'Добавлено' : lang === 'en' ? 'Added' : "Qo'shildi")
    : (lang === 'ru' ? 'В корзину' : lang === 'en' ? 'Add' : 'Savatga')

  const onPress = (e?: any) => {
    e?.stopPropagation?.()
    const needsVariant = !!(
      (product as any).sizes?.length ||
      (product as any).colors?.length ||
      (product.variants && product.variants.length > 0)
    )
    if (needsVariant) {
      router.push(`/product/${product.id}`)
      return
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: resolveImg(product.images?.[0]),
      storeId: storeId ?? product.storeId ?? (product as any).store?.id ?? '',
      storeName: storeName ?? (product as any).store?.name ?? '',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: added ? '#22c55e' : bg }, style]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Ionicons name={added ? 'checkmark' : 'bag-add-outline'} size={15} color={added ? '#fff' : textColor} />
      <Text style={[styles.label, { color: added ? '#fff' : textColor }]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10,
  },
  label: { fontSize: 12, fontWeight: '700' },
})
