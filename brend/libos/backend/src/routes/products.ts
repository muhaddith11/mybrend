import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

export default async function productsRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = (app as any).prisma

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
