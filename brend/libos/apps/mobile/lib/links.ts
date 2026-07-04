// Do'kon kontakt maydonlari username ("asma.design", "@asma") yoki to'liq havola
// ("https://instagram.com/asma") ko'rinishida bo'lishi mumkin — ikkalasini ham
// to'g'ri havolaga aylantiramiz.

function isUrl(s: string) {
  return /^https?:\/\//i.test(s)
}

export function instagramUrl(v?: string | null): string | null {
  if (!v) return null
  const s = v.trim()
  if (!s) return null
  if (isUrl(s)) return s
  return `https://instagram.com/${s.replace(/^@/, '')}`
}

export function telegramUrl(v?: string | null): string | null {
  if (!v) return null
  const s = v.trim()
  if (!s) return null
  if (isUrl(s)) return s
  return `https://t.me/${s.replace(/^@/, '')}`
}

export function telHref(v?: string | null): string | null {
  if (!v) return null
  const s = v.trim()
  if (!s) return null
  return `tel:${s.replace(/[\s()-]/g, '')}`
}

// Xaritada yo'nalish (qurilma xarita ilovasi)
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Seed/demo mahsulot rasmlari nisbiy yo'l bilan saqlangan ("/asma/products/x.jpg")
// — ular veb-saytning public papkasidan xizmat qilinadi. Mobil'da to'liq URL kerak,
// shuning uchun nisbiy yo'llarni veb baza URL'iga bog'laymiz.
const WEB_BASE =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_WEB_URL) || 'https://zyff.uz'

export function resolveImg(uri?: string | null): string | undefined {
  if (!uri) return undefined
  const s = uri.trim()
  if (!s) return undefined
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s
  if (s.startsWith('/')) return WEB_BASE + s
  return s
}
