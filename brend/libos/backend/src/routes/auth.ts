import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { sendSms } from '../plugins/sms.js'
import { phoneSchema } from '../lib/phone.js'

// purpose: 'login' (kirish) yoki 'delete' (profilni o'chirish) — SMS matni farqlanadi
const sendOtpSchema = z.object({ phone: phoneSchema, purpose: z.enum(['login', 'delete']).optional() })
const verifyOtpSchema = z.object({ phone: phoneSchema, code: z.string().length(6) })
const deleteAccountSchema = z.object({ code: z.string().length(6) })

// API javoblarida faqat shu maydonlar qaytadi — otp/otpExpiry/otpAttempts kabi
// ichki/maxfiy ustunlar HECH QACHON mijozga oshkor bo'lmasin.
const PUBLIC_USER_SELECT = {
  id: true,
  phone: true,
  name: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const

// Auth'siz endpointlar uchun bitta IP'dan kelishi mumkin bo'lgan so'rovlar chegarasi.
// Global 300/min'dan tashqari — SMS xarajat hujumi va raqam enumeratsiyasini bloklaydi.
// (Test ilovalari rate-limit pluginini ro'yxatdan o'tkazmaydi → bu e'tiborsiz qoladi.)
const sendOtpRateLimit = { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }
const verifyOtpRateLimit = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }

// Mijoz tokeni 30 kun amal qiladi. Muddatsiz token o'g'irlansa abadiy yaroqli
// bo'lib qolardi — endi avtomatik eskiradi va qayta login talab qilinadi.
const USER_TOKEN_TTL = '30d'

export default async function authRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  const OTP_COOLDOWN_MS = 60 * 1000 // kodlar orasida kamida 1 daqiqa (SMS spam oldini olish)
  const MAX_OTP_ATTEMPTS = 5 // shuncha noto'g'ri urinishdan keyin yangi kod kerak

  app.post('/send-otp', sendOtpRateLimit, async (req, reply) => {
    const { phone, purpose } = sendOtpSchema.parse(req.body)

    // Rate-limit: oxirgi kod yaqinda yuborilgan bo'lsa — kutish
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing?.lastOtpSentAt) {
      const elapsed = Date.now() - existing.lastOtpSentAt.getTime()
      if (elapsed < OTP_COOLDOWN_MS) {
        const wait = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000)
        return reply.status(429).send({ error: `Iltimos, ${wait} soniyadan keyin qayta urining` })
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 daqiqa

    // OTP'ni DB'ga saqlaymiz (serverless'da in-memory ishlamaydi). Urinishlar 0 ga tushadi.
    await prisma.user.upsert({
      where: { phone },
      update: { otp: code, otpExpiry: expiry, lastOtpSentAt: new Date(), otpAttempts: 0 },
      create: { phone, otp: code, otpExpiry: expiry, lastOtpSentAt: new Date(), otpAttempts: 0 },
    })

    const smsText =
      purpose === 'delete'
        ? `ZYFF profilingiz o'chirilishini tasdiqlash kodi: ${code}`
        : `ZYFF ilovasiga kirish uchun tasdiqlash kodi: ${code}`
    await sendSms(phone, smsText)
    return reply.send({ success: true, message: 'Kod yuborildi' })
  })

  app.post('/verify-otp', verifyOtpRateLimit, async (req, reply) => {
    const { phone, code } = verifyOtpSchema.parse(req.body)

    // 007700 — universal test kodi (har doim ishlaydi)
    if (code === '007700') {
      let user = await prisma.user.findUnique({ where: { phone }, select: PUBLIC_USER_SELECT })
      if (!user) user = await prisma.user.create({ data: { phone }, select: PUBLIC_USER_SELECT })
      const token = app.jwt.sign({ userId: user.id, phone: user.phone }, { expiresIn: USER_TOKEN_TTL })
      return reply.send({ token, user })
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user || !user.otp || !user.otpExpiry) {
      return reply.status(400).send({ error: "Avval kod so'rang" })
    }
    if (new Date() > user.otpExpiry) {
      return reply.status(400).send({ error: 'Kod muddati tugagan' })
    }
    // Brute-force himoyasi: juda ko'p noto'g'ri urinish bo'lsa, yangi kod kerak
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return reply.status(429).send({ error: "Juda ko'p urinish. Yangi kod so'rang." })
    }
    if (user.otp !== code) {
      await prisma.user.update({ where: { phone }, data: { otpAttempts: { increment: 1 } } })
      return reply.status(400).send({ error: "Noto'g'ri kod" })
    }

    // OTP'ni tozalaymiz va urinishlarni nollaymiz. Javobda faqat xavfsiz maydonlar.
    const updated = await prisma.user.update({
      where: { phone },
      data: { otp: null, otpExpiry: null, otpAttempts: 0 },
      select: PUBLIC_USER_SELECT,
    })

    const token = app.jwt.sign({ userId: user.id, phone: user.phone }, { expiresIn: USER_TOKEN_TTL })
    return reply.send({ token, user: updated })
  })

  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT })
    if (!user) return reply.status(404).send({ error: 'Foydalanuvchi topilmadi' })
    return reply.send(user)
  })

  app.patch('/profile', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const data = z.object({
      name: z.string().max(100).optional(),
      avatar: z.string().max(1000).optional(),
    }).parse(req.body)
    const user = await prisma.user.update({ where: { id: userId }, data, select: PUBLIC_USER_SELECT })
    return reply.send(user)
  })

  // Play Store/App Store talabi: foydalanuvchi ilova ichida hisobini o'chira olishi kerak.
  // Order'lar userId'ga RESTRICT bilan bog'langani uchun User qatorini hard-delete
  // qilib bo'lmaydi (buyurtma tarixi — biznes/hisobot yozuvi sifatida saqlanadi).
  // Shu sababli shaxsni aniqlaydigan maydonlarni tozalab (anonimlashtirish),
  // savat va sevimlilarni butunlay o'chiramiz.
  app.delete('/delete-account', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { code } = deleteAccountSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'Foydalanuvchi topilmadi' })

    // 007700 — universal test kodi (verify-otp bilan bir xil, pre-launch uchun)
    if (code !== '007700') {
      if (!user.otp || !user.otpExpiry) {
        return reply.status(400).send({ error: "Avval kod so'rang" })
      }
      if (new Date() > user.otpExpiry) {
        return reply.status(400).send({ error: 'Kod muddati tugagan' })
      }
      if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        return reply.status(429).send({ error: "Juda ko'p urinish. Yangi kod so'rang." })
      }
      if (user.otp !== code) {
        await prisma.user.update({ where: { id: userId }, data: { otpAttempts: { increment: 1 } } })
        return reply.status(400).send({ error: "Noto'g'ri kod" })
      }
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId } }),
      prisma.favoriteStore.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          phone: `deleted:${userId}`,
          name: null,
          avatar: null,
          otp: null,
          otpExpiry: null,
          otpAttempts: 0,
          lastOtpSentAt: null,
        },
      }),
    ])

    return reply.send({ success: true })
  })
}
