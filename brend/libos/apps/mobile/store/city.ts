import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
    {
      name: 'zyff_city',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
