// Har do'kon uchun alohida vizual identifikatsiya — web'dagi asma/boosner/onepro
// mini-saytlariga mos (ranglar oklch'dan hex'ga o'girildi, shriftlar Google Fonts).
// `aura` faqat ilovada mavjud (web'da mini-sayti yo'q) — logotipidan olingan.
// BespokeStore shu konfiguratsiya bilan har do'konga o'z dizaynini beradi.

import type { ImageSourcePropType } from 'react-native'

// Ilova ichiga joylashtirilgan (bundled) brend rasmlari. Bazadagi qiymat (admin
// panelda yuklangan logo/banner) doim ustun — bular faqat u bo'sh bo'lganda
// ishlatiladi, ya'ni do'kon birinchi kunidanoq to'liq brendlangan ko'rinadi.
export interface StoreAssets {
  logo?: ImageSourcePropType
  banner?: ImageSourcePropType
  looks?: ImageSourcePropType[] // lookbook — bazada look bo'lmasa ko'rsatiladi
}

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
  assets?: StoreAssets
}

// Shrift oilalari (_layout.tsx da useFonts orqali yuklanadi)
export const FONTS = {
  cormorantLight: 'CormorantGaramond_300Light',
  cormorantMedium: 'CormorantGaramond_500Medium',
  cormorantSemiBold: 'CormorantGaramond_600SemiBold',
  cormorantItalic: 'CormorantGaramond_500Medium_Italic',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  interExtraBold: 'Inter_800ExtraBold',
  spaceRegular: 'SpaceGrotesk_400Regular',
  spaceMedium: 'SpaceGrotesk_500Medium',
  spaceBold: 'SpaceGrotesk_700Bold',
} as const

// Space Grotesk'da KIRILL glifi yo'q (Google Fonts subset'i: lotin + lotin-ext +
// vetnamcha). Bunday shrift kirill matnga qo'llansa Android'da □□□ chiqadi — RN
// maxsus shriftda glif topilmasa avtomatik zaxira shriftga o'tmaydi; iOS esa
// tizim shriftiga sakraydi va dizayn buziladi. Ruscha interfeysda `onepro`
// do'koni sahifasi aynan shundan buzilardi.
//
// Yechim: kirill kerak bo'lganda o'sha og'irlikdagi Inter'ga almashtiramiz
// (Inter kirillikli va allaqachon yuklangan). Cormorant va Inter kirillni
// qo'llab-quvvatlaydi — ular tegilmaydi.
const CYRILLIC_FALLBACK: Record<string, string> = {
  [FONTS.spaceRegular]: FONTS.interRegular,
  [FONTS.spaceMedium]: FONTS.interMedium,
  [FONTS.spaceBold]: FONTS.interBold,
}

const CYRILLIC_RE = /[Ѐ-ӿ]/

/** Matnda kirill harfi bormi (do'kon nomi, mahsulot nomlari — bazadan keladi). */
export function hasCyrillic(...texts: (string | null | undefined)[]): boolean {
  return texts.some(t => !!t && CYRILLIC_RE.test(t))
}

/**
 * Dizaynni kirillga xavfsiz holga keltiradi.
 *
 * `needsCyrillic` — interfeys ruscha bo'lsa YOKI do'kon kontenti (nom, tavsif,
 * mahsulot nomlari) kirillcha bo'lsa. Sotuvchi mahsulot nomini ruscha yozishi
 * mumkin, shuning uchun faqat `lang === 'ru'` tekshiruvi yetarli emas.
 */
export function withCyrillicSafeFonts(design: StoreDesign, needsCyrillic: boolean): StoreDesign {
  if (!needsCyrillic) return design
  const swap = (f: string) => CYRILLIC_FALLBACK[f] ?? f
  const { heading, body, bodyBold } = design.fonts
  if (heading === swap(heading) && body === swap(body) && bodyBold === swap(bodyBold)) return design
  return { ...design, fonts: { heading: swap(heading), body: swap(body), bodyBold: swap(bodyBold) } }
}

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

// Aura Med Forma — tibbiyot xodimlari uchun kiyim. Logotipdagi to'q zumrad
// marmar + oltin serif yozuvdan olingan palitra. Sarlavha serif (logotipga mos),
// matn Inter — asma'dan (butunlay serif) farqlanib tursin.
const aura: StoreDesign = {
  slug: 'aura',
  mode: 'dark',
  bg: '#06302A',      // to'q zumrad
  surface: '#0B4038',
  border: '#175A4D',
  text: '#F0F4F2',
  textMuted: '#9CBDB3',
  accent: '#D4AF6A',  // oltin
  accentText: '#06302A',
  radius: 6,
  fonts: {
    heading: FONTS.cormorantSemiBold,
    body: FONTS.interRegular,
    bodyBold: FONTS.interSemiBold,
  },
  hero: {
    kicker: 'Tibbiyot xodimlari uchun',
    title1: 'Aura',
    title2: 'Med Forma',
    sub: "Siz loyiq bo'lgan sifat — premium med xalat va formalar, tapichka va aksessuarlar.",
    uppercase: true,
    letterSpacing: 3,
    italic2: false,
    ctaCollection: "Kolleksiyani ko'rish",
    ctaLookbook: 'Lookbook',
  },
  location: "Qo'qon, O'zbekiston",
  established: 'Tashkil: 2025',
  assets: {
    logo: require('../assets/aura-logo.webp'),
    // Hero/banner uchun brend yozuvi YO'Q rasm tanlangan — sarlavha ("AURA
    // MED FORMA") va do'kon nomi uning ustiga chiqadi, takrorlanmasin.
    banner: require('../assets/aura-banner.webp'),
    looks: [require('../assets/aura-look-1.webp')],
  },
}

export const STORE_DESIGNS: Record<string, StoreDesign> = { asma, boosner, onepro, aura }

export function getStoreDesign(slug?: string): StoreDesign | null {
  if (!slug) return null
  return STORE_DESIGNS[slug] ?? null
}
