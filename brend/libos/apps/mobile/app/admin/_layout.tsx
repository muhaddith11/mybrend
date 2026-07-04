import { Stack } from 'expo-router'

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="index" />
      <Stack.Screen name="products" options={{ presentation: 'card' }} />
      <Stack.Screen name="product-form" options={{ presentation: 'card' }} />
      <Stack.Screen name="orders" options={{ presentation: 'card' }} />
      <Stack.Screen name="settings" options={{ presentation: 'card' }} />
    </Stack>
  )
}
