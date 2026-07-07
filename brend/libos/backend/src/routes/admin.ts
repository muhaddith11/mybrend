import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { checkLoginThrottle, bumpLoginThrottle, resetLoginThrottle } from '../lib/loginThrottle.js'

// Mavjud bo'lmagan email uchun ham bcrypt.compare chaqiramiz — javob vaqti bir xil
// qolib, user-enumeration (timing attack) imkonsiz bo'lsin.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8DvWlZQ3PqQ9YxLk7Yb5Ym0Qe5Hq2'

// Admin tokeni 12 soat amal qiladi (mijoz tokenidan qisqaroq — egalik darajasi yuqori).
const ADMIN_TOKEN_TTL = '12h'

const loginSchema = z.object({ email: z.string().min(1), password: z.string().min(1) })

const productSchema = z.object({
  sku: z.string().max(50).optional(),
  name: z.string().min(1).max(200),
  nameUz: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  descriptionUz: z.string().max(5000).optional(),
  // DB'da narx `Int` — float kelsa Prisma rad etib 500 berardi, shuning uchun yaxlitlaymiz.
  price: z.number().positive().transform((v) => Math.round(v)),
  originalPrice: z.number().optional().transform((v) => (v === undefined ? undefined : Math.round(v))),
  images: z.array(z.string().max(1000)).max(20).default([]),
  sizes: z.array(z.string().max(50)).max(50).default([]),
  colors: z.array(z.string().max(50)).max(50).default([]),
  categorySlug: z.string().max(50).optional(),
  categoryId: z.string().max(50).optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    quantity: z.number().default(0),
  })).default([]),
})

const storeUpdateSchema = z.object({
  description: z.string().max(2000).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  logo: z.string().max(1000).optional(),
  banner: z.string().max(1000).optional(),
  isOpen: z.boolean().optional(),
  hasDelivery: z.boolean().optional(),
  hasPickup: z.boolean().optional(),
  hasCashOnDoor: z.boolean().optional(),
  deliveryTime: z.number().optional(),
  themeColor: z.string().max(20).optional(),
  themeBg: z.string().max(20).optional(),
  telegramChatId: z.string().max(50).optional(),
  // Bot orqali o'tkazma (TRANSFER) to'lov rekvizitlari
  cardNumber: z.string().max(30).optional(),
  cardHolder: z.string().max(100).optional(),
  paymentQr: z.string().max(1000).optional(),
  instagram: z.string().max(200).optional(),
  telegram: z.string().max(200).optional(),
  workingHours: z.string().max(200).optional(),
  deliveryText: z.string().max(500).optional(),
  lookbook: z.array(z.string().max(1000)).max(40).optional(),
  // Yangi lookbook: har bir look = rasm + shu do'kon mahsulotlari (ID'lar).
  lookbookLooks: z
    .array(
      z.object({
        image: z.string().max(1000),
        productIds: z.array(z.string().max(50)).max(12).default([]),
      })
    )
    .max(40)
    .optional(),
})

// categorySlug'ni kategoriya ID'siga aylantiradi. Avval shu do'konning O'Z
// kategoriyasini qidiradi (storeId mos), topilmasa global (storeId=null) ga tushadi.
// orderBy storeId desc → store-specific (non-null) global'dan oldin keladi.
async function resolveCategoryId(
  prisma: PrismaClient,
  slug: string,
  storeId: string,
): Promise<string | undefined> {
  const cat = await prisma.category.findFirst({
    where: { slug, OR: [{ storeId }, { storeId: null }] },
    orderBy: { storeId: 'desc' },
  })
  return cat?.id
}

