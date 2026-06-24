import './instrument.js' // Sentry — eng birinchi yuklanishi shart
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'
import { env } from './env.js' // boot'da env'ni tekshiradi (fail-fast)

// Strip BOM that Windows/PowerShell can inject into env vars
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^﻿/, '')
}

import { errorHandler } from './errorHandler.js'
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
// Helmet — xavfsizlik HTTP sarlavhalari (X-Frame-Options, X-Content-Type-Options, HSTS, ...).
// CSP o'chirilgan (API faqat JSON qaytaradi), CORP esa cross-origin — aks holda web→API so'rovlari bloklanardi.
app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
})

// Rate-limit — bitta IP daqiqasiga 300 ta so'rovdan oshmasin (spam/brute-force/DoS oldini olish).
// Guest buyurtma va OTP kabi auth'siz endpointlar uchun ayniqsa muhim.
app.register(rateLimit, {
  global: true,
  max: 300,
  timeWindow: '1 minute',
})

// CORS — faqat o'z saytlarimiz API'ni chaqira olsin.
// ALLOWED_ORIGINS: vergul bilan ajratilgan qo'shimcha hostlar (Vercel app URL'lari) — env'dan.
// STRICT_CORS=true bo'lsa, keng `*.vercel.app` ruxsati o'chadi (launchda yoqiladi).
const extraOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
const strictCors = process.env.STRICT_CORS === 'true'
app.register(cors, {
  origin(origin, cb) {
    // Origin yo'q (native app, curl, server-to-server) → ruxsat
    if (!origin) return cb(null, true)
    try {
      const { hostname } = new URL(origin)
      const h = hostname.toLowerCase()
      const ok =
        h === 'zyff.uz' ||
        h.endsWith('.zyff.uz') || // www, admin va boshqa subdomenlar
        h === 'localhost' ||
        h === '127.0.0.1' || // lokal dev
        extraOrigins.includes(h) || // env'da ruxsat berilgan aniq hostlar
        (!strictCors && h.endsWith('.vercel.app')) // preview deploylar (STRICT_CORS bilan o'chadi)
      cb(null, ok)
    } catch {
      cb(null, false)
    }
  },
})
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

// Validatsiya va kutilmagan xatolarni bir joyda boshqaramiz
app.setErrorHandler(errorHandler)

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
  app: 'ZYFF API',
  version: process.env.APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
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
      console.log(`🚀 ZYFF backend: http://localhost:${env.PORT}`)
    } catch (err) {
      app.log.error(err)
      await prisma.$disconnect()
      process.exit(1)
    }
  }
  start()
}
