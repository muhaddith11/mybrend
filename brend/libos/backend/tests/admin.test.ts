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
