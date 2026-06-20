import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient, Gender } from '@prisma/client'

const genderQuery = z.object({
  gender: z.enum(['MEN', 'WOMEN', 'KIDS']).optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

export default async function storesRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Barcha do'konlar (gender bo'yicha filter)
  app.get('/', async (req, reply) => {
    const { gender, city, search, page, limit } = genderQuery.parse(req.query)
    const skip = (page - 1) * limit

    const where: any = {}
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

  // Bitta do'kon (slug bo'yicha)
  app.get('/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          where: { inStock: true },
          include: { category: true, variants: true },
          orderBy: { createdAt: 'desc' },
          take: 200,
        },
      },
    })
    if (!store) return reply.status(404).send({ error: 'Do\'kon topilmadi' })
    return reply.send(store)
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
