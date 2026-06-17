import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

export default async function productsRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = (app as any).prisma

  // Global qidiruv — barcha do'konlar bo'ylab mahsulot qidirish
  app.get('/', async (req, reply) => {
    const { search } = z.object({ search: z.string().optional() }).parse(req.query)
    const q = (search ?? '').trim()
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { nameUz: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { category: { name: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        store: { select: { name: true, slug: true, themeColor: true, themeBg: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    })
    return reply.send({ products })
  })

  // Ommabop mahsulotlar (homepage uchun)
  app.get('/featured', async (req, reply) => {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        store: { select: { name: true, slug: true, themeColor: true, themeBg: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    })
    return reply.send({ products })
  })

  // Chegirmadagi mahsulotlar (homepage uchun)
  app.get('/discounted', async (req, reply) => {
    const products = await prisma.product.findMany({
      where: { inStock: true, originalPrice: { gt: 0 } },
      include: {
        store: { select: { name: true, slug: true, themeColor: true, themeBg: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return reply.send({ products })
  })

  // Do'kon mahsulotlari (kategoriya bo'yicha filter)
  app.get('/store/:storeId', async (req, reply) => {
    const { storeId } = req.params as { storeId: string }
    const { categoryId } = z.object({ categoryId: z.string().optional() }).parse(req.query)

    const products = await prisma.product.findMany({
      where: { storeId, inStock: true, ...(categoryId ? { categoryId } : {}) },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(products)
  })

  // Bitta mahsulot
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, store: { select: { name: true, slug: true, themeColor: true } } },
    })
    if (!product) return reply.status(404).send({ error: 'Mahsulot topilmadi' })
    return reply.send(product)
  })
}
