import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import type { Store } from '@libos/shared'

export function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.storeCard} onPress={onPress}>
      <View style={[styles.storeAvatar, { backgroundColor: store.themeBg }]}>
        {store.logo ? (
          <Image source={{ uri: store.logo }} style={styles.storeLogoImg} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>🏪</Text>
        )}
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeAddr}>{store.address}</Text>
        <View style={styles.storeTags}>
          {store.hasDelivery && <Tag label="Yetkazish" color="#E1F5EE" textColor="#0F6E56" />}
          {store.hasPickup && <Tag label="Bron" color="#EEEDFE" textColor="#3C3489" />}
          {store.hasCashOnDoor && <Tag label="Naqd" color="#FAEEDA" textColor="#633806" />}
        </View>
      </View>
      <View style={styles.storeRight}>
        <Text style={styles.rating}>
          ⭐ {store.rating.toFixed(1)}{!!store.reviewCount && ` (${store.reviewCount})`}
        </Text>
        <Text style={styles.itemCount}>{store._count.products} mahsulot</Text>
        <View style={[styles.openBadge, { backgroundColor: store.isOpen ? '#EAF3DE' : '#FCEBEB' }]}>
          <Text style={{ fontSize: 10, color: store.isOpen ? '#3B6D11' : '#A32D2D' }}>
            {store.isOpen ? 'Ochiq' : 'Yopiq'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function Tag({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={{ fontSize: 10, color: textColor }}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  storeCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#D3D1C7', padding: 12, marginHorizontal: 16, alignItems: 'center', gap: 12 },
  storeAvatar: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeLogoImg: { width: '100%', height: '100%' },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 2 },
  storeAddr: { fontSize: 12, color: '#888780', marginBottom: 6 },
  storeTags: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  storeRight: { alignItems: 'flex-end', gap: 2 },
  rating: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  itemCount: { fontSize: 11, color: '#888780' },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
})
