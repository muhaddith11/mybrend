import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient, DeliveryType } from '@prisma/client'
import { sendOrderNotification } from '../plugins/telegram'

const createOrderSchema = z.object({
  storeId: z.string(),
  deliveryType: z.enum(['DELIVERY', 'PICKUP', 'CASH_ON_DOOR']),
  address: z.string().optional(),
  note: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
  })),
})

const guestOrderSchema = z.object({
  storeSlug: z.string(),
  customerName: z.string().min(1),
  phone: z.string().min(7),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  note: z.string().optional(),
  paymentMethod: z.string().default('cash'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
  })),
})

const storeInclude = {
  select: { id: true, name: true, slug: true, logo: true, themeColor: true },
}

type OrderLine = { productId: string; quantity: number; size?: string; color?: string }

// Buyurtma qatorlariga mos variant stokini kamaytiradi (best-effort).
// Mos variant topilib, stoki bor bo'lsagina kamaytiramiz va hech qachon manfiyga
// tushirmaymiz. Variant topilmasa (admin miqdor kiritmagan) — buyurtmani bloklamaymiz.
async function decrementStock(prisma: PrismaClient, items: OrderLine[]) {
  for (const it of items) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        productId: it.productId,
        size: it.size ?? null,
        color: it.color ?? null,
        quantity: { gt: 0 },
      },
    })
    if (!variant) continue
    const dec = Math.min(variant.quantity, it.quantity) // manfiyga tushmasin
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { quantity: { decrement: dec } },
    })
  }
}

export default async function ordersRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Mehmon (guest) buyurtma — ro'yxatdan o'tmagan mijozlar uchun
  app.post('/guest', async (req, reply) => {
    const body = guestOrderSchema.parse(req.body)

    const store = await prisma.store.findUnique({ where: { slug: body.storeSlug } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })

    const productIds = body.items.map(i => i.productId)
    // Faqat shu do'konning mahsulotlari — boshqa do'kon yoki mavjud bo'lmagan ID jimgina 0 narx bermasin
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, storeId: store.id } })
    const foundIds = new Set(products.map(p => p.id))
    const invalid = productIds.filter(id => !foundIds.has(id))
    if (invalid.length) {
      return reply.status(400).send({ error: "Buyurtmada noto'g'ri yoki boshqa do'kon mahsuloti bor" })
    }

    // Telefon bo'yicha user topamiz yoki yaratamiz
    const phone = body.phone.replace(/\s/g, '')
    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      user = await prisma.user.create({ data: { phone, name: body.customerName } })
    }

    const totalPrice = body.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (product?.price ?? 0) * item.quantity
    }, 0)

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        storeId: store.id,
        deliveryType: 'DELIVERY' as DeliveryType,
        customerName: body.customerName,
        address: body.address,
        lat: body.lat,
        lng: body.lng,
        note: body.note,
        paymentMethod: body.paymentMethod,
        totalPrice,
        items: {
          create: body.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: products.find(p => p.id === item.productId)?.price ?? 0,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        store: { select: { id: true, name: true, slug: true, logo: true, themeColor: true, telegramChatId: true } },
      },
    })

    // Stokni kamaytiramiz (best-effort — xato bo'lsa buyurtma baribir o'tadi)
    await decrementStock(prisma, body.items).catch(() => {})

    sendOrderNotification({
      ...order,
      chatId: order.store.telegramChatId,
      user: { phone, name: body.customerName },
    }).catch(() => {})

    return reply.status(201).send({ ok: true, orderId: order.id })
  })

  // Buyurtma yaratish (auth kerak)
  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const body = createOrderSchema.parse(req.body)

    const productIds = body.items.map(i => i.productId)
    // Mahsulotlar shu do'konga tegishli va hammasi mavjud bo'lishi shart
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, storeId: body.storeId } })
    const foundIds = new Set(products.map(p => p.id))
    const invalid = productIds.filter(id => !foundIds.has(id))
    if (invalid.length) {
      return reply.status(400).send({ error: "Buyurtmada noto'g'ri yoki boshqa do'kon mahsuloti bor" })
    }

    const totalPrice = body.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (product?.price ?? 0) * item.quantity
    }, 0)

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true, name: true } })

    const order = await prisma.order.create({
      data: {
        userId,
        storeId: body.storeId,
        deliveryType: body.deliveryType as DeliveryType,
        address: body.address,
        note: body.note,
        totalPrice,
        items: {
          create: body.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: products.find(p => p.id === item.productId)?.price ?? 0,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        store: { select: { id: true, name: true, slug: true, logo: true, themeColor: true, telegramChatId: true } },
      },
    })

    // Stokni kamaytiramiz (best-effort)
    await decrementStock(prisma, body.items).catch(() => {})

    sendOrderNotification({
      ...order,
      chatId: order.store.telegramChatId,
      user: user ?? { phone: 'Noma\'lum', name: null },
    }).catch(() => {})

    return reply.status(201).send(order)
  })

  // Foydalanuvchi buyurtmalari
  app.get('/my', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        store: storeInclude,
      },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ orders })
  })

  // Buyurtma holati
  app.get('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { id } = req.params as { id: string }
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { product: true } },
        store: storeInclude,
      },
    })
    if (!order) return reply.status(404).send({ error: 'Buyurtma topilmadi' })
    return reply.send(order)
  })
}
