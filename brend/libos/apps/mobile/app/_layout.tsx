import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/auth'

const queryClient = new QueryClient()

export default function RootLayout() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage)

  // Ilova ochilganda saqlangan tokenni yuklash
  useEffect(() => {
    loadFromStorage()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/verify" options={{ presentation: 'card' }} />
          <Stack.Screen name="store/[slug]" options={{ presentation: 'card' }} />
          <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkout" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
