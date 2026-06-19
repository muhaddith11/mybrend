import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'
import { env } from './env.js' // boot'da env'ni tekshiradi (fail-fast)

// Strip BOM that Windows/PowerShell can inject into env vars
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^﻿/, '')
}

import authRoutes from './routes/auth.js'
import storesRoutes from './routes/stores.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import clickRoutes from './routes/payment/click.js'
import paymeRoutes from './routes/payment/payme.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/upload.js'

const prisma = new PrismaClient()

const app = Fastify({ logger: { level: 'info' } })

// Pluginlar
app.register(cors, { origin: true })
app.register(jwt, { secret: env.JWT_SECRET })

// Global dekoratorlar
app.decorate('prisma', prisma)
app.decorate('authenticate', async (req: any, reply: any) => {
  try {
    await req.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Kirish uchun tizimga kiring' })
  }
})

// Routelar
app.register(authRoutes,     { prefix: '/api/auth' })
app.register(storesRoutes,   { prefix: '/api/stores' })
app.register(productsRoutes, { prefix: '/api/products' })
app.register(ordersRoutes,   { prefix: '/api/orders' })
app.register(clickRoutes,    { prefix: '/api/payment' })
app.register(paymeRoutes,    { prefix: '/api/payment' })
app.register(adminRoutes,    { prefix: '/api/admin' })
app.register(uploadRoutes,   { prefix: '/api' })

// Sog'liq tekshiruvi
app.get('/health', async () => ({
  status: 'ok',
  app: 'Libos API',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}))

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  await app.ready()
  app.server.emit('request', req, res)
}

// Lokal dev uchun
if (env.NODE_ENV !== 'production' || process.env.LOCAL_SERVER) {
  const start = async () => {
    try {
      await prisma.$connect()
      console.log('✅ PostgreSQL ulandi')
      await app.listen({ port: env.PORT, host: '0.0.0.0' })
      console.log(`🚀 Libos backend: http://localhost:${env.PORT}`)
    } catch (err) {
      app.log.error(err)
      await prisma.$disconnect()
      process.exit(1)
    }
  }
  start()
}
