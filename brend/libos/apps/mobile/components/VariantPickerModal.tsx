import { useMemo, useState, useEffect } from 'react'
import { View, Modal, Pressable, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Text } from './Txt'
import { Ionicons } from '@expo/vector-icons'
import type { Product } from '@libos/shared'
import { useT } from '@libos/shared'
import { useCartStore } from '../store/cart'
import { useLangStore } from '../store/lang'
import { useTheme, type ThemeColors } from '../store/theme'
import { resolveImg } from '../lib/links'

// Mahsulot kartochkasidan "savatga qo'shish" bosilganda — mahsulot sahifasiga
// o'tmasdan, o'rtada chiqadigan oynada rang/o'lcham tanlanadi va savatga qo'shiladi.
export function VariantPickerModal({
  product, storeId, storeName, themeColor, visible, onClose,
}: {
  product: Product | null
  storeId?: string
  storeName?: string
  themeColor: string
  visible: boolean
  onClose: () => void
}) {
  const lang = useLangStore(s => s.lang)
  const tr = useT(lang)
  const { colors } = useTheme()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const addToCart = useCartStore(s => s.addItem)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Oyna har ochilganda tanlovni tozalaymiz
  useEffect(() => {
    if (visible) { setSelectedSize(null); setSelectedColor(null); setError('') }
  }, [visible])

  const sizes = useMemo(() => (
    (product as any)?.sizes?.length
      ? (product as any).sizes
      : [...new Set((product?.variants ?? []).map(v => v.size).filter(Boolean))]
  ) as string[], [product])

  const variantColors = useMemo(() => (
    (product as any)?.colors?.length
      ? (product as any).colors
      : [...new Set((product?.variants ?? []).map(v => v.color).filter(Boolean))]
  ) as string[], [product])

  if (!product) return null

  const image = resolveImg(product.images?.[0])

  const handleAdd = () => {
    if (sizes.length > 0 && !selectedSize) {
      setError(lang === 'ru' ? 'Выберите размер' : lang === 'en' ? 'Select a size' : "O'lchamni tanlang")
      return
    }
    if (variantColors.length > 0 && !selectedColor) {
      setError(lang === 'ru' ? 'Выберите цвет' : lang === 'en' ? 'Select a color' : 'Rangni tanlang')
      return
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
      storeId: storeId ?? product.storeId ?? (product as any).store?.id ?? '',
      storeName: storeName ?? (product as any).store?.name ?? '',
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Yopish */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color={colors.text3} />
          </TouchableOpacity>

          {/* Mahsulot boshligi */}
          <View style={styles.head}>
            <View style={styles.imgWrap}>
              {image ? (
                <Image source={{ uri: image }} style={styles.img} resizeMode="cover" />
              ) : (
                <View style={styles.imgPlaceholder}><Ionicons name="shirt-outline" size={26} color={themeColor} /></View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
              <Text style={[styles.price, { color: themeColor }]}>
                {product.price.toLocaleString()} {tr.som}
              </Text>
            </View>
          </View>

          {/* O'lcham */}
          {sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>{tr.prSize}</Text>
              <View style={styles.chips}>
                {sizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.chip, selectedSize === size && { backgroundColor: themeColor, borderColor: themeColor }]}
                    onPress={() => { setSelectedSize(size); setError('') }}
                  >
                    <Text style={[styles.chipText, selectedSize === size && { color: '#fff' }]}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Rang */}
          {variantColors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>{tr.prColor}</Text>
              <View style={styles.chips}>
                {variantColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.chip, selectedColor === color && { backgroundColor: themeColor, borderColor: themeColor }]}
                    onPress={() => { setSelectedColor(color); setError('') }}
                  >
                    <Text style={[styles.chipText, selectedColor === color && { color: '#fff' }]}>{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColor }]} onPress={handleAdd} activeOpacity={0.85}>
            <Ionicons name="bag-add-outline" size={18} color="#fff" />
            <Text style={styles.addBtnText}>
              {lang === 'ru' ? 'В корзину' : lang === 'en' ? 'Add to cart' : 'Savatga qo\'shish'}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, backgroundColor: c.surface, borderRadius: 20, padding: 20, gap: 14 },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 4 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingRight: 24 },
  imgWrap: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: c.surface2 },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 3 },
  price: { fontSize: 16, fontWeight: '700' },
  section: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: c.text2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface2 },
  chipText: { fontSize: 14, color: c.text, fontWeight: '500' },
  error: { fontSize: 13, color: c.danger },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 12, marginTop: 2 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
