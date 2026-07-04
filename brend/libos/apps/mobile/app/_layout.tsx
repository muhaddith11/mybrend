import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import {
  CormorantGaramond_300Light, CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold, CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond'
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold } from '@expo-google-fonts/inter'
import { useAuthStore } from '../store/auth'
import { useAdminStore } from '../store/admin'
import { Onboarding } from '../components/Onboarding'

const queryClient = new QueryClient()

export default function RootLayout() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage)
  const loadAdmin = useAdminStore(s => s.loadFromStorage)

  // Do'kon dizaynlari uchun shriftlar (asma=serif, boosner=Inter, onepro=SpaceGrotesk).
  // Yuklanmaguncha ilova baribir ishlaydi — shriftlar tayyor bo'lgach avtomatik yangilanadi.
  useFonts({
    CormorantGaramond_300Light, CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold, CormorantGaramond_500Medium_Italic,
    SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold,
    Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold,
  })

  // Ilova ochilganda saqlangan token(lar)ni yuklash
  useEffect(() => {
    loadFromStorage()
    loadAdmin()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/verify" options={{ presentation: 'card' }} />
          <Stack.Screen name="auth/delete-account" options={{ presentation: 'card' }} />
          <Stack.Screen name="store/[slug]" options={{ presentation: 'card' }} />
          <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkout" options={{ presentation: 'card' }} />
          <Stack.Screen name="help" options={{ presentation: 'card' }} />
          <Stack.Screen name="about" options={{ presentation: 'card' }} />
          <Stack.Screen name="delivery" options={{ presentation: 'card' }} />
          <Stack.Screen name="open-store" options={{ presentation: 'card' }} />
          <Stack.Screen name="privacy" options={{ presentation: 'card' }} />
          <Stack.Screen name="terms" options={{ presentation: 'card' }} />
          <Stack.Screen name="admin" options={{ presentation: 'card' }} />
        </Stack>
        <Onboarding />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
