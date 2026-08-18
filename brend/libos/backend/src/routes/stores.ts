import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { fail, ErrorCodes } from '../lib/apiError.js'
import { PrismaClient, Gender } from '@prisma/client'

const genderQuery = z.object({
  gender: z.enum(['MEN', 'WOMEN', 'KIDS']).optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

// Mijozga HECH QACHON chiqmasligi kerak bo'lgan do'kon maydonlari. Bular faqat
// autentifikatsiyalangan `GET /admin/store` orqali egasining o'ziga beriladi.
const SECRET_STORE_FIELDS = ['cardNumber', 'cardHolder', 'paymentQr', 'telegramChatId'] as const

/**
 * Do'kon yozuvini ochiq (public) ko'rinishga o'tkazadi: maxfiy maydonlarni olib
 * tashlaydi va ularning o'rniga `hasTransfer` bayrog'ini qo'yadi.
 *
 * Prisma `select`i bilan ikki qavatli himoya: `select` kelajakda tasodifan
 * kengaysa ham (yoki `include`ga qaytsa) maxfiy maydon javobga tushmaydi.
 */
function toPublicStore<T extends Record<string, unknown>>(store: T) {
  const out: Record<string, unknown> = { ...store }
  const hasTransfer = Boolean(out.cardNumber || out.paymentQr)
  for (const key of SECRET_STORE_FIELDS) delete out[key]
  return { ...out, hasTransfer }
}

export default async function storesRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Barcha do'konlar (gender bo'yicha filter)
  app.get('/', async (req, reply) => {
    const { gender, city, search, page, limit } = genderQuery.parse(req.query)
    const skip = (page - 1) * limit

    // Yashirilgan do'konlar ochiq ro'yxatda umuman ko'rinmaydi.
    const where: any = { isHidden: false }
    if (gender) where.genders = { has: gender as Gender }
    if (city) where.city = { equals: city, mode: 'insensitive' }
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true, name: true, slug: true, logo: true, banner: true,
          city: true, address: true, isOpen: true, rating: true, reviewCount: true,
          genders: true, hasDelivery: true, hasPickup: true, hasCashOnDoor: true,
          deliveryTime: true, themeColor: true, themeBg: true,
          lat: true, lng: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.store.count({ where }),
    ])

    return reply.send({ stores, total, page, pages: Math.ceil(total / limit) })
  })

  // Bitta do'kon — slug YOKI id bo'yicha. Do'kon sahifasida slug bor, checkout'da
  // esa faqat storeId. Ikkalasi ham shu endpointga tushadi: id — PK, slug — unique
  // indeks, shuning uchun `findFirst OR` ham O(1) (jadval skani emas).
  //   ?lite=1 — mahsulotlarsiz javob. Checkout faqat do'kon nomi va yetkazish
  //   sozlamalarini oladi; 100k+ katalogda 200 ta mahsulotni behuda yuklamaymiz.
  app.get('/:idOrSlug', async (req, reply) => {
    const { idOrSlug } = req.params as { idOrSlug: string }
    const { lite } = z.object({ lite: z.coerce.boolean().optional() }).parse(req.query)
    // MUHIM: `include` emas, aniq `select`. Aks holda butun Store qatori qaytadi va
    // ochiq (autentifikatsiyasiz) endpoint egasining `cardNumber`, `cardHolder`,
    // `paymentQr` va `telegramChatId` maydonlarini oshkor qiladi. Bu maydonlar faqat
    // autentifikatsiyalangan `GET /admin/store` orqali beriladi.
    // Yashirilgan do'kon to'g'ridan-to'g'ri havola bilan ham ochilmaydi (404).
    const where = { isHidden: false, OR: [{ slug: idOrSlug }, { id: idOrSlug }] }
    // `cardNumber`/`paymentQr` javobga chiqmaydi — pastda `hasTransfer` bayrog'iga
    // aylantirilib, o'zlari olib tashlanadi.
    const publicSelect = {
      id: true, name: true, slug: true, description: true,
      city: true, address: true, phone: true, logo: true, banner: true,
      isOpen: true, rating: true, reviewCount: true, createdAt: true, updatedAt: true,
      themeColor: true, themeBg: true, lat: true, lng: true,
      instagram: true, telegram: true, workingHours: true, deliveryText: true,
      lookbook: true, lookbookLooks: true, genders: true,
      hasDelivery: true, hasPickup: true, hasCashOnDoor: true, deliveryTime: true,
      cardNumber: true, paymentQr: true,
    } as const
    const productsSelect = {
      products: {
        where: { inStock: true },
        include: { category: true, variants: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      },
    } as const

    const store = lite
      ? await prisma.store.findFirst({ where, select: publicSelect })
      : await prisma.store.findFirst({ where, select: { ...publicSelect, ...productsSelect } })
    if (!store) return fail(reply, 404, ErrorCodes.STORE_NOT_FOUND, 'Do\'kon topilmadi')

    return reply.send(toPublicStore(store))
  })

  // Foydalanuvchining sevimli do'konlari
  app.get('/favorites', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const favorites = await prisma.favoriteStore.findMany({
      where: { userId, store: { isHidden: false } },
      include: {
        store: {
          select: {
            id: true, name: true, slug: true, logo: true, banner: true,
            city: true, address: true, isOpen: true, rating: true, reviewCount: true,
            genders: true, hasDelivery: true, hasPickup: true, hasCashOnDoor: true,
            deliveryTime: true, themeColor: true, themeBg: true,
            lat: true, lng: true,
            _count: { select: { products: true } },
          },
        },
      },
    })
    return reply.send({ stores: favorites.map(f => f.store) })
  })

  // Do'konni sevimlilarga qo'shish
  app.post('/:id/favorite', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as { userId: string }
    const { id: storeId } = req.params as { id: string }

    const existing = await prisma.favoriteStore.findUnique({
      where: { userId_storeId: { userId, storeId } },
    })

    if (existing) {
      await prisma.favoriteStore.delete({ where: { userId_storeId: { userId, storeId } } })
      return reply.send({ favorited: false })
    }
    await prisma.favoriteStore.create({ data: { userId, storeId } })
    return reply.send({ favorited: true })
  })
}
