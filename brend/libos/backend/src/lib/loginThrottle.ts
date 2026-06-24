import type { PrismaClient } from '@prisma/client'

// DB-asosli login throttle. `@fastify/rate-limit` in-memory store ishlatadi —
// Vercel serverless'da har bir instance alohida xotira, shuning uchun chegara
// instance'lar bo'ylab BIRLASHMAYDI (brute-force'ni to'xtatmaydi). Bu helper
// holatni umumiy DB'da saqlaydi, shuning uchun barcha instance'lar bir xil
// hisoblagichni ko'radi.

const MAX_ATTEMPTS = 10 // bitta kalitga oynaда shuncha muvaffaqiyatsiz urinish
const WINDOW_MS = 15 * 60 * 1000 // 15 daqiqalik oyna

export type ThrottleResult = { allowed: boolean; retryAfterSec: number }

// Joriy holatni tekshiradi (urinishdan OLDIN chaqiriladi). Bloklangan bo'lsa
// allowed=false va qancha kutish kerakligini qaytaradi.
export async function checkLoginThrottle(prisma: PrismaClient, key: string): Promise<ThrottleResult> {
  const row = await prisma.loginThrottle.findUnique({ where: { key } })
  if (!row) return { allowed: true, retryAfterSec: 0 }

  const elapsed = Date.now() - row.windowStart.getTime()
  if (elapsed > WINDOW_MS) return { allowed: true, retryAfterSec: 0 } // oyna eskirgan

  if (row.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((WINDOW_MS - elapsed) / 1000) }
  }
  return { allowed: true, retryAfterSec: 0 }
}

// Muvaffaqiyatsiz urinishdan keyin hisoblagichni oshiradi. Oyna eskirgan bo'lsa
// yangi oyna boshlaydi (count=1).
export async function bumpLoginThrottle(prisma: PrismaClient, key: string): Promise<void> {
  const row = await prisma.loginThrottle.findUnique({ where: { key } })
  const now = new Date()

  if (!row || now.getTime() - row.windowStart.getTime() > WINDOW_MS) {
    await prisma.loginThrottle.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    })
    return
  }
  await prisma.loginThrottle.update({ where: { key }, data: { count: { increment: 1 } } })
}

// Muvaffaqiyatli login — hisoblagichni tozalaymiz (bloklanib qolmasin).
export async function resetLoginThrottle(prisma: PrismaClient, key: string): Promise<void> {
  await prisma.loginThrottle.deleteMany({ where: { key } })
}
