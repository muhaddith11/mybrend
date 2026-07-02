import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Lang } from '@libos/shared'

export type { Lang }

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'uz',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'zyff_lang',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
