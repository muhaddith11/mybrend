import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Web store/avatar.ts bilan bir xil — foydalanuvchi emoji avatari
interface AvatarState {
  emoji: string
  setEmoji: (e: string) => void
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      emoji: '👤',
      setEmoji: (emoji) => set({ emoji }),
    }),
    {
      name: 'zyff_avatar',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Web ProfileDrawer bilan bir xil ro'yxat
export const PERSON_EMOJIS = [
  '👤', '👦', '👧', '👨', '👩', '🧑', '👴', '👵', '🧔', '👱', '🧕', '🦸',
]
