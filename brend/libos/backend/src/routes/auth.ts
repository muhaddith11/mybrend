import type { FastifyInstance } from 'fastify'
import { randomInt } from 'node:crypto'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { sendSms } from '../plugins/sms.js'
import { phoneSchema } from '../lib/phone.js'
import { fail, ErrorCodes } from '../lib/apiError.js'

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

// ─── App Review demo akkaunti ────────────────────────────────────────────────
// `007700` ilgari HAR QANDAY raqam bilan ishlardi — ya'ni kodni bilgan odam
// istalgan foydalanuvchining akkauntiga kira olardi (va uni o'chira olardi).
// Endi u faqat bitta demo raqam uchun amal qiladi. Bu raqam Apple/Google review
// jamoasiga beriladi; `12` operator prefiksi O'zbekistonda mavjud emas, shuning
// uchun raqam hech qachon real foydalanuvchiga tegishli bo'lolmaydi.
//
// `DEMO_OTP_PHONE=""` qo'yilsa demo kirish butunlay o'chadi.
const DEMO_OTP_CODE = '007700'
const DEMO_OTP_PHONE = (process.env.DEMO_OTP_PHONE ?? '+998123456789').trim()

/** Raqamni `phoneSchema` bilan bir xil normallashtiradi (bo'sh joy/chiziq olib tashlanadi). */
function normalizePhone(p: string): string {
  const s = p.replace(/[\s\-()]/g, '')
  return s.startsWith('+') ? s : `+${s}`
}

/** Shu raqam review demo raqamimi. */
function isDemoPhone(phone: string): boolean {
  if (!DEMO_OTP_PHONE) return false
  return normalizePhone(phone) === normalizePhone(DEMO_OTP_PHONE)
}

/** Shu raqam uchun demo kodi qabul qilinadimi. */
function isDemoLogin(phone: string, code: string): boolean {
  return isDemoPhone(phone) && code === DEMO_OTP_CODE
}

// Mijoz tokeni 30 kun amal qiladi. Muddatsiz token o'g'irlansa abadiy yaroqli
// bo'lib qolardi — endi avtomatik eskiradi va qayta login talab qilinadi.
const USER_TOKEN_TTL = '30d'

