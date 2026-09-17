import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CityState {
  city: string
  setCity: (c: string) => void
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      city: "Qo'qon",
      setCity: (city) => set({ city }),
    }),
    { name: 'zyff-city' }
  )
)
