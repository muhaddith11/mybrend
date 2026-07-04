import { useState } from 'react'
import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import type { Product } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { resolveImg } from '../lib/links'

// Mahsulot kartochkasidagi "savatga qo'shish" tugmasi.
// Razmer/rang (variant) bor mahsulotда to'g'ridan-to'g'ri qo'shmaydi — mahsulot
// sahifasiga o'tadi (u yerda tanlab qo'shiladi). Oddiy mahsulotда darhol qo'shadi
// va qisqa vaqt ✓ ko'rsatadi.
export function AddToCartButton({
  product, storeId, storeName, bg, size = 30, style,
}: {
  product: Product
  storeId?: string
  storeName?: string
  bg: string
  size?: number
  style?: StyleProp<ViewStyle>
}) {
  const router = useRouter()
  const addToCart = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  const onPress = (e?: any) => {
    // Kartochka ustida — bosilganda mahsulotга o'tib ketmasin (web bubbling)
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
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: added ? '#22c55e' : bg }, style]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Ionicons name={added ? 'checkmark' : 'bag-add-outline'} size={Math.round(size * 0.55)} color="#fff" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
})
