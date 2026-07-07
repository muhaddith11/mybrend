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

  // YANGI: Supabase Storage'ga rasm yuklash (Cloudinary geo-blok bo'lgan davlatlar
  // uchun). Mobil ilova faylni multipart bilan yuboradi; server service-key bilan
  // Supabase'ga yozadi va public URL qaytaradi. Bucket PUBLIC bo'lishi shart.
  const EXT_BY_MIME: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/heic': 'heic', 'image/gif': 'gif',
  }
  app.post('/upload', { preHandler: [authUserOrOwner] }, async (req, reply) => {
    // Env qiymatini tozalaymiz: BOM (﻿), bo'sh joy, va xato bilan qo'shilgan
    // "NAME = " prefiksi (Vercel'ga butun qatorni nusxa-joylashtirganda tushadi) —
    // aks holda `new URL()`/Supabase yiqilib rasm yuklash 500 berardi.
    const cleanEnv = (s?: string) =>
      s?.replace(/^﻿/, '').trim().replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '').trim()
    let supabaseUrl = cleanEnv(process.env.SUPABASE_URL)?.replace(/\/$/, '')
    // Protokol tushib qolgan bo'lsa (masalan "abc.supabase.co") qo'shamiz.
    if (supabaseUrl && !/^https?:\/\//i.test(supabaseUrl)) supabaseUrl = `https://${supabaseUrl}`
    const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
    // Supabase'dagi mavjud public bucket nomi. Boshqasi kerak bo'lsa SUPABASE_BUCKET env bilan almashtiriladi.
    const bucket = cleanEnv(process.env.SUPABASE_BUCKET) || 'products'
    if (!supabaseUrl || !serviceKey) {
      return reply.status(503).send({ error: 'Rasm xizmati sozlanmagan (SUPABASE_URL/KEY yo\'q)' })
    }
    // URL yaroqli bo'lsin — aks holda pastdagi fetch ushlanmagan istisno berardi.
    let origin: string
    try {
      origin = new URL(supabaseUrl).origin
    } catch {
      return reply.status(503).send({ error: 'SUPABASE_URL yaroqsiz' })
    }

    try {
      const file = await (req as any).file()
      if (!file) return reply.status(400).send({ error: 'Fayl topilmadi' })

      const buffer = await file.toBuffer()
      const mime: string = file.mimetype || 'image/jpeg'
      if (!mime.startsWith('image/')) {
        return reply.status(400).send({ error: 'Faqat rasm yuklash mumkin' })
      }
      const ext = EXT_BY_MIME[mime] ?? 'jpg'
      const rand = Math.random().toString(36).slice(2, 10)
      const path = `uploads/${Date.now()}-${rand}.${ext}`

      const up = await fetch(`${origin}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          // Supabase'ning yangi (sb_secret_...) va eski (service_role JWT) kalit
          // tizimlari ikkalasi bilan ham ishlashi uchun apikey ham yuboramiz.
          apikey: serviceKey,
          'Content-Type': mime,
          'cache-control': '3600',
          'x-upsert': 'true',
        },
        body: buffer,
      })
      if (!up.ok) {
        const txt = await up.text().catch(() => '')
        app.log.error(`Supabase upload xato (${up.status}): ${txt}`)
        // Sababni mijozga qisqa ko'rsatamiz (bucket yo'q / public emas / kalit xato).
        const hint = up.status === 404 ? 'bucket topilmadi'
          : up.status === 400 ? 'bucket/so\'rov xato'
          : up.status === 401 || up.status === 403 ? 'kalit yoki ruxsat xato'
          : `Supabase ${up.status}`
        return reply.status(502).send({ error: `Rasmni yuklab bo'lmadi (${hint})`, debug: `${up.status}:${txt.slice(0, 200)}`, bucket })
      }

      const url = `${origin}/storage/v1/object/public/${bucket}/${path}`
      return reply.send({ url, secure_url: url })
    } catch (err: any) {
      // Fayl juda katta (multipart limiti) yoki tarmoq xatosi — 500 emas, toza xabar.
      if (err?.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({ error: 'Rasm hajmi juda katta (maks 6MB)' })
      }
      app.log.error(err)
      return reply.status(502).send({ error: "Rasmni yuklab bo'lmadi (server)" })
    }
  })
}
