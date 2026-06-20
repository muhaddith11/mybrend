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

// Payme webhook hayot-siklini (Create→Perform→Cancel) test qilish uchun
// in-memory soxta prisma. payme.ts ishlatadigan order/payment metodlarini taqlid
// qiladi. Auth o'tgandan keyingi biznes-mantiqni tekshirishga mo'ljallangan.
type PaymeSeedOrder = { id: string; totalPrice: number; status?: string }

export function createPaymentFakePrisma(seed: { orders: PaymeSeedOrder[] }) {
  const orders: any[] = seed.orders.map((o) => ({ status: 'NEW', ...o }))
  const payments: any[] = []
  let pId = 1
  const findOrder = (id: string) => orders.find((o) => o.id === id)

  const prisma: any = {
    order: {
      async findUnique({ where, include }: any) {
        const o = findOrder(where.id)
        if (!o) return null
        const result: any = { ...o }
        if (include?.payment) result.payment = payments.find((p) => p.orderId === o.id) ?? null
        return result
      },
      async update({ where, data }: any) {
        const o = findOrder(where.id)
        if (o) Object.assign(o, data)
        return o ? { ...o } : null
      },
    },
    payment: {
      async findUnique({ where }: any) {
        if (where.paymeTransId !== undefined)
          return payments.find((p) => p.paymeTransId === where.paymeTransId) ?? null
        if (where.orderId !== undefined) return payments.find((p) => p.orderId === where.orderId) ?? null
        if (where.id !== undefined) return payments.find((p) => p.id === where.id) ?? null
        return null
      },
      async upsert({ where, create, update }: any) {
        const existing = payments.find((p) => p.orderId === where.orderId)
        if (existing) {
          Object.assign(existing, update)
          return { ...existing }
        }
        const created = { id: 'pay_' + pId++, ...create }
        payments.push(created)
        return { ...created }
      },
      async update({ where, data }: any) {
        // payme `where.id` bilan, click esa `where.orderId` bilan yangilaydi
        const p = payments.find(
          (x) =>
            (where.id !== undefined && x.id === where.id) ||
            (where.orderId !== undefined && x.orderId === where.orderId)
        )
        if (p) Object.assign(p, data)
        return p ? { ...p } : null
      },
      async findMany() {
        return payments.map((p) => ({ ...p }))
      },
    },
  }

  return { prisma, orders, payments }
}

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
