// To'lov webhook'larini test qilish uchun minimal Fastify ilova.
import Fastify from 'fastify'
import { errorHandler } from '../../src/errorHandler.js'
import clickRoutes from '../../src/routes/payment/click.js'
import paymeRoutes from '../../src/routes/payment/payme.js'

// Model'ga murojaat qilinsa xato tashlaydigan "prisma". Maqsad: soxta/ruxsatsiz
// so'rov DB'ga umuman yetib bormasligini isbotlash — agar route DB'ga tegsa,
// test 500 bilan yiqiladi (kutilgan rad-etish kodi o'rniga).
// Faqat haqiqiy model nomlari uchun xato; framework introspeksiyasi
// (.getter/.setter, Symbol.*, then ...) uchun undefined — aks holda Fastify
// decorate ham qoqilib qoladi.
const PRISMA_MODELS = new Set(['order', 'payment', 'user', 'product', 'store'])
export const throwingPrisma: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop === 'string' && PRISMA_MODELS.has(prop)) {
        throw new Error('Prisma ga murojaat qilindi — soʻrov rad etilishi kerak edi!')
      }
      return undefined
    },
  }
)

export async function buildPaymentTestApp(prisma: any = throwingPrisma) {
  const app = Fastify()
  app.decorate('prisma', prisma)
  app.decorate('authenticate', async () => {})
  app.setErrorHandler(errorHandler)
  // Click registratsiyada process.env.CLICK_SECRET_KEY'ni o'qiydi —
  // test fayli buni app qurishdan oldin o'rnatadi.
  app.register(clickRoutes, { prefix: '/api/payment' })
  app.register(paymeRoutes, { prefix: '/api/payment' })
  await app.ready()
  return { app }
}
