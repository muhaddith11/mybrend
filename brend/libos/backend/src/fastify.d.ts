import type { PrismaClient } from '@prisma/client'
import type { FastifyRequest, FastifyReply } from 'fastify'

// Fastify'ga `app.decorate(...)` orqali qo'shilgan xususiyatlarni TypeScript'ga e'lon qilamiz
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

// JWT token ichidagi ma'lumot shakli. Foydalanuvchi tokeni `{ userId, phone }`,
// do'kon egasi tokeni `{ ownerId, role }` bo'ladi — shuning uchun maydonlar ixtiyoriy.
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId?: string; phone?: string; ownerId?: string; role?: string }
    user: { userId?: string; phone?: string; ownerId?: string; role?: string }
  }
}
