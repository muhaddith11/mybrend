import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function StoresScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.text}>Barcha do'konlar</Text>
        <Text style={styles.sub}>Tez orada...</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  sub: { fontSize: 14, color: '#888' },
})
