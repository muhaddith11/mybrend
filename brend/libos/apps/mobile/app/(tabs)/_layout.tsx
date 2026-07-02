import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useT } from '@libos/shared'
import { useLangStore } from '../../store/lang'

export default function TabsLayout() {
  const tr = useT(useLangStore(s => s.lang))
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#534AB7',
        tabBarInactiveTintColor: '#888780',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#D3D1C7',
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
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
