'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setToken } from '@libos/shared'
import type { User } from '@libos/shared'

interface AuthStore {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  showLoginModal: boolean
  showProfileDrawer: boolean
  openLogin: () => void
  closeLogin: () => void
  openProfile: () => void
  closeProfile: () => void
  login: (token: string, user: User) => void
  logout: () => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      showLoginModal: false,
      showProfileDrawer: false,

      openLogin: () => set({ showLoginModal: true }),
      closeLogin: () => set({ showLoginModal: false }),
      openProfile: () => set({ showProfileDrawer: true }),
      closeProfile: () => set({ showProfileDrawer: false }),

      login: (token, user) => {
        setToken(token)
        set({ token, user, isLoggedIn: true, showLoginModal: false })
      },

      logout: () => {
        setToken(null)
        set({ token: null, user: null, isLoggedIn: false })
      },

      init: async () => {
        const { token } = get()
        if (!token) return
        setToken(token)
        // Token bor — darhol "kirgan" deb belgilaymiz (sahifa yangilanganда chiqib
        // ketmasin), keyin foydalanuvchini /me orqali to'ldiramiz.
        set({ isLoggedIn: true })
        try {
          const user = await api.auth.me()
          set({ user, isLoggedIn: true })
        } catch (e) {
          // Faqat 401 (token yaroqsiz)да sessiyani tugatamiz. Tarmoq/server xatosi
          // (transient) bo'lsa tokenни saqlaymiz — foydalanuvchi bekorga chiqib ketmasin.
          const status = (e as { status?: number })?.status
          if (status === 401) {
            setToken(null)
            set({ token: null, user: null, isLoggedIn: false })
          }
        }
      },
    }),
    // isLoggedIn ham saqlanadi — qaytib kelganда darhol "kirgan" ko'rinadi (miltillash yo'q)
    { name: 'libos-auth', partialize: (s) => ({ token: s.token, isLoggedIn: s.isLoggedIn }) }
  )
)
