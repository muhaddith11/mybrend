// Admin (do'kon egasi) route'larini DB'siz test qilish uchun minimal ilova.
// Login xavfsizligi (timing-safe dummy hash) va adminAuth himoyasiga e'tibor.
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import bcrypt from 'bcryptjs'
import { errorHandler } from '../../src/errorHandler.js'
import adminRoutes from '../../src/routes/admin.js'

type SeedOwner = { id: string; email: string; name?: string; password: string } // password — ochiq matn, helper hash qiladi
type SeedStore = { id: string; slug: string; ownerId: string; name?: string }

export function createAdminFakePrisma(seed: { owners?: SeedOwner[]; stores?: SeedStore[] }) {
  const owners = (seed.owners ?? []).map((o) => ({
    id: o.id,
    email: o.email,
    name: o.name ?? 'Owner',
    password: bcrypt.hashSync(o.password, 10), // haqiqiy hash — bcrypt.compare ishlashi uchun
  }))
  const stores = (seed.stores ?? []).map((s) => ({ name: 'Store', ...s }))

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
    },
  }

  return { prisma, owners, stores }
}

export async function buildAdminTestApp(seed: { owners?: SeedOwner[]; stores?: SeedStore[] }) {
  const app = Fastify()
  const fake = createAdminFakePrisma(seed)
  app.register(jwt, { secret: 'test-secret' })
  app.decorate('prisma', fake.prisma)
  app.setErrorHandler(errorHandler)
  app.register(adminRoutes, { prefix: '/api/admin' })
  await app.ready()
  return { app, fake }
}
