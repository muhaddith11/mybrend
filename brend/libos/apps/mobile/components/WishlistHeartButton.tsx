import { TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Product, Store } from '@libos/shared'
import { useWishlistStore } from '../store/wishlist'

export function WishlistHeartButton({
  product, store, size = 16,
}: {
  product: Product
  store?: Store
  size?: number
}) {
  const has = useWishlistStore(s => s.has(product.id))
  const toggle = useWishlistStore(s => s.toggle)
  const resolvedStore = store ?? product.store

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => toggle({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0],
        storeId: product.storeId ?? resolvedStore?.id ?? '',
        storeName: resolvedStore?.name ?? '',
        storeSlug: resolvedStore?.slug ?? '',
        themeBg: resolvedStore?.themeBg,
      })}
    >
      <Ionicons name={has ? 'heart' : 'heart-outline'} size={size} color={has ? '#E23B3B' : '#1B1F4B'} />
    </TouchableOpacity>
  )
}

// Premium: oq doira + navy heart (mahsulot rasmi ustidagi overlay)
const styles = StyleSheet.create({
  btn: {
    position: 'absolute', top: 8, right: 8,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center', justifyContent: 'center',
  },
})
