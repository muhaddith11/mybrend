import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient, DeliveryType } from '@prisma/client'
import { sendOrderNotification } from '../plugins/telegram'
import { decrementStock, restoreStock, InsufficientStockError } from '../lib/stock.js'
import { phoneSchema } from '../lib/phone.js'
import { buildClickPaymentUrl } from './payment/click.js'
import { buildPaymePaymentUrl } from './payment/payme.js'
import { buildBotPaymentUrl } from '../plugins/telegram.js'

// Auth'siz guest buyurtma — bitta IP'dan soxta buyurtma bilan stokni tushirib
// yuborish (inventar DoS) oldini olish uchun tor chegara. (Testlarda e'tiborsiz.)
const guestOrderRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }

// Yetkazib berish narxi (asosiy marketplace checkout uchun). Do'kon sahifalaridagi
// (guest) buyurtmalar bepul, shuning uchun bu faqat auth'li `/` route'iga qo'shiladi.
// Frontend ham shu qiymatni ko'rsatadi — moslik uchun env'dan boshqarish mumkin.
const DELIVERY_FEE = Number(process.env.DELIVERY_FEE ?? 15000)

// Double-submit oynasi: shu vaqt ichidagi bir xil PENDING buyurtma dublikat hisoblanadi.
const DEDUP_WINDOW_MS = 20_000

// So'nggi DEDUP_WINDOW_MS ichida shu user+do'kon+summa bilan yaratilgan PENDING
// buyurtmani topadi (bo'lsa). Buyurtma to'liq shaklda (items+store) qaytadi — chunki
// auth handler javobni shu shaklda kutadi.
function findRecentDuplicate(
  prisma: PrismaClient,
  userId: string,
  storeId: string,
  totalPrice: number,
) {
  return prisma.order.findFirst({
    where: {
      userId,
      storeId,
      totalPrice,
      status: 'PENDING',
      createdAt: { gt: new Date(Date.now() - DEDUP_WINDOW_MS) },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true } },
      store: { select: { id: true, name: true, slug: true, logo: true, themeColor: true, telegramChatId: true } },
    },
  })
}

// Erkin matn maydonlariga uzunlik chegarasi — cheksiz kiritish DB'ni shishirishi
// yoki Telegram xabar limitini buzib bildirishnomani yo'qotishi mumkin.
const itemSchema = z.object({
  productId: z.string().max(50),
  quantity: z.number().int().min(1).max(1000),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
})

const createOrderSchema = z.object({
  storeId: z.string().max(50),
  deliveryType: z.enum(['DELIVERY', 'PICKUP', 'CASH_ON_DOOR']),
  address: z.string().max(500).optional(),
  // Xaritadan tanlangan joylashuv (ixtiyoriy) — Order modelda lat/lng ustunlari bor
  lat: z.number().optional(),
  lng: z.number().optional(),
  note: z.string().max(1000).optional(),
  // Online to'lov tanlangan bo'lsa — javobda paymentUrl (Click/Payme) yoki
  // botUrl (TRANSFER — bot orqali karta/QR o'tkazma) qaytadi.
  paymentProvider: z.enum(['CLICK', 'PAYME', 'TRANSFER']).optional(),
  items: z.array(itemSchema).min(1).max(100),
})

const guestOrderSchema = z.object({
  storeSlug: z.string().max(100),
  customerName: z.string().min(1).max(100),
  phone: phoneSchema,
  // Yetkazib berish yoki olib ketish (default — yetkazib berish, eski mosligi uchun)
  deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
  address: z.string().max(500).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  note: z.string().max(1000).optional(),
  paymentMethod: z.string().max(20).default('cash'),
  items: z.array(itemSchema).min(1).max(100),
})

const storeInclude = {
  select: { id: true, name: true, slug: true, logo: true, themeColor: true },
}

