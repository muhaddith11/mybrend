// Buyurtma (orders) route'larini DB'siz test qilish uchun minimal ilova.
import Fastify from 'fastify'
import { errorHandler } from '../../src/errorHandler.js'
import ordersRoutes from '../../src/routes/orders.js'

type SeedProduct = { id: string; price: number; name?: string; nameUz?: string | null; sku?: string | null }
type SeedStore = { id: string; slug: string; name?: string; telegramChatId?: string | null; hasPickup?: boolean }
type SeedVariant = { id: string; productId: string; size?: string | null; color?: string | null; quantity: number }

// orders.ts ishlatadigan prisma metodlarini in-memory taqlid qiladi.
export function createOrdersFakePrisma(seed: { products: SeedProduct[]; stores: SeedStore[]; variants?: SeedVariant[] }) {
  const users: any[] = []
  let uId = 1
  let oId = 1
  const createdOrders: any[] = []
  const variants: SeedVariant[] = (seed.variants ?? []).map((v) => ({ ...v }))

  const prisma = {
    store: {
      async findUnique({ where }: any) {
        return (
          seed.stores.find(
            (s) => (where.slug && s.slug === where.slug) || (where.id && s.id === where.id)
          ) ?? null
        )
      },
    },
    user: {
      async findUnique({ where }: any) {
        return (
          users.find((u) => (where.phone && u.phone === where.phone) || (where.id && u.id === where.id)) ?? null
        )
      },
      async create({ data }: any) {
        const u = { id: 'u' + uId++, name: null, ...data }
        users.push(u)
        return u
      },
    },
    product: {
      async findMany({ where }: any) {
        const ids: string[] = where?.id?.in ?? []
        return seed.products.filter((p) => ids.includes(p.id))
      },
    },
    productVariant: {
      async findFirst({ where }: any) {
        return (
          variants.find(
            (v) =>
              v.productId === where.productId &&
              (v.size ?? null) === (where.size ?? null) &&
              (v.color ?? null) === (where.color ?? null) &&
              v.quantity > (where.quantity?.gt ?? -1)
          ) ?? null
        )
      },
      async update({ where, data }: any) {
        const v = variants.find((x) => x.id === where.id)
        if (v && data.quantity?.decrement != null) v.quantity -= data.quantity.decrement
        return v
      },
      // Race-xavfsiz kamaytirish: stok yetarli (gte) variantlarnigina yangilaydi.
      // orders.ts'dagi yangi decrementStock shu metoddan foydalanadi.
      async updateMany({ where, data }: any) {
        let count = 0
        for (const v of variants) {
          const match =
            v.productId === where.productId &&
            (v.size ?? null) === (where.size ?? null) &&
            (v.color ?? null) === (where.color ?? null) &&
            v.quantity >= (where.quantity?.gte ?? 0)
          if (match) {
            if (data.quantity?.decrement != null) v.quantity -= data.quantity.decrement
            count++
          }
        }
        return { count }
      },
    },
    order: {
      async findUnique({ where }: any) {
        return createdOrders.find((o) => o.id === where.id) ?? null
      },
      async create({ data }: any) {
        const items = (data.items?.create ?? []).map((it: any, i: number) => ({
          id: 'item' + i,
          ...it,
          product: seed.products.find((p) => p.id === it.productId) ?? null,
        }))
        const store =
          seed.stores.find((s) => s.id === data.storeId) ?? {
            id: data.storeId,
            name: 'X',
            telegramChatId: null,
          }
        // Prisma schema default'i: status @default(PENDING) — fake ham qo'llaydi
        const order = { id: 'order_' + oId++, status: 'PENDING', ...data, items, store }
        createdOrders.push(order)
        return order
      },
    },
  } as any

  // Interaktiv tranzaksiya: soxta nusxada xuddi shu prisma'ni `tx` sifatida
  // uzatamiz (rollback'siz, lekin route mantig'ini tekshirish uchun yetarli).
  prisma.$transaction = async (fn: any) => fn(prisma)

  return { prisma, createdOrders, users, variants }
}

export async function buildOrdersTestApp(seed: { products: SeedProduct[]; stores: SeedStore[]; variants?: SeedVariant[] }) {
  const app = Fastify()
  const fake = createOrdersFakePrisma(seed)
  app.decorate('prisma', fake.prisma)
  // Auth'li route'lar uchun soxta foydalanuvchi — preHandler req.user'ni o'rnatadi
  // (guest route authenticate'ni umuman chaqirmaydi, shuning uchun ta'sir qilmaydi).
  app.decorate('authenticate', async (req: any) => {
    req.user = { userId: 'u_test' }
  })
  app.setErrorHandler(errorHandler)
  app.register(ordersRoutes, { prefix: '/api/orders' })
  await app.ready()
  return { app, fake }
}
