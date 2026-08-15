// Regressiya: mahsulot tahririda variant (stok) yo'qolmasligi.
// Xato edi: mobil forma har save'da variantlarni quantity:0 bilan qayta yaratardi,
// tahrirda esa backend eskilarini o'chirardi — mavjud stok raqamlari yo'qolardi.
// Endi `variants` ixtiyoriy: yuborilmasa (undefined) — mavjud variantlarga tegilmaydi.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import { errorHandler } from '../src/errorHandler.js'
import adminRoutes from '../src/routes/admin.js'

const json = { 'content-type': 'application/json' }

// Variant xatti-harakati uchun maxsus fake Prisma — deleteMany/create chaqiruvlarini kuzatadi.
function buildApp() {
  const calls = { variantDeleteMany: 0, createVariants: [] as any[], updateVariants: [] as any[] }
  const existing = { id: 'p1', storeId: 's1', name: 'Palto', price: 100 }

  const prisma: any = {
    store: { async findFirst() { return { id: 's1', ownerId: 'o1', name: 'Asma' } } },
    category: { async findFirst() { return null } },
    product: {
      async findFirst() { return existing },
      async create({ data }: any) { calls.createVariants.push(data.variants ?? null); return { id: 'pnew', ...data, category: null, variants: [] } },
      async update({ data }: any) { calls.updateVariants.push(data.variants ?? null); return { ...existing, ...data, category: null, variants: [] } },
    },
    productVariant: {
      async deleteMany() { calls.variantDeleteMany++; return { count: 0 } },
    },
  }

  // Variantlarni o'chirish + qayta yaratish bitta tranzaksiyada bajariladi.
  prisma.$transaction = async (fn: any) => fn(prisma)

  const app = Fastify()
  app.register(jwt, { secret: 'test-secret' })
  app.decorate('prisma', prisma)
  app.setErrorHandler(errorHandler)
  app.register(adminRoutes, { prefix: '/api/admin' })
  return { app, calls }
}

const authHeader = (app: any) => ({ ...json, authorization: `Bearer ${app.jwt.sign({ ownerId: 'o1', role: 'owner' })}` })

describe('Admin variant — stokni saqlash (preserve-on-edit)', () => {
  test('PUT: variants YUBORILMASA → deleteMany chaqirilmaydi (mavjud stok saqlanadi)', async () => {
    const { app, calls } = buildApp()
    await app.ready()
    const res = await app.inject({
      method: 'PUT', url: '/api/admin/products/p1', headers: authHeader(app),
      payload: { name: 'Palto', price: 100 }, // variants yo'q
    })
    assert.equal(res.statusCode, 200)
    assert.equal(calls.variantDeleteMany, 0, 'variants yuborilmadi — deleteMany chaqirilmasligi shart')
    assert.equal(calls.updateVariants[0], null, 'update data ichida variants bo\'lmasligi kerak')
    await app.close()
  })

  test('PUT: variants:[...] YUBORILSA → deleteMany + qayta yaratish', async () => {
    const { app, calls } = buildApp()
    await app.ready()
    const res = await app.inject({
      method: 'PUT', url: '/api/admin/products/p1', headers: authHeader(app),
      payload: { name: 'Palto', price: 100, variants: [{ size: 'M', color: 'Qora', quantity: 5 }] },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(calls.variantDeleteMany, 1, 'variants aniq yuborildi — deleteMany bir marta chaqirilishi kerak')
    await app.close()
  })

  test('POST: variants YUBORILMASA → mahsulot variantsiz (untracked) yaratiladi', async () => {
    const { app, calls } = buildApp()
    await app.ready()
    const res = await app.inject({
      method: 'POST', url: '/api/admin/products', headers: authHeader(app),
      payload: { name: 'Yangi', price: 50 },
    })
    assert.equal(res.statusCode, 201)
    assert.equal(calls.createVariants[0], null, 'variants yuborilmadi — create ichida variants bo\'lmasligi kerak')
    await app.close()
  })
})
