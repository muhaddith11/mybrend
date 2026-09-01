// Admin (do'kon egasi) login va auth himoyasi testlari.
// Login — xavfsizlik nuqtasi: noto'g'ri parol/mavjud bo'lmagan email bir xil
// 401 berishi (user-enumeration bo'lmasligi) va token faqat to'g'ri parolda
// berilishi kerak. adminAuth — tokensiz/yaroqsiz tokenni o'tkazmasligi shart.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildAdminTestApp } from './helpers/adminApp.js'

const json = { 'content-type': 'application/json' }

const seed = {
  owners: [{ id: 'o1', email: 'owner@zyff.uz', name: 'Asma Egasi', password: 'parol123' }],
  stores: [{ id: 's1', slug: 'asma', ownerId: 'o1', name: 'Asma' }],
}

function login(app: any, email: string, password: string) {
  return app.inject({ method: 'POST', url: '/api/admin/login', headers: json, payload: { email, password } })
}

describe('POST /api/admin/login', () => {
  test('toʻgʻri email + parol → token va owner maʼlumoti', async () => {
    const { app } = await buildAdminTestApp(seed)
    const res = await login(app, 'owner@zyff.uz', 'parol123')
    assert.equal(res.statusCode, 200)
    assert.ok(res.json().token)
    assert.equal(res.json().owner.email, 'owner@zyff.uz')
    await app.close()
  })

  test('toʻgʻri email + notoʻgʻri parol → 401', async () => {
    const { app } = await buildAdminTestApp(seed)
    const res = await login(app, 'owner@zyff.uz', 'xato-parol')
    assert.equal(res.statusCode, 401)
    assert.ok(!res.json().token)
    await app.close()
  })

  test('mavjud boʻlmagan email → 401 (notoʻgʻri parol bilan bir xil javob)', async () => {
    const { app } = await buildAdminTestApp(seed)
    const res = await login(app, 'yoq@zyff.uz', 'parol123')
    assert.equal(res.statusCode, 401)
    // Xabar mavjud-email holatidagi bilan bir xil — user-enumeration bo'lmasin
    assert.equal(res.json().error, "Login yoki parol noto'g'ri")
    await app.close()
  })

  test('boʻsh email/parol → 400 (Zod validatsiya)', async () => {
    const { app } = await buildAdminTestApp(seed)
    const res = await login(app, '', '')
    assert.equal(res.statusCode, 400)
    await app.close()
  })
})

describe('adminAuth — himoyalangan endpointlar', () => {
  test('tokensiz GET /store → 401', async () => {
    const { app } = await buildAdminTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/admin/store' })
    assert.equal(res.statusCode, 401)
    await app.close()
  })

  test('ownerId boʻlmagan token (oddiy user) → 403', async () => {
    const { app } = await buildAdminTestApp(seed)
    // userId bor, ammo ownerId yo'q — admin emas
    const token = app.jwt.sign({ userId: 'u1', phone: '+998901112233' })
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/store',
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(res.statusCode, 403)
    await app.close()
  })

  test('yaroqli owner token → 200 va doʻkon qaytadi', async () => {
    const { app } = await buildAdminTestApp(seed)
    const loginRes = await login(app, 'owner@zyff.uz', 'parol123')
    const token = loginRes.json().token
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/store',
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().slug, 'asma')
    await app.close()
  })
})

// Buyurtma bekor qilinganda stok qaytishi SHART. Telegram orqali rad etishda bu
// bor edi, admin panelda esa yo'q — zaxira abadiy yo'qolib, mahsulot sotib
// bo'lmas holga kelardi.
describe('PATCH /api/admin/orders/:id/status — bekor qilishda stok', () => {
  const stockSeed = {
    ...seed,
    orders: [{ id: 'ord1', storeId: 's1', status: 'PENDING' }],
    orderItems: [{ orderId: 'ord1', productId: 'p1', quantity: 2, size: 'M', color: null }],
    variants: [{ id: 'v1', productId: 'p1', size: 'M', color: null, quantity: 3 }],
  }

  async function authed() {
    const { app, fake } = await buildAdminTestApp(stockSeed)
    const token = (await login(app, 'owner@zyff.uz', 'parol123')).json().token
    return { app, fake, token }
  }

  const patch = (app: any, token: string, status: string) =>
    app.inject({
      method: 'PATCH',
      url: '/api/admin/orders/ord1/status',
      headers: { ...json, authorization: `Bearer ${token}` },
      payload: { status },
    })

  test('CANCELLED → variant zaxirasi qaytadi', async () => {
    const { app, fake, token } = await authed()
    const res = await patch(app, token, 'CANCELLED')
    assert.equal(res.statusCode, 200)
    assert.equal(fake.variants[0].quantity, 5) // 3 + 2
    await app.close()
  })

  test('takror CANCELLED → stok ikki marta qaytmaydi', async () => {
    const { app, fake, token } = await authed()
    await patch(app, token, 'CANCELLED')
    await patch(app, token, 'CANCELLED')
    assert.equal(fake.variants[0].quantity, 5) // 7 emas
    await app.close()
  })

  test('boshqa statusda stok tegilmaydi', async () => {
    const { app, fake, token } = await authed()
    await patch(app, token, 'CONFIRMED')
    assert.equal(fake.variants[0].quantity, 3)
    await app.close()
  })
})