export default async function ordersRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Mehmon (guest) buyurtma — ro'yxatdan o'tmagan mijozlar uchun
  app.post('/guest', guestOrderRateLimit, async (req, reply) => {
    const body = guestOrderSchema.parse(req.body)

    const store = await prisma.store.findUnique({ where: { slug: body.storeSlug } })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })

    // Do'kon olib ketishni qo'llab-quvvatlamasa, PICKUP buyurtmani rad etamiz
    // (UI ham yashiradi, lekin backend ham himoyalanadi).
    if (body.deliveryType === 'PICKUP' && !store.hasPickup) {
      return reply.status(400).send({ error: "Bu do'kon olib ketishni qo'llab-quvvatlamaydi" })
    }

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

    // Idempotentlik (double-submit himoyasi): ikki marta bosish yoki tarmoq qayta-
    // urinishi 2 ta buyurtma + ikki barobar stok kamayishiga olib kelmasin. So'nggi
    // DEDUP_WINDOW_MS ichida shu user+do'kon+summa bilan PENDING buyurtma bo'lsa,
    // yangisini yaratmay, mavjudini qaytaramiz.
    const dup = await findRecentDuplicate(prisma, user.id, store.id, totalPrice)
    if (dup) {
      let paymentUrl: string | undefined
      let botUrl: string | undefined
      if (body.paymentMethod === 'click') paymentUrl = buildClickPaymentUrl(dup)
      else if (body.paymentMethod === 'payme') paymentUrl = buildPaymePaymentUrl(dup)
      else if (body.paymentMethod === 'transfer') botUrl = buildBotPaymentUrl(dup.id)
      return reply.status(201).send({ ok: true, orderId: dup.id, paymentUrl, botUrl })
    }

    // Buyurtma yaratish va stok kamaytirish — bitta atomik tranzaksiyada.
    // Avval stokni kamaytiramiz: yetmasa InsufficientStockError tashlanadi,
    // tranzaksiya rollback bo'ladi va buyurtma umuman yaratilmaydi (overselling yo'q).
    let order
    try {
      order = await prisma.$transaction(async (tx) => {
        await decrementStock(tx, body.items)
        return tx.order.create({
          data: {
            userId: user.id,
            storeId: store.id,
            deliveryType: body.deliveryType as DeliveryType,
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
      })
    } catch (e) {
      if (e instanceof InsufficientStockError) {
        return reply.status(400).send({ error: "Kechirasiz, tanlangan mahsulotlardan ba'zilari hozir yetarli emas" })
      }
      throw e
    }

    // Telegram xabari — buyurtmani bloklamaydi (fire-and-forget), lekin xato
    // bo'lsa jimgina yutilmaydi, logga yoziladi (kuzatib turish uchun).
    sendOrderNotification({
      ...order,
      chatId: order.store.telegramChatId,
      user: { phone, name: body.customerName },
    }).catch((err) => req.log.error({ err, orderId: order.id }, 'Telegram buyurtma xabari yuborilmadi'))

    // Online to'lov tanlangan bo'lsa — to'lov sahifasi URL'ini qaytaramiz.
    // Mijoz shu manzilga yo'naltiriladi; tasdiqlash provayder webhook'i orqali keladi.
    let paymentUrl: string | undefined
    let botUrl: string | undefined
    if (body.paymentMethod === 'click') paymentUrl = buildClickPaymentUrl(order)
    else if (body.paymentMethod === 'payme') paymentUrl = buildPaymePaymentUrl(order)
    else if (body.paymentMethod === 'transfer') botUrl = buildBotPaymentUrl(order.id)

    return reply.status(201).send({ ok: true, orderId: order.id, paymentUrl, botUrl })
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

    const itemsTotal = body.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (product?.price ?? 0) * item.quantity
    }, 0)
    // Yetkazib berish narxi summaga kiritiladi — ko'rsatilgan va to'lanadigan
    // summa bir xil bo'lsin (online to'lov webhook'i ham shu totalPrice'ni tekshiradi).
    const deliveryFee = body.deliveryType === 'DELIVERY' ? DELIVERY_FEE : 0
    const totalPrice = itemsTotal + deliveryFee

    // Double-submit himoyasi (guest bilan bir xil) — dublikat buyurtma yaratilmasin.
    const dup = await findRecentDuplicate(prisma, userId, body.storeId, totalPrice)
    if (dup) {
      let paymentUrl: string | undefined
      let botUrl: string | undefined
      if (body.paymentProvider === 'CLICK') paymentUrl = buildClickPaymentUrl(dup)
      else if (body.paymentProvider === 'PAYME') paymentUrl = buildPaymePaymentUrl(dup)
      else if (body.paymentProvider === 'TRANSFER') botUrl = buildBotPaymentUrl(dup.id)
      return reply.status(201).send({ ...dup, paymentUrl, botUrl })
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true, name: true } })

    // Buyurtma + stok — bitta atomik tranzaksiyada (qisman yozuv bo'lmasin).
    // Avval stok kamaytiriladi: yetmasa rollback + 400 (overselling oldini olish).
    let order
    try {
      order = await prisma.$transaction(async (tx) => {
        await decrementStock(tx, body.items)
        return tx.order.create({
          data: {
            userId,
            storeId: body.storeId,
            deliveryType: body.deliveryType as DeliveryType,
            paymentMethod: body.paymentProvider?.toLowerCase() ?? 'cash',
            address: body.address,
            lat: body.lat,
            lng: body.lng,
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
      })
    } catch (e) {
      if (e instanceof InsufficientStockError) {
        return reply.status(400).send({ error: "Kechirasiz, tanlangan mahsulotlardan ba'zilari hozir yetarli emas" })
      }
      throw e
    }

    // Telegram xabari — fire-and-forget, xato logga yoziladi
    sendOrderNotification({
      ...order,
      chatId: order.store.telegramChatId,
      user: user ?? { phone: 'Noma\'lum', name: null },
    }).catch((err) => req.log.error({ err, orderId: order.id }, 'Telegram buyurtma xabari yuborilmadi'))

    // Online to'lov tanlangan bo'lsa — to'lov sahifasi URL'ini qaytaramiz.
    // Click/Payme: provayder webhook'i tasdiqlaydi. TRANSFER: mijoz botga o'tadi,
    // do'kon egasi chekni qo'lda tasdiqlaydi (telegram webhook).
    let paymentUrl: string | undefined
    let botUrl: string | undefined
    if (body.paymentProvider === 'CLICK') paymentUrl = buildClickPaymentUrl(order)
    else if (body.paymentProvider === 'PAYME') paymentUrl = buildPaymePaymentUrl(order)
    else if (body.paymentProvider === 'TRANSFER') botUrl = buildBotPaymentUrl(order.id)

    return reply.status(201).send({ ...order, paymentUrl, botUrl })
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

  // Mehmon buyurtma kuzatuvi — AUTH'SIZ, lekin buyurtma ID (cuid) maxfiy kalit
  // vazifasini bajaradi (taxmin qilib bo'lmaydi). Mijoz checkout'da olgan havola
  // orqali faqat O'Z buyurtmasini ko'radi. Telefon/foydalanuvchi ma'lumoti
  // (telegramChatId, lat/lng) qaytarilmaydi — faqat holat sahifasiga kerakli maydonlar.
  app.get('/track/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        deliveryType: true,
        paymentMethod: true,
        totalPrice: true,
        address: true,
        customerName: true,
        note: true,
        createdAt: true,
        items: {
          select: {
            id: true, quantity: true, price: true, size: true, color: true,
            product: { select: { id: true, name: true, nameUz: true, images: true } },
          },
        },
        store: { select: { name: true, slug: true, logo: true, themeColor: true } },
      },
    })
    if (!order) return reply.status(404).send({ error: 'Buyurtma topilmadi' })
    return reply.send(order)
  })

  // ─── Eskirgan to'lanmagan buyurtmalarni tozalash (cron) ──────────────────────
  // Stok buyurtma YARATILGANDA kamayadi. Online to'lov (click/payme) tanlangan,
  // lekin mijoz to'lamay chiqib ketsa — buyurtma PENDING qoladi va stok abadiy
  // band bo'lib qolardi. Bu endpoint shunday eskirgan buyurtmalarni bekor qilib
  // stokni qaytaradi. Naqd (cash) buyurtmalar TEGILMAYDI — ular yetkazishni kutadi.
  //
  // Vercel Cron yoki tashqi scheduler chaqiradi. CRON_SECRET bilan himoyalangan:
  // `Authorization: Bearer <CRON_SECRET>` (Vercel cron shu sarlavhani yuboradi).
  const STALE_AFTER_MS = Number(process.env.STALE_ORDER_MINUTES ?? 30) * 60 * 1000
  app.get('/cleanup-stale', async (req, reply) => {
    const secret = process.env.CRON_SECRET
    const auth = req.headers.authorization ?? ''
    if (!secret || auth !== `Bearer ${secret}`) {
      return reply.status(401).send({ error: 'Ruxsat yo\'q' })
    }

    const cutoff = new Date(Date.now() - STALE_AFTER_MS)
    const stale = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentMethod: { in: ['click', 'payme', 'transfer'] },
        createdAt: { lt: cutoff },
        OR: [{ payment: null }, { payment: { status: { not: 'PAID' } } }],
      },
      select: { id: true },
      take: 200, // bitta yurishda ko'pi bilan 200 ta (cheksiz ish bo'lmasin)
    })

    let cancelled = 0
    for (const { id } of stale) {
      try {
        await prisma.$transaction(async (tx) => {
          // Poyga himoyasi: tranzaksiya ichida holatni qayta tekshiramiz —
          // shu orada to'langan (PAID) bo'lsa, tegmaymiz.
          const fresh = await tx.order.findUnique({ where: { id }, include: { payment: true } })
          if (!fresh || fresh.status !== 'PENDING') return
          if (fresh.payment?.status === 'PAID') return

          await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } })
          if (fresh.payment) {
            await tx.payment.update({ where: { id: fresh.payment.id }, data: { status: 'CANCELLED' } })
          }
          await restoreStock(tx, id)
        })
        cancelled++
      } catch (err) {
        req.log.error({ err, orderId: id }, 'Stale buyurtmani tozalashda xato')
      }
    }

    return reply.send({ ok: true, scanned: stale.length, cancelled })
  })
}
