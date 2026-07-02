import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function AboutScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZYFF haqida</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>🛍️</Text>
        <Text style={styles.intro}>
          ZYFF — Qo'qon shahridagi ko'p brendli kiyim marketplace platformasi. Biz shahardagi
          eng yaxshi do'konlarni bir joyda birlashtiramiz: qidiring, solishtiring va
          to'g'ridan-to'g'ri buyurtma bering.
        </Text>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Bizning do'konlarimiz</Text>
          <Text style={styles.blockText}>
            Platformamizda Asma Design (premium erkaklar kiyimi), Boosner (100% original
            brendlar — Adidas, Calvin Klein, New Balance) va One Pro Boutique (zamonaviy
            erkaklar kiyimi) kabi do'konlar mavjud. Har bir do'kon o'z sahifasiga,
            mahsulotlariga va yetkazib berish xizmatiga ega.
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Qanday ishlaydi</Text>
          <Text style={styles.blockText}>
            Mahsulotni qidiring → do'konni tanlang → savatga qo'shing → buyurtma bering.
            To'lov naqd, karta yoki online (Click/Payme) orqali. O'zbekiston bo'ylab
            yetkazib berish mavjud.
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Joylashuv va aloqa</Text>
          <Text style={styles.blockText}>
            📍 Qo'qon shahri, O'zbekiston{'\n'}
            🌐 zyff.uz · 📷 Instagram: @zyff.uz
          </Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => router.push('/stores')}>
          <Text style={styles.btnText}>Do'konlarni ko'rish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  content: { padding: 24, paddingBottom: 40 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 16 },
  intro: { fontSize: 15, color: '#333', lineHeight: 23, textAlign: 'center', marginBottom: 24 },
  block: { marginBottom: 20 },
  blockTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  blockText: { fontSize: 14, color: '#666', lineHeight: 21 },
  btn: { backgroundColor: '#534AB7', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
