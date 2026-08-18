import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { fail, ErrorCodes } from '../lib/apiError.js'
import { PrismaClient } from '@prisma/client'

// Yashirilgan do'konning mahsulotlari hech bir ochiq ro'yxatда chiqmasligi kerak
// (qidiruv, ommabop, chegirma, do'kon sahifasi, bitta mahsulot).
const VISIBLE_STORE = { isHidden: false } as const

export default async function productsRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Global qidiruv — barcha do'konlar bo'ylab mahsulot qidirish
  app.get('/', async (req, reply) => {
    const { search } = z.object({ search: z.string().optional() }).parse(req.query)
    const q = (search ?? '').trim()
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        store: VISIBLE_STORE,
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
      where: { inStock: true, store: VISIBLE_STORE },
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
      where: { inStock: true, originalPrice: { gt: 0 }, store: VISIBLE_STORE },
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
      where: { storeId, inStock: true, store: VISIBLE_STORE, ...(categoryId ? { categoryId } : {}) },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
      take: 200, // cheksiz yuklanishni oldini olish
    })
    return reply.send(products)
  })

  // Savatdagi mahsulotlarning JORIY narxi/mavjudligi. Savat qurilmada saqlanadi
  // va narxni qo'shilgan paytdagi holida eslab qoladi — do'kon narxni o'zgartirsa
  // ekranda eski raqam qolib ketardi (buyurtma esa server narxida hisoblanadi).
  // Yengil javob: butun mahsulot obyekti emas, faqat kerakli 3 maydon.
  app.get('/by-ids', async (req, reply) => {
    const { ids } = z.object({ ids: z.string() }).parse(req.query)
    const list = ids.split(',').map(s => s.trim()).filter(Boolean).slice(0, 100)
    if (list.length === 0) return reply.send({ products: [] })

    const products = await prisma.product.findMany({
      where: { id: { in: list }, store: VISIBLE_STORE },
      select: { id: true, price: true, inStock: true },
    })
    return reply.send({ products })
  })

  // Bitta mahsulot
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const product = await prisma.product.findUnique({
      where: { id, store: VISIBLE_STORE },
      include: { category: true, variants: true, store: { select: { name: true, slug: true, themeColor: true } } },
    })
    if (!product) return fail(reply, 404, ErrorCodes.PRODUCT_NOT_FOUND, 'Mahsulot topilmadi')
    return reply.send(product)
  })
}
