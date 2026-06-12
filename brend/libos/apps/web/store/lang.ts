import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'uz' | 'ru' | 'en'

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
    { name: 'zyff-lang' }
  )
)
