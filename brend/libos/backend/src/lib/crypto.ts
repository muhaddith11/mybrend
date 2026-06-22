import { timingSafeEqual } from 'crypto'

// Vaqt-bo'yicha xavfsiz string solishtirish (timing-attack oldini oladi).
// Oddiy `a === b` belgilarni birma-bir solishtirib, birinchi farqда to'xtaydi —
// shu sababli javob vaqti maxfiy qiymatga "sızadi". timingSafeEqual esa har doim
// to'liq buferni solishtiradi. Uzunlik farq qilsa darhol false (uzunlik maxfiy emas).
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}
