// Public do'kon (stores) endpointlari testlari: ro'yxat + pagination + filterlar,
// slug bo'yicha bitta do'kon (404), va sevimli toggle (auth).
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildStoresTestApp } from './helpers/catalogApp.js'

const seed = {
  stores: [
    { id: 's1', slug: 'asma', name: 'Asma', city: 'Qoqon', genders: ['WOMEN'], rating: 5 },
    { id: 's2', slug: 'boosner', name: 'Boosner', city: 'Qoqon', genders: ['MEN'], rating: 4 },
    { id: 's3', slug: 'onepro', name: 'One Pro', city: 'Toshkent', genders: ['MEN', 'WOMEN'], rating: 3 },
  ],
}

describe('GET /api/stores', () => {
  test('barcha do\'konlar + total/pages metadata', async () => {
    const { app } = await buildStoresTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/stores' })
    assert.equal(res.statusCode, 200)
    const body = res.json()
    assert.equal(body.total, 3)
    assert.equal(body.stores.length, 3)
    assert.equal(body.page, 1)
    await app.close()
  })

  test('pagination — limit qo\'llanadi, total to\'liq qoladi', async () => {
    const { app } = await buildStoresTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/stores?limit=2&page=1' })
    const body = res.json()
    assert.equal(body.stores.length, 2) // sahifada 2 ta
    assert.equal(body.total, 3) // umumiy 3 ta
    assert.equal(body.pages, 2) // ceil(3/2)
    await app.close()
  })

  test('gender bo\'yicha filter', async () => {
    const { app } = await buildStoresTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/stores?gender=MEN' })
    const slugs = res.json().stores.map((s: any) => s.slug).sort()
    assert.deepEqual(slugs, ['boosner', 'onepro']) // MEN bor do'konlar
    await app.close()
  })

  test('search bo\'yicha filter (nom)', async () => {
    const { app } = await buildStoresTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/stores?search=asma' })
    const slugs = res.json().stores.map((s: any) => s.slug)
    assert.deepEqual(slugs, ['asma'])
    await app.close()
  })
})

describe('GET /api/stores/:slug', () => {
  test('slug bo\'yicha do\'kon qaytadi', async () => {
    const { app } = await buildStoresTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/stores/asma' })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().name, 'Asma')
    await app.close()
  })

  test('mavjud bo\'lmagan slug → 404', async () => {
    const { app } = await buildStoresTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/stores/yoq' })
    assert.equal(res.statusCode, 404)
    await app.close()
  })
})

describe('POST /api/stores/:id/favorite — toggle', () => {
  test('birinchi marta → favorited: true, ikkinchi marta → false', async () => {
    const { app } = await buildStoresTestApp(seed)
    const r1 = await app.inject({ method: 'POST', url: '/api/stores/s1/favorite' })
    assert.equal(r1.json().favorited, true)
    const r2 = await app.inject({ method: 'POST', url: '/api/stores/s1/favorite' })
    assert.equal(r2.json().favorited, false)
    await app.close()
  })
})
