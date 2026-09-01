// Admin (do'kon egasi) route'larini DB'siz test qilish uchun minimal ilova.
// Login xavfsizligi (timing-safe dummy hash) va adminAuth himoyasiga e'tibor.
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import bcrypt from 'bcryptjs'
import { errorHandler } from '../../src/errorHandler.js'
import adminRoutes from '../../src/routes/admin.js'

type SeedOwner = { id: string; email: string; name?: string; password: string } // password — ochiq matn, helper hash qiladi
type SeedStore = { id: string; slug: string; ownerId: string; name?: string }
type SeedOrder = { id: string; storeId: string; status: string }
type SeedOrderItem = { orderId: string; productId: string; quantity: number; size?: string | null; color?: string | null }
type SeedVariant = { id: string; productId: string; size?: string | null; color?: string | null; quantity: number }
type SeedProduct = { id: string; storeId: string; name?: string }

type AdminSeed = {
  owners?: SeedOwner[]
  stores?: SeedStore[]
  orders?: SeedOrder[]
  orderItems?: SeedOrderItem[]
  variants?: SeedVariant[]
  products?: SeedProduct[]
}

export function createAdminFakePrisma(seed: AdminSeed) {
  const owners = (seed.owners ?? []).map((o) => ({
    id: o.id,
    email: o.email,
    name: o.name ?? 'Owner',
    password: bcrypt.hashSync(o.password, 10), // haqiqiy hash — bcrypt.compare ishlashi uchun
  }))
  const stores = (seed.stores ?? []).map((s) => ({ name: 'Store', ...s }))
  const orders = (seed.orders ?? []).map((o) => ({ ...o }))
  const orderItems = (seed.orderItems ?? []).map((i) => ({ size: null, color: null, ...i }))
  const variants = (seed.variants ?? []).map((v) => ({ size: null, color: null, ...v }))
  const products = (seed.products ?? []).map((p) => ({ name: 'Mahsulot', ...p }))

  // In-memory login throttle (DB-asosli helper o'rniga test uchun)
  const throttle = new Map<string, { count: number; windowStart: number }>()

  const prisma: any = {
    loginThrottle: {
      async findUnique({ where }: any) {
        const r = throttle.get(where.key)
        return r ? { key: where.key, count: r.count, windowStart: new Date(r.windowStart) } : null
      },
      async upsert({ where, create, update }: any) {
        const existing = throttle.get(where.key)
        if (existing) throttle.set(where.key, { count: update.count, windowStart: existing.windowStart })
        else throttle.set(where.key, { count: create.count, windowStart: create.windowStart.getTime() })
        return null
      },
      async update({ where, data }: any) {
        const r = throttle.get(where.key)
        if (r && data.count?.increment) r.count += data.count.increment
        return null
      },
      async deleteMany({ where }: any) {
        throttle.delete(where.key)
        return { count: 1 }
      },
    },
    storeOwner: {
      async findUnique({ where }: any) {
        return owners.find((o) => o.email === where.email) ?? null
      },
    },
    store: {
      async findUnique({ where }: any) {
        return stores.find((s) => (where.slug && s.slug === where.slug) || (where.id && s.id === where.id)) ?? null
      },
      async findFirst({ where, include }: any) {
        const s = stores.find((x) => x.ownerId === where.ownerId)
        if (!s) return null
        if (include?._count) return { ...s, _count: { products: 0, orders: 0 } }
        return { ...s }
      },
      async update({ where, data }: any) {
        const s = stores.find((x) => x.id === where.id)
        if (s) Object.assign(s, data)
        return { ...s }
      },
    },
    // Buyurtma statusini o'zgartirish (bekor qilishda stok qaytishi) testlari uchun.
    order: {
      async findFirst({ where }: any) {
        const o = orders.find((x) => x.id === where.id)
        if (!o) return null
        // `where.store.ownerId` — egasi boshqa do'konning buyurtmasiga tegmasin
        const ownerId = where.store?.ownerId
        if (ownerId && !stores.some((s) => s.id === o.storeId && s.ownerId === ownerId)) return null
        return { ...o }
      },
      async update({ where, data }: any) {
        const o = orders.find((x) => x.id === where.id)
        if (o) Object.assign(o, data)
        return { ...o }
      },
    },
    orderItem: {
      async findMany({ where }: any) {
        return orderItems.filter((i) => i.orderId === where.orderId).map((i) => ({ ...i }))
      },
      async count({ where }: any) {
        return orderItems.filter((i) => i.productId === where.productId).length
      },
    },
    product: {
      async findFirst({ where }: any) {
        const p = products.find((x) => x.id === where.id)
        if (!p) return null
        const ownerId = where.store?.ownerId
        if (ownerId && !stores.some((s) => s.id === p.storeId && s.ownerId === ownerId)) return null
        return { ...p }
      },
      async findMany({ where }: any) {
        const ids: string[] = where?.id?.in ?? []
        return products
          .filter((p) => ids.includes(p.id) && (!where.storeId || p.storeId === where.storeId))
          .map((p) => ({ ...p }))
      },
      async update({ where, data }: any) {
        const p = products.find((x) => x.id === where.id)
        if (p) Object.assign(p, data)
        return p ? { ...p } : null
      },
      async delete({ where }: any) {
        const idx = products.findIndex((x) => x.id === where.id)
        const [removed] = idx >= 0 ? products.splice(idx, 1) : [null]
        return removed
      },
    },
    productVariant: {
      async updateMany({ where, data }: any) {
        const hit = variants.filter(
          (v) =>
            v.productId === where.productId &&
            (v.size ?? null) === (where.size ?? null) &&
            (v.color ?? null) === (where.color ?? null)
        )
        for (const v of hit) v.quantity += data.quantity.increment
        return { count: hit.length }
      },
      async findFirst({ where }: any) {
        return variants.find((v) => v.productId === where.productId) ?? null
      },
    },
  }

  prisma.$transaction = async (fn: any) => fn(prisma)

  return { prisma, owners, stores, orders, orderItems, variants, products }
}

export async function buildAdminTestApp(seed: AdminSeed) {
  const app = Fastify()
  const fake = createAdminFakePrisma(seed)
  app.register(jwt, { secret: 'test-secret' })
  app.decorate('prisma', fake.prisma)
  app.setErrorHandler(errorHandler)
  app.register(adminRoutes, { prefix: '/api/admin' })
  await app.ready()
  return { app, fake }
}
