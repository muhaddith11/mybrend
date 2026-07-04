// Har do'kon uchun alohida vizual identifikatsiya — web'dagi asma/boosner/onepro
// mini-saytlariga mos (ranglar oklch'dan hex'ga o'girildi, shriftlar Google Fonts).
// BespokeStore shu konfiguratsiya bilan har do'konga o'z dizaynini beradi.

export interface StoreDesign {
  slug: string
  mode: 'dark' | 'light'
  bg: string
  surface: string
  border: string
  text: string
  textMuted: string
  accent: string
  accentText: string // urg'u fonida matn rangi
  radius: number
  fonts: {
    heading: string    // katta sarlavhalar
    body: string       // matn
    bodyBold: string   // qalin matn
  }
  hero: {
    kicker: string
    title1: string
    title2: string
    sub: string
    uppercase: boolean
    letterSpacing: number
    italic2: boolean   // 2-qatorni kursiv qilish (asma)
    ctaCollection: string
    ctaLookbook: string
  }
  location: string
  established: string
}

// Shrift oilalari (_layout.tsx da useFonts orqali yuklanadi)
export const FONTS = {
  cormorantLight: 'CormorantGaramond_300Light',
  cormorantMedium: 'CormorantGaramond_500Medium',
  cormorantSemiBold: 'CormorantGaramond_600SemiBold',
  cormorantItalic: 'CormorantGaramond_500Medium_Italic',
  interRegular: 'Inter_400Regular',
  interSemiBold: 'Inter_600SemiBold',
  interExtraBold: 'Inter_800ExtraBold',
  spaceRegular: 'SpaceGrotesk_400Regular',
  spaceMedium: 'SpaceGrotesk_500Medium',
  spaceBold: 'SpaceGrotesk_700Bold',
} as const

const asma: StoreDesign = {
  slug: 'asma',
  mode: 'dark',
  bg: '#0A0B0E',
  surface: '#141519',
  border: '#2C2F36',
  text: '#F1F1F1',
  textMuted: '#9B9DA3',
  accent: '#DABE74', // oltin
  accentText: '#0A0B0E',
  radius: 4, // o'tkir, hashamatli
  fonts: {
    heading: FONTS.cormorantLight,
    body: FONTS.cormorantMedium,
    bodyBold: FONTS.cormorantSemiBold,
  },
  hero: {
    kicker: 'Yangi Kolleksiya 2026',
    title1: 'Elegantlik',
    title2: 'Yangicha',
    sub: "Premium erkaklar kiyimi. Italiya ustaligi va zamonaviy dizayn uyg'unligi.",
    uppercase: false,
    letterSpacing: 2,
    italic2: true,
    ctaCollection: "Kolleksiyani ko'rish",
    ctaLookbook: "Lookbookni ko'rish",
  },
  location: "Qo'qon, O'zbekiston",
  established: 'Tashkil: 2024',
}

const boosner: StoreDesign = {
  slug: 'boosner',
  mode: 'light',
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#E6E6E6',
  text: '#1F1F1F',
  textMuted: '#737373',
  accent: '#D93A2C', // qizil
  accentText: '#FFFFFF',
  radius: 2, // juda o'tkir, kuchli
  fonts: {
    heading: FONTS.interExtraBold,
    body: FONTS.interRegular,
    bodyBold: FONTS.interSemiBold,
  },
  hero: {
    kicker: '100% Original Brendlar',
    title1: 'ORIGINAL',
    title2: 'BRENDLAR',
    sub: 'Adidas, Calvin Klein, New Balance — 100% original mahsulotlar.',
    uppercase: true,
    letterSpacing: 0,
    italic2: false,
    ctaCollection: 'Kolleksiya',
    ctaLookbook: 'Lookbook',
  },
  location: "Qo'qon, O'zbekiston",
  established: 'Tashkil: 2024',
}

const onepro: StoreDesign = {
  slug: 'onepro',
  mode: 'light',
  bg: '#FFFFFF',
  surface: '#F6F4EE', // iliq
  border: '#EBE7DF',
  text: '#1F1F1F',
  textMuted: '#6E6A62',
  accent: '#C67C52', // terakota
  accentText: '#FFFFFF',
  radius: 12, // yumshoq, yumaloq
  fonts: {
    heading: FONTS.spaceBold,
    body: FONTS.spaceRegular,
    bodyBold: FONTS.spaceMedium,
  },
  hero: {
    kicker: 'Zamonaviy Kiyim',
    title1: 'One Pro',
    title2: 'Boutique',
    sub: 'Zamonaviy erkaklar kiyimi — sifat va uslub birlashgan joy.',
    uppercase: false,
    letterSpacing: 0,
    italic2: false,
    ctaCollection: "Kolleksiyani ko'rish",
    ctaLookbook: 'Lookbook',
  },
  location: "Qo'qon, O'zbekiston",
  established: 'Tashkil: 2024',
}

export const STORE_DESIGNS: Record<string, StoreDesign> = { asma, boosner, onepro }

export function getStoreDesign(slug?: string): StoreDesign | null {
  if (!slug) return null
  return STORE_DESIGNS[slug] ?? null
}
