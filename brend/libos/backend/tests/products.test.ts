// Public mahsulot (catalog) endpointlari testlari: faqat sotuvdagi mahsulotlar,
// qidiruv, do'kon bo'yicha filter va 404.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildProductsTestApp } from './helpers/catalogApp.js'

const seed = {
  products: [
    { id: 'p1', name: 'Qora Koylak', nameUz: 'Qora koylak', price: 100000, inStock: true, featured: true, storeId: 's1' },
    { id: 'p2', name: 'Oq Shim', price: 80000, originalPrice: 120000, inStock: true, storeId: 's1' },
    { id: 'p3', name: 'Sotuvda yoq', price: 50000, inStock: false, storeId: 's2' },
  ],
}

describe('GET /api/products', () => {
  test('faqat sotuvdagi (inStock) mahsulotlarni qaytaradi', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products' })
    assert.equal(res.statusCode, 200)
    const ids = res.json().products.map((p: any) => p.id)
    assert.ok(ids.includes('p1') && ids.includes('p2'))
    assert.ok(!ids.includes('p3')) // inStock: false — chiqmasligi kerak
    await app.close()
  })

  test('search bo\'yicha filterlaydi (nomdan)', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products?search=koylak' })
    const ids = res.json().products.map((p: any) => p.id)
    assert.deepEqual(ids, ['p1'])
    await app.close()
  })
})

describe('GET /api/products/featured & /discounted', () => {
  test('featured — sotuvdagilar, featured oldinda', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products/featured' })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().products[0].id, 'p1') // featured: true birinchi
    await app.close()
  })

  test('discounted — faqat originalPrice > 0 bo\'lganlar', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products/discounted' })
    const ids = res.json().products.map((p: any) => p.id)
    assert.deepEqual(ids, ['p2']) // faqat p2 da originalPrice bor
    await app.close()
  })
})

describe('GET /api/products/store/:storeId va /:id', () => {
  test('do\'kon mahsulotlari — storeId bo\'yicha filter', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products/store/s1' })
    const ids = res.json().map((p: any) => p.id)
    assert.deepEqual(ids.sort(), ['p1', 'p2'])
    await app.close()
  })

  test('bitta mahsulot — id bo\'yicha', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products/p1' })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().name, 'Qora Koylak')
    await app.close()
  })

  test('mavjud bo\'lmagan mahsulot → 404', async () => {
    const { app } = await buildProductsTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/products/yoq-bunaqa' })
    assert.equal(res.statusCode, 404)
    await app.close()
  })
})