// OrderItem.product bog'lanishi RESTRICT — buyurtmada ishlatilgan mahsulotni
// butunlay o'chirib bo'lmaydi. Endi SOFT-DELETE: arxivlanadi (archivedAt +
// inStock:false), qator saqlanadi, buyurtma tarixi buzilmaydi. Buyurtmasiz
// mahsulot esa avvalgidek butunlay o'chadi.
describe('DELETE /api/admin/products/:id', () => {
  const base = {
    ...seed,
    products: [
      { id: 'p1', storeId: 's1', name: 'Sotilgan' },
      { id: 'p2', storeId: 's1', name: 'Sotilmagan' },
    ],
    orders: [{ id: 'ord1', storeId: 's1', status: 'DELIVERED' }],
    orderItems: [{ orderId: 'ord1', productId: 'p1', quantity: 1, size: null, color: null }],
  }

  async function authed() {
    const { app, fake } = await buildAdminTestApp(base)
    const token = (await login(app, 'owner@zyff.uz', 'parol123')).json().token
    return { app, fake, token }
  }

  const del = (app: any, token: string, id: string) =>
    app.inject({ method: 'DELETE', url: `/api/admin/products/${id}`, headers: { authorization: `Bearer ${token}` } })

  test('buyurtmada ishlatilgan mahsulot → soft-delete (arxivlanadi, 200)', async () => {
    const { app, fake, token } = await authed()
    const res = await del(app, token, 'p1')
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().archived, true)
    // Hard-delete BO'LMAYDI — qator saqlanadi (buyurtma tarixi uchun).
    assert.equal(fake.products.length, 2)
    const p1 = fake.products.find((p: any) => p.id === 'p1')
    assert.ok(p1.archivedAt, 'archivedAt belgilanadi')
    assert.equal(p1.inStock, false, 'mijozdan yashiriladi')
    await app.close()
  })

  test('buyurtmasiz mahsulot → o\'chiriladi', async () => {
    const { app, fake, token } = await authed()
    const res = await del(app, token, 'p2')
    assert.equal(res.statusCode, 200)
    assert.equal(fake.products.length, 1)
    await app.close()
  })
})

// Lookbook boshqa do'kon mahsulotiga havola qilmasin: aks holda mijoz obrazdagi
// mahsulotni savatga qo'shsa, buyurtma boshqa do'konga ketib qolardi.
describe('PATCH /api/admin/store — lookbook productIds', () => {
  const base = {
    ...seed,
    stores: [
      { id: 's1', slug: 'asma', ownerId: 'o1', name: 'Asma' },
      { id: 's2', slug: 'boosner', ownerId: 'o2', name: 'Boosner' },
    ],
    products: [
      { id: 'mine', storeId: 's1', name: 'O\'z mahsulotim' },
      { id: 'theirs', storeId: 's2', name: 'Boshqa do\'kon' },
    ],
  }

  test('begona mahsulot ID\'lari saqlanmaydi, o\'ziniki qoladi', async () => {
    const { app, fake } = await buildAdminTestApp(base)
    const token = (await login(app, 'owner@zyff.uz', 'parol123')).json().token
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/store',
      headers: { ...json, authorization: `Bearer ${token}` },
      payload: { lookbookLooks: [{ image: 'a.jpg', productIds: ['mine', 'theirs'] }] },
    })
    assert.equal(res.statusCode, 200)
    const saved = fake.stores.find((s: any) => s.id === 's1') as any
    assert.deepEqual(saved.lookbookLooks[0].productIds, ['mine'])
    await app.close()
  })
})
