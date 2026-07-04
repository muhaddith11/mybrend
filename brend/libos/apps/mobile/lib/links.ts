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