export default async function authRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  const OTP_COOLDOWN_MS = 60 * 1000 // kodlar orasida kamida 1 daqiqa (SMS spam oldini olish)
  const MAX_OTP_ATTEMPTS = 5 // shuncha noto'g'ri urinishdan keyin yangi kod kerak

  app.post('/send-otp', sendOtpRateLimit, async (req, reply) => {
    const { phone, purpose } = sendOtpSchema.parse(req.body)

    // Demo raqamga cooldown QO'LLANMAYDI. Apple/Google reviewer'i SMS ololmaydi,
    // shuning uchun "Get code" ni bir necha marta bosadi — 60 soniyalik cooldown
    // uni o'zbekcha 429 xatosi bilan login ekranida qamab qo'yardi va ilova kod
    // ekraniga umuman o'tmasdi. (2026-08-18 da Apple aynan shu sababdan rad etdi.)
    const demo = isDemoPhone(phone)

    // Rate-limit: oxirgi kod yaqinda yuborilgan bo'lsa — kutish
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (!demo && existing?.lastOtpSentAt) {
      const elapsed = Date.now() - existing.lastOtpSentAt.getTime()
      if (elapsed < OTP_COOLDOWN_MS) {
        const wait = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000)
        return fail(reply, 429, ErrorCodes.OTP_COOLDOWN,
          `Iltimos, ${wait} soniyadan keyin qayta urining`, { seconds: wait })
      }
    }

    // OTP kriptografik generatordan olinadi. `Math.random()` (xorshift128+)
    // taxmin qilinadigan: hujumchi o'z raqamiga bir necha kod so'rab PRNG holatini
    // tiklab, boshqa foydalanuvchining kodini oldindan hisoblashi mumkin edi.
    const code = String(randomInt(100000, 1000000))
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
    // Demo raqamga SMS yuborilmaydi — u real raqam emas, provayder xarajati va
    // xatosi bekorga bo'ladi. Reviewer baribir `007700` bilan kiradi.
    if (!demo) {
      // SMS yuborilmasa MIJOZGA AYTAMIZ. Ilgari xato jimgina logga yozilib,
      // javob baribir `success: true` bo'lardi — foydalanuvchi kod ekranida
      // o'tirib qolar, kod esa hech qachon kelmasdi va sabab ko'rinmasdi.
      // (Kod DB'da saqlangani bu yerda yordam bermaydi: foydalanuvchi uni
      // ololmaydi, shuning uchun oqimni davom ettirishning ma'nosi yo'q.)
      try {
        await sendSms(phone, smsText)
      } catch (e) {
        req.log.error({ err: e }, 'SMS yuborilmadi (provayder)')
        return fail(reply, 502, ErrorCodes.SMS_FAILED,
          "Kod yuborilmadi. Biroz kutib, qayta urinib ko'ring.")
      }
    }
    return reply.send({ success: true, message: 'Kod yuborildi' })
  })

  app.post('/verify-otp', verifyOtpRateLimit, async (req, reply) => {
    const { phone, code } = verifyOtpSchema.parse(req.body)

    // Demo kirish — FAQAT review demo raqami uchun (yuqoridagi izohga qarang).
    if (isDemoLogin(phone, code)) {
      let user = await prisma.user.findUnique({ where: { phone }, select: PUBLIC_USER_SELECT })
      if (!user) user = await prisma.user.create({ data: { phone }, select: PUBLIC_USER_SELECT })
      const token = app.jwt.sign({ userId: user.id, phone: user.phone }, { expiresIn: USER_TOKEN_TTL })
      return reply.send({ token, user })
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user || !user.otp || !user.otpExpiry) {
      return fail(reply, 400, ErrorCodes.OTP_NOT_REQUESTED, "Avval kod so'rang")
    }
    if (new Date() > user.otpExpiry) {
      return fail(reply, 400, ErrorCodes.OTP_EXPIRED, 'Kod muddati tugagan')
    }
    // Brute-force himoyasi: juda ko'p noto'g'ri urinish bo'lsa, yangi kod kerak
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return fail(reply, 429, ErrorCodes.OTP_TOO_MANY, "Juda ko'p urinish. Yangi kod so'rang.")
    }
    if (user.otp !== code) {
      await prisma.user.update({ where: { phone }, data: { otpAttempts: { increment: 1 } } })
      return fail(reply, 400, ErrorCodes.OTP_WRONG, "Noto'g'ri kod")
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
    if (!user) return fail(reply, 404, ErrorCodes.USER_NOT_FOUND, 'Foydalanuvchi topilmadi')
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
    if (!user) return fail(reply, 404, ErrorCodes.USER_NOT_FOUND, 'Foydalanuvchi topilmadi')

    // Demo kirish — faqat review demo raqamining O'ZI uchun. Ilgari `007700`
    // har qanday akkauntni o'chirishga imkon berardi.
    if (!isDemoLogin(user.phone, code)) {
      if (!user.otp || !user.otpExpiry) {
        return fail(reply, 400, ErrorCodes.OTP_NOT_REQUESTED, "Avval kod so'rang")
      }
      if (new Date() > user.otpExpiry) {
        return fail(reply, 400, ErrorCodes.OTP_EXPIRED, 'Kod muddati tugagan')
      }
      if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        return fail(reply, 429, ErrorCodes.OTP_TOO_MANY, "Juda ko'p urinish. Yangi kod so'rang.")
      }
      if (user.otp !== code) {
        await prisma.user.update({ where: { id: userId }, data: { otpAttempts: { increment: 1 } } })
        return fail(reply, 400, ErrorCodes.OTP_WRONG, "Noto'g'ri kod")
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
