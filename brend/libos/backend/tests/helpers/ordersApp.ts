// Buyurtma (orders) route'larini DB'siz test qilish uchun minimal ilova.
import Fastify from 'fastify'
import { errorHandler } from '../../src/errorHandler.js'
import ordersRoutes from '../../src/routes/orders.js'

type SeedProduct = { id: string; price: number; name?: string; nameUz?: string | null; sku?: string | null }
type SeedStore = { id: string; slug: string; name?: string; telegramChatId?: string | null }

// orders.ts ishlatadigan prisma metodlarini in-memory taqlid qiladi.
export function createOrdersFakePrisma(seed: { products: SeedProduct[]; stores: SeedStore[] }) {
  const users: any[] = []
  let uId = 1
  let oId = 1
  const createdOrders: any[] = []

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
    order: {
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
        const order = { id: 'order_' + oId++, ...data, items, store }
        createdOrders.push(order)
        return order
      },
    },
  }

  return { prisma, createdOrders, users }
}

export async function buildOrdersTestApp(seed: { products: SeedProduct[]; stores: SeedStore[] }) {
  const app = Fastify()
  const fake = createOrdersFakePrisma(seed)
  app.decorate('prisma', fake.prisma)
  app.decorate('authenticate', async () => {})
  app.setErrorHandler(errorHandler)
  app.register(ordersRoutes, { prefix: '/api/orders' })
  await app.ready()
  return { app, fake }
}
