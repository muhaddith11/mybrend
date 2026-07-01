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
      <Ionicons name={has ? 'heart' : 'heart-outline'} size={size} color={has ? '#ef4444' : '#fff'} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute', top: 6, right: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
})
