import { create } from 'zustand'
import type { AdminOwner } from '../lib/adminApi'

// Do'kon egasi (admin) sessiyasi — XAVFSIZLIK uchun ATAYLAB saqlanmaydi.
// Token faqat xotirada turadi: ilova yopilsa yo'qoladi va panelga har kirganda
// qaytadan login/parol so'raladi (buyer sessiyasidan alohida, u saqlanadi).
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
    set({ token, owner })
  },

  logout: async () => {
    set({ token: null, owner: null })
  },

  // Ataylab bo'sh — admin tokeni saqlanmaydi (har safar login talab qilinadi).
  loadFromStorage: async () => {},
}))
