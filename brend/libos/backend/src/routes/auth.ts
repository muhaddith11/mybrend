import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { sendSms } from '../plugins/sms.js'

const sendOtpSchema = z.object({ phone: z.string().min(9) })
const verifyOtpSchema = z.object({ phone: z.string(), code: z.string().length(6) })

// Hozircha demo OTP — keyinroq SMS gateway qo'shiladi
const otpStore = new Map<string, string>()

export default async function authRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = (app as any).prisma

  app.post('/send-otp', async (req, reply) => {
    const { phone } = sendOtpSchema.parse(req.body)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(phone, code)
    await sendSms(phone, `ZYFF tasdiqlash kodi: ${code}`)
    console.log(`OTP ${phone} uchun: ${code}`)
    return reply.send({ success: true, message: 'Kod yuborildi' })
  })

  app.post('/verify-otp', async (req, reply) => {
    const { phone, code } = verifyOtpSchema.parse(req.body)
    const saved = otpStore.get(phone)
    // Development da 000000 har doim ishlaydi
    const isDev = process.env.NODE_ENV !== 'production'
    if (saved !== code && !(isDev && code === '000000')) {
      return reply.status(400).send({ error: 'Noto\'g\'ri kod' })
    }
    otpStore.delete(phone)

    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) user = await prisma.user.create({ data: { phone } })

    const token = app.jwt.sign({ userId: user.id, phone: user.phone })
    return reply.send({ token, user })
  })

  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'Foydalanuvchi topilmadi' })
    return reply.send(user)
  })
}
