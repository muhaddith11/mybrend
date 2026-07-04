import type { FastifyInstance } from 'fastify'
import { createHash } from 'crypto'

export function cloudinarySign(params: Record<string, string>, apiSecret: string) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(str + apiSecret).digest('hex')
}

export default async function uploadRoutes(app: FastifyInstance) {
  // Foydalanuvchi (userId) YOKI do'kon egasi (ownerId) tokeni — ikkalasi ham
  // rasm yuklashi mumkin (mijoz avatar/chek, ega mahsulot rasmi). /upload/sign
  // faqat Cloudinary imzo parametrlarini qaytaradi (maxfiy ma'lumot yo'q).
  const authUserOrOwner = async (req: any, reply: any) => {
    try {
      await req.jwtVerify()
      if (!req.user?.userId && !req.user?.ownerId) {
        return reply.status(401).send({ error: 'Kirish kerak' })
      }
    } catch {
      reply.status(401).send({ error: 'Kirish kerak' })
    }
  }

  // Cloudinary signed upload parametrlarini berish
  // Rasm faylni to'g'ridan to'g'ri Cloudinary'ga yuboradi — server orqali o'tmaydi
  app.get('/upload/sign', { preHandler: [authUserOrOwner] }, async (req, reply) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return reply.status(503).send({ error: 'Cloudinary sozlanmagan' })
    }

    const timestamp = String(Math.round(Date.now() / 1000))
    // Yangi rasmlar `zyff/` papkasiga yuklanadi. Eski `libos/` papkasidagi rasmlar
    // to'liq URL bilan saqlangani uchun ishlashda davom etadi (ko'chirish shart emas).
    const folder = process.env.CLOUDINARY_FOLDER ?? 'zyff'
    const signature = cloudinarySign({ timestamp, folder }, apiSecret)

    return reply.send({
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    })
  })
}
