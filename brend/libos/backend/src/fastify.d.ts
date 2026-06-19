import type { PrismaClient } from '@prisma/client'

// Fastify'ga `app.decorate(...)` orqali qo'shilgan xususiyatlarni TypeScript'ga e'lon qilamiz
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    authenticate: (request: any, reply: any) => Promise<void>
  }
}
