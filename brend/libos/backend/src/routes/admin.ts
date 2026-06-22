import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Mavjud bo'lmagan email uchun ham bcrypt.compare chaqiramiz — javob vaqti bir xil
// qolib, user-enumeration (timing attack) imkonsiz bo'lsin.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8DvWlZQ3PqQ9YxLk7Yb5Ym0Qe5Hq2'

const loginSchema = z.object({ email: z.string().min(1), password: z.string().min(1) })

const productSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1),
  nameUz: z.string().optional(),
  description: z.string().optional(),
  descriptionUz: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  categorySlug: z.string().optional(),
  categoryId: z.string().optional(),
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
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  isOpen: z.boolean().optional(),
  hasDelivery: z.boolean().optional(),
  hasPickup: z.boolean().optional(),
  hasCashOnDoor: z.boolean().optional(),
  deliveryTime: z.number().optional(),
  themeColor: z.string().optional(),
  themeBg: z.string().optional(),
  telegramChatId: z.string().optional(),
  instagram: z.string().optional(),
  workingHours: z.string().optional(),
  deliveryText: z.string().optional(),
})

export default async function adminRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Do'kon egasi login — parol brute-force'ga qarshi tor IP rate-limit
  // (global 300/min'dan tashqari). Testlarda rate-limit plugini yo'q → e'tiborsiz.
  const loginRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }
  app.post('/login', loginRateLimit, async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body)

    // Env-var based custom credentials (ADMIN_USERNAME + ADMIN_PASSWORD)
    const envUser = process.env.ADMIN_USERNAME
    const envPass = process.env.ADMIN_PASSWORD
    const envSlug = process.env.ADMIN_STORE_SLUG ?? 'asma'
    if (envUser && envPass && email === envUser && password === envPass) {
      try {
        // owner relation kerak emas — store.ownerId ni to'g'ridan ishlatamiz
        const store = await prisma.store.findUnique({ where: { slug: envSlug } })
        if (store) {
          const token = app.jwt.sign({ ownerId: store.ownerId, role: 'owner' })
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
        return reply.status(401).send({ error: "Login yoki parol noto'g'ri" })
      }
      const token = app.jwt.sign({ ownerId: owner.id, role: 'owner' })
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
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
      resolvedCategoryId = cat?.id
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
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
      resolvedCategoryId = cat?.id
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

  // Kategoriyalar
  app.get('/categories', { preHandler: [adminAuth] }, async (req, reply) => {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
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
