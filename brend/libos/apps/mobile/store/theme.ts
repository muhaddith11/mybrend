import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform, type SwitchProps } from 'react-native'

// ZYFF mobil PREMIUM dizayn tokenlari — "Navy & Ko'k" (2026-09: Gold → Ko'k #3B6CFF).
// SHARED paketga tegmasdan, mobil ichida saqlanadi (web/shared'ga ta'sir yo'q).
// Light: Navy (#1B1F4B) = asosiy rang, Ko'k (#3B6CFF) = urg'u (CTA, ikonlar, toggle).
// Dark: urg'u OQ (ko'k yo'q) — oq fon ustidagi matn/ikonka `onBrand` bilan quyuq.
// Sariq (#E3A008, eski Gold) faqat chegirma va xarita belgilarida qoldi — `highlight`.

export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  brand: string       // asosiy (light: navy, dark: oq)
  onBrand: string     // brand/accent FONI ustidagi matn va ikonka (light: oq, dark: quyuq navy)
  brandDark: string   // quyuq navy (footer, promo)
  brandLight: string  // ochiq tint (ikon-tugma foni, chip)
  accent: string      // urg'u (light: ko'k, dark: oq)
  accentSoft: string  // urg'u tiniq fon (til aktiv, tint)
  highlight: string   // sariq urg'u — chegirma va xarita belgilari
  text: string
  text2: string
  text3: string
  border: string
  bg: string
  surface: string
  surface2: string
  white: string
  skeleton1: string
  skeleton2: string
  danger: string
}

// Light — Navy & Ko'k
export const lightColors: ThemeColors = {
  brand: '#1B1F4B',
  onBrand: '#FFFFFF',
  brandDark: '#12142E',
  brandLight: '#EFEEF9',
  accent: '#3B6CFF',
  accentSoft: 'rgba(59,108,255,0.12)',
  highlight: '#E3A008',
  text: '#10122B',
  text2: '#6B6E8A',
  text3: '#9EA0B8',
  border: 'rgba(16,18,43,0.08)',
  bg: '#F6F6FB',
  surface: '#FFFFFF',
  surface2: '#EFEEF9',
  white: '#FFFFFF',
  skeleton1: '#ECECF4',
  skeleton2: '#E2E2EE',
  danger: '#E0574A',
}

// Dark — navy fon, OQ urg'u: tungi rejimda ko'k ishlatilmaydi (faol tab, tugma,
// ikonka, toggle — hammasi oq). Oq fonli tugmalar matni `onBrand` (quyuq navy).
export const darkColors: ThemeColors = {
  brand: '#FFFFFF',
  onBrand: '#12142E',
  brandDark: '#12142E',
  brandLight: 'rgba(255,255,255,0.10)',
  accent: '#FFFFFF',
  accentSoft: 'rgba(255,255,255,0.10)',
  highlight: '#E3A008',
  text: '#F2F2FA',
  text2: 'rgba(242,242,250,0.6)',
  text3: 'rgba(242,242,250,0.42)',
  border: 'rgba(255,255,255,0.08)',
  bg: '#0B0D1A',
  surface: '#161933',
  surface2: '#1E2140',
  white: '#FFFFFF',
  skeleton1: '#20233F',
  skeleton2: '#2A2D4C',
  danger: '#E0574A',
}

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors
}

/**
 * Switch thumb rangi. Faol holatda track `brand`/`accent` — tungi rejimda oq, shuning
 * uchun thumb quyuq (`onBrand`). Native'da `thumbColor` ikkala holatga ishlaydi;
 * react-native-web esa faol holatda `activeThumbColor` o'qiydi (berilmasa standart
 * yashil-ko'k #009688 chiqardi).
 */
export function switchThumb(c: ThemeColors, on: boolean): Pick<SwitchProps, 'thumbColor'> {
  const props: Record<string, string> = { thumbColor: on ? c.onBrand : c.white }
  if (Platform.OS === 'web') props.activeThumbColor = c.onBrand
  return props
}

// ── Spacing va tipografiya shkalasi (mavzudan mustaqil) ──
// Inline "sehrli sonlar" o'rniga: styles ichida `space.md`, `font.body` ishlating.
// 4pt bazaviy grid.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  pill: 999,
} as const

export const font = {
  caption: 11,  // yordamchi matn, badge
  small: 12,    // do'kon nomi, sub-label
  body: 14,     // asosiy matn, input
  subtitle: 15, // seksiya sarlavhasi
  title: 17,    // yirik sarlavha
} as const

// UI shrifti — Inter. fontWeight qiymatini mos Inter oilasiga xaritalaydi.
// (RN'da nomlangan shrift oilasida fontWeight avtomatik ishlamaydi — har vazn
// alohida oila.) Global patch shu orqali to'g'ri qalinlik ierarxiyasini saqlaydi.
export function interFamily(weight?: string | number): string {
  const w = typeof weight === 'number' ? String(weight) : weight
  if (w === 'bold') return 'Inter_700Bold'
  switch (w) {
    case '500': return 'Inter_500Medium'
    case '600': return 'Inter_600SemiBold'
    case '700': return 'Inter_700Bold'
    case '800':
    case '900': return 'Inter_800ExtraBold'
    default:    return 'Inter_400Regular' // 100–400, 'normal', undefined
  }
}

interface ThemeState {
  dark: boolean
  toggle: () => void
  setDark: (v: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
      setDark: (dark) => set({ dark }),
    }),
    {
      name: 'zyff_theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Ekranlarda ishlatish uchun qulay hook — joriy rejim ranglarini qaytaradi.
export function useTheme(): { mode: ThemeMode; dark: boolean; colors: ThemeColors } {
  const dark = useThemeStore((s) => s.dark)
  const mode: ThemeMode = dark ? 'dark' : 'light'
  return { mode, dark, colors: getColors(mode) }
}
