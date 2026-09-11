import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

// Expo push token shakli: ExponentPushToken[xxxxxxxx] (eski nomi ExpoPushToken[...]).
// Tekshiruv — DB'ga axlat token yozilib, har safar bekorga so'rov ketmasligi uchun.
const pushTokenSchema = z.object({
  token: z.string().regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, "Noto'g'ri push token"),
  platform: z.enum(['ios', 'android']),
  // Bildirishnoma matni shu tilda render qilinadi (server mijozning UI tilini
  // boshqa yo'l bilan bilmaydi). Yuborilmasa — foydalanuvchidagi til o'zgarmaydi.
  lang: z.enum(['uz', 'ru', 'en']).optional(),
})

const unregisterSchema = z.object({
  token: z.string().max(200),
})

// Ro'yxat bir marta ko'pi bilan shuncha yozuv qaytaradi (cheksiz yuklanmasin).
const LIST_LIMIT = 50

export default async function notificationRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Qurilmani ro'yxatdan o'tkazish. Token unikal: bitta qurilma boshqa hisobga
  // kirsa, token yangi egasiga KO'CHADI — eski hisobga push ketib qolmaydi.
  app.post('/push-token', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { token, platform, lang } = pushTokenSchema.parse(req.body)

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { token, platform, userId },
    })

    if (lang) await prisma.user.update({ where: { id: userId }, data: { lang } })

    return reply.send({ success: true })
  })

  // Chiqishda (logout) qurilmani o'chirish. Faqat O'Z tokenini o'chira oladi.
  app.delete('/push-token', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { token } = unregisterSchema.parse(req.body)

    await prisma.pushToken.deleteMany({ where: { token, userId } })
    return reply.send({ success: true })
  })

  app.get('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
    })
    return reply.send({ notifications })
  })

  app.get('/unread-count', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const count = await prisma.notification.count({ where: { userId, read: false } })
    return reply.send({ count })
  })

  // `updateMany` + userId sharti — boshqaning bildirishnomasini o'qilgan qilib
  // bo'lmaydi va mavjud emasligi ham oshkor bo'lmaydi (shunchaki 0 ta yangilanadi).
  app.post('/:id/read', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { id } = req.params as { id: string }

    await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } })
    return reply.send({ success: true })
  })

  app.post('/read-all', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
    return reply.send({ success: true })
  })
}
