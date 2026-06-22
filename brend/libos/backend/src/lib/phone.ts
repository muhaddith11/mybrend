import { z } from 'zod'

// O'zbekiston telefon raqami: +998 + 9 raqam (masalan +998901234567).
// Bo'sh joy/chiziq/qavslar normallashtiriladi, keyin format tekshiriladi.
// Maqsad: yaroqsiz/axlat raqamlardan DB ifloslanishi va keraksiz SMS oldini olish.
export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s\-()]/g, ''))
  .pipe(z.string().regex(/^\+?998\d{9}$/, "Telefon raqam noto'g'ri"))
