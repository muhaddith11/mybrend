import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { sendSms } from '../plugins/sms.js'

const sendOtpSchema = z.object({ phone: z.string().min(9) })
const verifyOtpSchema = z.object({ phone: z.string(), code: z.string().length(6) })

export default async function authRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = (app as any).prisma

  app.post('/send-otp', async (req, reply) => {
    const { phone } = sendOtpSchema.parse(req.body)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 daqiqa

    // OTP'ni DB'ga saqlaymiz (serverless'da in-memory ishlamaydi)
    await prisma.user.upsert({
      where: { phone },
      update: { otp: code, otpExpiry: expiry },
      create: { phone, otp: code, otpExpiry: expiry },
    })

    await sendSms(phone, `ZYFF tasdiqlash kodi: ${code}`)
    console.log(`OTP ${phone}: ${code}`)
    return reply.send({ success: true, message: 'Kod yuborildi' })
  })

  app.post('/verify-otp', async (req, reply) => {
    const { phone, code } = verifyOtpSchema.parse(req.body)

    // 000000 — universal test kodi (har doim ishlaydi)
    if (code === '000000') {
      let user = await prisma.user.findUnique({ where: { phone } })
      if (!user) user = await prisma.user.create({ data: { phone } })
      const token = app.jwt.sign({ userId: user.id, phone: user.phone })
      return reply.send({ token, user })
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user || !user.otp || !user.otpExpiry) {
      return reply.status(400).send({ error: "Avval kod so'rang" })
    }
    if (new Date() > user.otpExpiry) {
      return reply.status(400).send({ error: 'Kod muddati tugagan' })
    }
    if (user.otp !== code) {
      return reply.status(400).send({ error: "Noto'g'ri kod" })
    }

    // OTP'ni tozalaymiz
    await prisma.user.update({
      where: { phone },
      data: { otp: null, otpExpiry: null },
    })

    const token = app.jwt.sign({ userId: user.id, phone: user.phone })
    return reply.send({ token, user })
  })

  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'Foydalanuvchi topilmadi' })
    return reply.send(user)
  })

  app.patch('/profile', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const data = z.object({ name: z.string().optional(), avatar: z.string().optional() }).parse(req.body)
    const user = await prisma.user.update({ where: { id: userId }, data })
    return reply.send(user)
  })
}
