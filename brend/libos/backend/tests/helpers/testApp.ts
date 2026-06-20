// Test uchun minimal Fastify ilovasi.
// Maqsad: auth route'larini HAQIQIY DB'siz tekshirish. server.ts ni import
// qilmaymiz (u boot'da Postgres'ga ulanadi va listen qiladi) — o'rniga shu
// yerda faqat auth uchun kerakli dekoratorlar bilan ilova quramiz.
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import { errorHandler } from '../../src/errorHandler.js'
import authRoutes from '../../src/routes/auth.js'

type User = {
  id: string
  phone: string
  name: string | null
  avatar: string | null
  otp: string | null
  otpExpiry: Date | null
  lastOtpSentAt: Date | null
  otpAttempts: number
}

function blankUser(phone: string, id: string): User {
  return {
    id,
    phone,
    name: null,
    avatar: null,
    otp: null,
    otpExpiry: null,
    lastOtpSentAt: null,
    otpAttempts: 0,
  }
}

// Prisma yangilash sintaksisini ({ otpAttempts: { increment: 1 } }) qo'llab-quvvatlaydi.
function applyUpdate(target: Record<string, any>, data: Record<string, any>) {
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && !(value instanceof Date) && 'increment' in value) {
      target[key] = (target[key] ?? 0) + (value as { increment: number }).increment
    } else {
      target[key] = value
    }
  }
}

// auth.ts ishlatadigan prisma.user metodlarining in-memory soxta nusxasi.
export function createFakePrisma() {
  const users: User[] = []
  let nextId = 1

  const findWhere = (where: any): User | undefined => {
    if (where?.phone !== undefined) return users.find((u) => u.phone === where.phone)
    if (where?.id !== undefined) return users.find((u) => u.id === where.id)
    return undefined
  }

  const prisma = {
    user: {
      async findUnique({ where }: any) {
        const u = findWhere(where)
        return u ? { ...u } : null
      },
      async create({ data }: any) {
        const created = { ...blankUser(data.phone, String(nextId++)), ...data }
        users.push(created)
        return { ...created }
      },
      async update({ where, data }: any) {
        const u = findWhere(where)
        if (!u) throw new Error('Yangilanadigan foydalanuvchi topilmadi')
        applyUpdate(u, data)
        return { ...u }
      },
      async upsert({ where, update, create }: any) {
        const u = findWhere(where)
        if (u) {
          applyUpdate(u, update)
          return { ...u }
        }
        const created = { ...blankUser(create.phone, String(nextId++)), ...create }
        users.push(created)
        return { ...created }
      },
    },
  }

  return {
    prisma,
    // Testda oldindan tayyor foydalanuvchi qo'yish uchun.
    seed(user: Partial<User> & { phone: string }) {
      users.push({ ...blankUser(user.phone, String(nextId++)), ...user })
    },
    // Tekshirish uchun joriy holatni o'qish.
    find(phone: string) {
      const u = users.find((x) => x.phone === phone)
      return u ? { ...u } : undefined
    },
  }
}

export async function buildTestApp() {
  const app = Fastify()
  const fake = createFakePrisma()

  app.register(jwt, { secret: 'test-secret' })
  app.setErrorHandler(errorHandler)
  app.decorate('prisma', fake.prisma)
  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      await req.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Kirish uchun tizimga kiring' })
    }
  })

  app.register(authRoutes, { prefix: '/api/auth' })
  await app.ready()

  return { app, fake }
}
