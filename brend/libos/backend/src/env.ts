import { z } from 'zod'

// Windows/PowerShell env qiymatiga BOM qo'shishi mumkin — tozalaymiz
const clean = (v: string | undefined) => v?.replace(/^﻿/, '')

const schema = z.object({
  // Majburiy — bularsiz backend ishlay olmaydi
  DATABASE_URL: z.string().min(1, 'DATABASE_URL kerak — Neon Postgres ulanish satri'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET kerak — token imzolash uchun maxfiy kalit'),
  // Ixtiyoriy (defaultli)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
})

const parsed = schema.safeParse({
  DATABASE_URL: clean(process.env.DATABASE_URL),
  JWT_SECRET: clean(process.env.JWT_SECRET),
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
})

if (!parsed.success) {
  const msg = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
  throw new Error(
    `\n❌ Backend env sozlamalari xato:\n${msg}\n\n` +
      `Vercel → backend loyihasi → Settings → Environment Variables ni tekshiring.\n`,
  )
}

export const env = parsed.data
