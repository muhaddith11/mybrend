import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../../store/lang'
import { useTheme } from '../../store/theme'

export default function TabsLayout() {
  const tr = useT(useLangStore(s => s.lang))
  const { colors } = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Faol tab — brend rangi (light: navy, dark: gold). Endi umumiy Navy & Gold
        // tizimiga mos; avvalgi tasodifiy ko'k (#2F6BFF) brenddan chetda edi.
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          paddingBottom: 12,
          paddingTop: 8,
          height: 76,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tr.home,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: tr.stores,
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: tr.cart,
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: tr.saved,
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tr.profile,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
