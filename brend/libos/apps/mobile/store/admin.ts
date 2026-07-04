import { create } from 'zustand'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { AdminOwner } from '../lib/adminApi'

const ADMIN_TOKEN_KEY = 'zyff_admin_token'

// store/auth.ts bilan bir xil yondashuv — native'da SecureStore, web'da localStorage
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

interface AdminStore {
  token: string | null
  owner: AdminOwner | null
  isLoading: boolean
  login: (token: string, owner: AdminOwner) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAdminStore = create<AdminStore>((set) => ({
  token: null,
  owner: null,
  isLoading: false,

  login: async (token, owner) => {
    await tokenStorage.setItemAsync(ADMIN_TOKEN_KEY, token)
    // Owner ma'lumotini ham saqlaymiz (qayta ochilganda ko'rsatish uchun)
    await tokenStorage.setItemAsync(ADMIN_TOKEN_KEY + '_owner', JSON.stringify(owner))
    set({ token, owner })
  },

  logout: async () => {
    await tokenStorage.deleteItemAsync(ADMIN_TOKEN_KEY)
    await tokenStorage.deleteItemAsync(ADMIN_TOKEN_KEY + '_owner')
    set({ token: null, owner: null })
  },

  loadFromStorage: async () => {
    set({ isLoading: true })
    try {
      const token = await tokenStorage.getItemAsync(ADMIN_TOKEN_KEY)
      const ownerRaw = await tokenStorage.getItemAsync(ADMIN_TOKEN_KEY + '_owner')
      if (token) {
        set({ token, owner: ownerRaw ? JSON.parse(ownerRaw) : null })
      }
    } catch {
      // e'tiborsiz
    } finally {
      set({ isLoading: false })
    }
  },
}))
