'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AvatarStore {
  emoji: string
  setEmoji: (e: string) => void
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set) => ({
      emoji: '👤',
      setEmoji: (emoji) => set({ emoji }),
    }),
    { name: 'zyff-avatar' }
  )
)
