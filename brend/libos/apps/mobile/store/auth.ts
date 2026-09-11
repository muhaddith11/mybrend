import { create } from 'zustand'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { api, setToken } from '@libos/shared'
import type { User } from '@libos/shared'
import { getCurrentPushToken, setCurrentPushToken } from '../lib/pushNotifications'

const TOKEN_KEY = 'libos_token'

// expo-secure-store faqat native'da ishlaydi. Web'da uning shim'i yo'q —
// deleteValueWithKeyAsync xatosini berib auth'ni buzardi. Web uchun localStorage.
const tokenStorage =
  Platform.OS === 'web'
    ? {
        getItemAsync: async (k: string) =>
          typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null,
        setItemAsync: async (k: string, v: string) => {
          if (typeof localStorage !== 'undefined') localStorage.setItem(k, v)
        },
        deleteItemAsync: async (k: string) => {
          if (typeof localStorage !== 'undefined') localStorage.removeItem(k)
        },
      }
    : SecureStore

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isLoggedIn: false,

  login: async (token, user) => {
    await tokenStorage.setItemAsync(TOKEN_KEY, token)
    setToken(token)
    set({ token, user, isLoggedIn: true })
  },

  logout: async () => {
    // Qurilma tokenini serverdan olib tashlaymiz — aks holda chiqib ketgan
    // hisobning bildirishnomalari shu telefonga kelib turardi.
    // Kutmaymiz (chiqish tarmoqqa bog'lanib qolmasin): `request()` Authorization
    // sarlavhasini chaqiruv paytida o'qiydi, quyidagi `setToken(null)` esa
    // undan keyin ishlaydi — so'rov baribir to'g'ri token bilan ketadi.
    const pushToken = getCurrentPushToken()
    if (pushToken) {
      api.notifications.unregisterPushToken(pushToken).catch(() => {})
      setCurrentPushToken(null)
    }

    await tokenStorage.deleteItemAsync(TOKEN_KEY)
    setToken(null)
    set({ token: null, user: null, isLoggedIn: false })
  },

  // Profil yangilangach (ism/avatar) — token o'zgarmasdan foydalanuvchini yangilaymiz.
  setUser: (user) => set({ user }),

  loadFromStorage: async () => {
    try {
      const token = await tokenStorage.getItemAsync(TOKEN_KEY)
      if (token) {
        setToken(token)
        const user = await api.auth.me()
        set({ token, user, isLoggedIn: true })
      }
    } catch {
      await tokenStorage.deleteItemAsync(TOKEN_KEY)
    } finally {
      set({ isLoading: false })
    }
  },
}))