export default async function adminRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Do'kon egasi login — parol brute-force'ga qarshi tor IP rate-limit
  // (global 300/min'dan tashqari). Testlarda rate-limit plugini yo'q → e'tiborsiz.
  const loginRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }
  app.post('/login', loginRateLimit, async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body)

    // DB-asosli throttle (serverless'da in-memory rate-limit yetarli emas).
    // Email bo'yicha kalitlaymiz — bitta hisobga brute-force qilishni bloklaydi.
    const throttleKey = `admin:${email.toLowerCase()}`
    const throttle = await checkLoginThrottle(prisma, throttleKey)
    if (!throttle.allowed) {
      return reply.status(429).send({
        error: `Juda ko'p urinish. ${Math.ceil(throttle.retryAfterSec / 60)} daqiqadan keyin qayta urining.`,
      })
    }

    // Env-var based custom credentials (ADMIN_USERNAME + ADMIN_PASSWORD)
    const envUser = process.env.ADMIN_USERNAME
    const envPass = process.env.ADMIN_PASSWORD
    const envSlug = process.env.ADMIN_STORE_SLUG ?? 'asma'
    if (envUser && envPass && email === envUser && password === envPass) {
      try {
        // owner relation kerak emas — store.ownerId ni to'g'ridan ishlatamiz
        const store = await prisma.store.findUnique({ where: { slug: envSlug } })
        if (store) {
          await resetLoginThrottle(prisma, throttleKey)
          const token = app.jwt.sign({ ownerId: store.ownerId, role: 'owner' }, { expiresIn: ADMIN_TOKEN_TTL })
          return reply.send({ token, owner: { id: store.ownerId, name: store.name, email: envUser } })
        }
        // Sozlama xatosi (env do'koni topilmadi) — tafsilot mijozga oshkor qilinmaydi
        app.log.error(`Admin env-login: do'kon topilmadi (slug=${envSlug})`)
        return reply.status(500).send({ error: 'Server xatosi' })
      } catch (e: any) {
        // Ichki xato faqat serverda loglanadi; mijozga umumiy xabar (info leak yo'q)
        app.log.error({ err: e }, 'Admin env-login xatosi')
        return reply.status(500).send({ error: 'Server xatosi' })
      }
    }

    try {
      const owner = await prisma.storeOwner.findUnique({ where: { email } })
      const ok = await bcrypt.compare(password, owner?.password ?? DUMMY_HASH)
      if (!owner || !ok) {
        await bumpLoginThrottle(prisma, throttleKey)
        return reply.status(401).send({ error: "Login yoki parol noto'g'ri" })
      }
      await resetLoginThrottle(prisma, throttleKey)
      const token = app.jwt.sign({ ownerId: owner.id, role: 'owner' }, { expiresIn: ADMIN_TOKEN_TTL })
      return reply.send({ token, owner: { id: owner.id, name: owner.name, email: owner.email } })
    } catch {
      return reply.status(401).send({ error: "Login yoki parol noto'g'ri" })
    }
  })

  // Admin auth middleware
  const adminAuth = async (req: any, reply: any) => {
    try {
      await req.jwtVerify()
      if (!req.user?.ownerId) return reply.status(403).send({ error: 'Admin ruxsati kerak' })
    } catch {
      reply.status(401).send({ error: 'Kirish kerak' })
    }
  }

  // Do'kon ma'lumotlari
  app.get('/store', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: { _count: { select: { products: true, orders: true } } },
    })
    return reply.send(store)
  })

  // Do'konni yangilash
  app.patch('/store', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const data = storeUpdateSchema.parse(req.body)
    const store = await prisma.store.findFirst({ where: { ownerId } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })
    const updated = await prisma.store.update({ where: { id: store.id }, data })
    return reply.send(updated)
  })

  // Mahsulotlar ro'yxati
  app.get('/products', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const store = await prisma.store.findFirst({ where: { ownerId } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
      take: 500, // cheksiz yuklanishni oldini olish (eng yangi 500)
    })
    return reply.send(products)
  })

  // Mahsulot qo'shish
  app.post('/products', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const store = await prisma.store.findFirst({ where: { ownerId } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })
    const { variants, categorySlug, categoryId: catId, ...data } = productSchema.parse(req.body)
    let resolvedCategoryId = catId
    if (!resolvedCategoryId && categorySlug) {
      resolvedCategoryId = await resolveCategoryId(prisma, categorySlug, store.id)
    }
    const product = await prisma.product.create({
      data: { ...data, storeId: store.id, categoryId: resolvedCategoryId, variants: { create: variants } },
      include: { category: true, variants: true },
    })
    return reply.status(201).send(product)
  })

  // Mahsulot tahrirlash
  app.put('/products/:id', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const { id } = req.params as { id: string }
    const { variants, categorySlug, categoryId: catId, ...data } = productSchema.parse(req.body)
    const product = await prisma.product.findFirst({
      where: { id, store: { ownerId } },
    })
    if (!product) return reply.status(404).send({ error: 'Mahsulot topilmadi' })
    let resolvedCategoryId = catId
    if (!resolvedCategoryId && categorySlug) {
      resolvedCategoryId = await resolveCategoryId(prisma, categorySlug, product.storeId)
    }
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    const updated = await prisma.product.update({
      where: { id },
      data: { ...data, categoryId: resolvedCategoryId, variants: { create: variants } },
      include: { category: true, variants: true },
    })
    return reply.send(updated)
  })

  // Mahsulot o'chirish
  app.delete('/products/:id', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const { id } = req.params as { id: string }
    const product = await prisma.product.findFirst({ where: { id, store: { ownerId } } })
    if (!product) return reply.status(404).send({ error: 'Topilmadi' })
    await prisma.product.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // Buyurtmalar
  app.get('/orders', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const store = await prisma.store.findFirst({ where: { ownerId } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })
    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        items: { include: { product: { select: { id: true, name: true, nameUz: true, sku: true, price: true } } } },
        user: { select: { phone: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200, // eng yangi 200 buyurtma (cheksiz yuklanmasin; statistika alohida aggregate)
    })
    return reply.send(orders)
  })

  // Buyurtma statusini yangilash
  app.patch('/orders/:id/status', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const { id } = req.params as { id: string }
    const { status } = z.object({ status: z.enum(['CONFIRMED','PREPARING','DELIVERING','DELIVERED','CANCELLED']) }).parse(req.body)
    const order = await prisma.order.findFirst({ where: { id, store: { ownerId } } })
    if (!order) return reply.status(404).send({ error: 'Topilmadi' })
    const updated = await prisma.order.update({ where: { id }, data: { status } })
    return reply.send(updated)
  })

  // Kategoriyalar — global (storeId=null) + shu do'konning o'z kategoriyalari.
  // Boshqa do'konlarning maxsus kategoriyalari ko'rinmaydi.
  app.get('/categories', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const store = await prisma.store.findFirst({ where: { ownerId } })
    const cats = await prisma.category.findMany({
      where: { OR: [{ storeId: null }, ...(store ? [{ storeId: store.id }] : [])] },
      orderBy: { name: 'asc' },
    })
    return reply.send(cats)
  })

  // Statistika
  app.get('/stats', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const store = await prisma.store.findFirst({ where: { ownerId } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })

    const [totalOrders, pendingOrders, deliveredOrders, totalRevenue, productCount] = await Promise.all([
      prisma.order.count({ where: { storeId: store.id } }),
      prisma.order.count({ where: { storeId: store.id, status: 'PENDING' } }),
      prisma.order.count({ where: { storeId: store.id, status: 'DELIVERED' } }),
      prisma.order.aggregate({ where: { storeId: store.id, status: 'DELIVERED' }, _sum: { totalPrice: true } }),
      prisma.product.count({ where: { storeId: store.id } }),
    ])

    return reply.send({
      totalOrders, pendingOrders, deliveredOrders,
      totalRevenue: totalRevenue._sum.totalPrice ?? 0,
      productCount,
    })
  })
}
