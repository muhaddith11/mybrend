import type { FastifyInstance } from 'fastify'
import { createHash } from 'crypto'

function cloudinarySign(params: Record<string, string>, apiSecret: string) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(str + apiSecret).digest('hex')
}

export default async function uploadRoutes(app: FastifyInstance) {
  // Cloudinary signed upload parametrlarini berish
  // Rasm faylni to'g'ridan to'g'ri Cloudinary'ga yuboradi — server orqali o'tmaydi
  app.get('/upload/sign', { preHandler: [app.authenticate] }, async (req, reply) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return reply.status(503).send({ error: 'Cloudinary sozlanmagan' })
    }

    const timestamp = String(Math.round(Date.now() / 1000))
    const folder = 'libos'
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
