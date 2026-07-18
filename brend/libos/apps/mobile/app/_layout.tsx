import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import {
  CormorantGaramond_300Light, CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold, CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond'
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter'
import { useAuthStore } from '../store/auth'
import { useAdminStore } from '../store/admin'
import { Onboarding } from '../components/Onboarding'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { initSentry } from '../lib/sentry'

// Sentry'ni ilova yuklanishidan oldin ishga tushiramiz (DSN bo'lsa).
initSentry()

// ── Global UI shrifti: Inter ──
// Har bir <Text>ga Inter'ni SIDIRG'A biriktiruvchi ishonchli komponent
// components/Txt.tsx da. (Ilgari bu yerda Text.render monkey-patch bor edi —
// react-native-web'da ilovani yiqitgani uchun olib tashlandi.)

// Ishlab chiqarish uchun mos standartlar: zaif tarmoqda 2 marta qayta urinadi,
// ma'lumot 30s davomida "fresh" (ortiqcha so'rov yubormaydi).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage)
  const loadAdmin = useAdminStore(s => s.loadFromStorage)

  // Do'kon dizaynlari uchun shriftlar (asma=serif, boosner=Inter, onepro=SpaceGrotesk).
  // Yuklanmaguncha ilova baribir ishlaydi — shriftlar tayyor bo'lgach avtomatik yangilanadi.
  useFonts({
    CormorantGaramond_300Light, CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold, CormorantGaramond_500Medium_Italic,
    SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  })

  // Web'da TextInput fokusda xunuk qora ramka (outline) chiqadi — barcha
  // input/textarea'lardan global o'chiramiz (native'da bu e'tiborsiz).
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = 'input, textarea, select { outline: none !important; }'
      document.head.appendChild(style)
    }
  }, [])

  // Ilova ochilganda saqlangan token(lar)ni yuklash
  useEffect(() => {
    loadFromStorage()
    loadAdmin()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
