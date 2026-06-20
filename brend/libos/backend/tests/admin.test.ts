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
