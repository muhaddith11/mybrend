import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

function hash(p: string) { return createHash('sha256').update(p).digest('hex') }

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string()).default([]),
  categoryId: z.string(),
  inStock: z.boolean().default(true),
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
  isOpen: z.boolean().optional(),
  hasDelivery: z.boolean().optional(),
  hasPickup: z.boolean().optional(),
  hasCashOnDoor: z.boolean().optional(),
  deliveryTime: z.number().optional(),
  themeColor: z.string().optional(),
  themeBg: z.string().optional(),
})

export default async function adminRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = (app as any).prisma

  // Do'kon egasi login
  app.post('/login', async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body)
    const owner = await prisma.storeOwner.findUnique({ where: { email } })
    if (!owner || owner.password !== hash(password)) {
      return reply.status(401).send({ error: 'Email yoki parol noto\'g\'ri' })
    }
    const token = app.jwt.sign({ ownerId: owner.id, role: 'owner' })
    return reply.send({ token, owner: { id: owner.id, name: owner.name, email: owner.email } })
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
    const { variants, ...data } = productSchema.parse(req.body)
    const product = await prisma.product.create({
      data: { ...data, storeId: store.id, variants: { create: variants } },
      include: { category: true, variants: true },
    })
    return reply.status(201).send(product)
  })

  // Mahsulot tahrirlash
  app.put('/products/:id', { preHandler: [adminAuth] }, async (req, reply) => {
    const { ownerId } = req.user as { ownerId: string }
    const { id } = req.params as { id: string }
    const { variants, ...data } = productSchema.parse(req.body)
    const product = await prisma.product.findFirst({
      where: { id, store: { ownerId } },
    })
    if (!product) return reply.status(404).send({ error: 'Mahsulot topilmadi' })
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    const updated = await prisma.product.update({
      where: { id },
      data: { ...data, variants: { create: variants } },
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
        items: { include: { product: { select: { name: true } } } },
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
