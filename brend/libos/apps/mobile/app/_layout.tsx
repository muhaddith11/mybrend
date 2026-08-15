import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack } from 'expo-router'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
// ma'lumot 60s davomida "fresh" (ortiqcha so'rov yubormaydi).
// gcTime = 24 soat: persist qilingan so'rovlar xotiradan tozalanib ketmasin
// (aks holda diskdan tiklangan ma'lumot darhol GC bo'lardi).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
    },
  },
})

// React Query cache'ini qurilma diskiga (AsyncStorage) saqlaymiz. Natijada ilova
// sovuqdan ochilganda oxirgi ko'rilgan do'kon/mahsulotlar DARHOL ko'rinadi (skeleton
// kutilmaydi), so'ng fonda jimgina yangilanadi ("stale-while-revalidate").
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ZYFF_RQ_CACHE',
  throttleTime: 1000, // diskka yozishni sekundiga 1 martaga cheklaymiz
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // saqlangan cache 24 soatdan keyin eskiradi
        buster: 'v1', // ma'lumot shakli o'zgarsa oshiring — eski cache bekor bo'ladi
        dehydrateOptions: {
          // FAQAT ochiq katalogni diskka yozamiz. Buyurtma/profil/sevimli kabi
          // shaxsiy ma'lumotlar (token bilan olingan) diskda qolmaydi.
          shouldDehydrateQuery: (q) => {
            const k = q.queryKey?.[0]
            return (k === 'stores' || k === 'products') && q.state.status === 'success'
          },
        },
      }}
    >
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
    </PersistQueryClientProvider>
  )
}
