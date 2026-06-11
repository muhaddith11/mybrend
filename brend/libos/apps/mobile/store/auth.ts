import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api, setToken } from '@libos/shared'
import type { User } from '@libos/shared'

const TOKEN_KEY = 'libos_token'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isLoggedIn: false,

  login: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    setToken(token)
    set({ token, user, isLoggedIn: true })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    setToken(null)
    set({ token: null, user: null, isLoggedIn: false })
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY)
      if (token) {
        setToken(token)
        const user = await api.auth.me()
        set({ token, user, isLoggedIn: true })
      }
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
    } finally {
      set({ isLoading: false })
    }
  },
}))
