// Buyurtma yaratish testlari. Eng muhim xavfsizlik jihati: narx SERVER
// tomonda DB'dan hisoblanadi — mijoz yuborgan narxga ishonilmaydi.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildOrdersTestApp } from './helpers/ordersApp.js'

const json = { 'content-type': 'application/json' }

const seed = {
  products: [
    { id: 'p1', price: 10000, name: 'Koylak' },
    { id: 'p2', price: 5000, name: 'Shim' },
  ],
  stores: [{ id: 's1', slug: 'asma', name: 'Asma', telegramChatId: null }],
}

describe('POST /api/orders/guest — narx server tomonda hisoblanadi', () => {
  test('jami narx DB narxlaridan, mijoz yuborgan soxta narx eʼtiborsiz qoladi', async () => {
    const { app, fake } = await buildOrdersTestApp(seed)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders/guest',
      headers: json,
      payload: {
        storeSlug: 'asma',
        customerName: 'Ali',
        phone: '+998901234567',
        items: [
          { productId: 'p1', quantity: 2, price: 1 }, // soxta "price: 1" — schema uni tashlab yuboradi
          { productId: 'p2', quantity: 1 },
        ],
      },
    })
    assert.equal(res.statusCode, 201)
    assert.equal(res.json().ok, true)
    assert.ok(res.json().orderId)

    const order = fake.createdOrders[0]
    // 10000*2 + 5000*1 = 25000 (soxta 1 emas)
    assert.equal(order.totalPrice, 25000)
    // Buyurtma qatorlaridagi narx ham DB narxi
    assert.equal(order.items.find((i: any) => i.productId === 'p1').price, 10000)
    assert.equal(order.items.find((i: any) => i.productId === 'p2').price, 5000)
    await app.close()
  })

  test('doʻkon topilmasa → 404', async () => {
    const { app } = await buildOrdersTestApp(seed)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders/guest',
      headers: json,
      payload: {
        storeSlug: 'mavjud-emas',
        customerName: 'Ali',
        phone: '+998900000000',
        items: [{ productId: 'p1', quantity: 1 }],
      },
    })
    assert.equal(res.statusCode, 404)
    await app.close()
  })

  test('mavjud boʻlmagan / boshqa doʻkon mahsuloti → 400', async () => {
    const { app, fake } = await buildOrdersTestApp(seed)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders/guest',
      headers: json,
      payload: {
        storeSlug: 'asma',
        customerName: 'Ali',
        phone: '+998901234599',
        items: [
          { productId: 'p1', quantity: 1 },
          { productId: 'yoq-bunaqa-id', quantity: 1 }, // noto'g'ri ID
        ],
      },
    })
    assert.equal(res.statusCode, 400)
    assert.equal(fake.createdOrders.length, 0) // buyurtma yaratilmasligi kerak
    await app.close()
  })

  test('stok kamayadi — mos variant topilsa', async () => {
    const seedV = {
      ...seed,
      variants: [{ id: 'v1', productId: 'p1', size: 'M', color: 'Qora', quantity: 5 }],
    }
    const { app, fake } = await buildOrdersTestApp(seedV)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders/guest',
      headers: json,
      payload: {
        storeSlug: 'asma',
        customerName: 'Ali',
        phone: '+998901230001',
        items: [{ productId: 'p1', quantity: 2, size: 'M', color: 'Qora' }],
      },
    })
    assert.equal(res.statusCode, 201)
    assert.equal(fake.variants[0].quantity, 3) // 5 - 2 = 3
    await app.close()
  })

  test('stok yetmasa buyurtma rad etiladi (400), stok oʻzgarmaydi (overselling yoʻq)', async () => {
    const seedV = {
      ...seed,
      variants: [{ id: 'v1', productId: 'p1', size: 'M', color: 'Qora', quantity: 1 }],
    }
    const { app, fake } = await buildOrdersTestApp(seedV)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders/guest',
      headers: json,
      payload: {
        storeSlug: 'asma',
        customerName: 'Ali',
        phone: '+998901230002',
        items: [{ productId: 'p1', quantity: 10, size: 'M', color: 'Qora' }],
      },
    })
    assert.equal(res.statusCode, 400) // variant bor, lekin stok yetmaydi → rad
    assert.equal(fake.createdOrders.length, 0) // buyurtma yaratilmaydi
    assert.equal(fake.variants[0].quantity, 1) // stok o'zgarmaydi
    await app.close()
  })

  test('parallel ikki buyurtma oxirgi mahsulotni olsa — biri oʻtadi, biri rad etiladi', async () => {
    const seedV = {
      ...seed,
      variants: [{ id: 'v1', productId: 'p1', size: 'M', color: 'Qora', quantity: 1 }],
    }
    const { app, fake } = await buildOrdersTestApp(seedV)
    const payload = {
      storeSlug: 'asma',
      customerName: 'Ali',
      phone: '+998901230003',
      items: [{ productId: 'p1', quantity: 1, size: 'M', color: 'Qora' }],
    }
    // Ikki so'rovni bir vaqtda yuboramiz (oxirgi 1 dona uchun poyga)
    const [r1, r2] = await Promise.all([
      app.inject({ method: 'POST', url: '/api/orders/guest', headers: json, payload }),
      app.inject({ method: 'POST', url: '/api/orders/guest', headers: json, payload }),
    ])
    // Biri 201 (muvaffaqiyat), biri 400 (stok tugadi) — race-xavfsiz
    assert.deepEqual([r1.statusCode, r2.statusCode].sort(), [201, 400])
    assert.equal(fake.createdOrders.length, 1) // faqat bitta buyurtma yaratiladi
    assert.equal(fake.variants[0].quantity, 0) // 1 marta kamaydi, manfiyga tushmaydi
    await app.close()
  })

  test('GET /track/:id — mehmon o’z buyurtmasini auth’siz ko’radi', async () => {
    const { app } = await buildOrdersTestApp(seed)
    const created = await app.inject({
      method: 'POST',
      url: '/api/orders/guest',
      headers: json,
      payload: {
        storeSlug: 'asma',
        customerName: 'Ali',
        phone: '+998901230055',
        items: [{ productId: 'p1', quantity: 1 }],
      },
    })
    const orderId = created.json().orderId
    const res = await app.inject({ method: 'GET', url: `/api/orders/track/${orderId}` })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().id, orderId)
    assert.equal(res.json().status, 'PENDING')
    await app.close()
  })

  test('GET /track/:id — mavjud boʻlmagan ID → 404', async () => {
    const { app } = await buildOrdersTestApp(seed)
    const res = await app.inject({ method: 'GET', url: '/api/orders/track/yoq-bunaqa-id' })
    assert.equal(res.statusCode, 404)
    await app.close()
  })

  test('bir xil telefon bilan ikki buyurtma → bitta user (dublikat emas)', async () => {
    const { app, fake } = await buildOrdersTestApp(seed)
    const payload = {
      storeSlug: 'asma',
      customerName: 'Vali',
      phone: '+998911112233',
      items: [{ productId: 'p1', quantity: 1 }],
    }
    const r1 = await app.inject({ method: 'POST', url: '/api/orders/guest', headers: json, payload })
    const r2 = await app.inject({ method: 'POST', url: '/api/orders/guest', headers: json, payload })
    assert.equal(r1.statusCode, 201)
    assert.equal(r2.statusCode, 201)
    assert.equal(fake.users.length, 1) // user qayta ishlatildi
    assert.equal(fake.createdOrders.length, 2) // buyurtma esa ikkita
    await app.close()
  })
})

// Auth'li buyurtma route'i: online to'lov (paymentUrl), paymentMethod va yetkazish
// narxi mantig'ini qoplaydi (avval umuman test qilinmagan edi).
describe("POST /api/orders (auth) — online to'lov, paymentMethod, yetkazish narxi", () => {
  test("CLICK → my.click.uz paymentUrl, paymentMethod=click, yetkazish narxi qo'shiladi", async () => {
    const { app, fake } = await buildOrdersTestApp(seed)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: json,
      payload: {
        storeId: 's1',
        deliveryType: 'DELIVERY',
        address: 'Test koʻcha 1',
        paymentProvider: 'CLICK',
        items: [{ productId: 'p1', quantity: 1 }],
      },
    })
    assert.equal(res.statusCode, 201)
    assert.ok(res.json().paymentUrl?.includes('my.click.uz'))
    const order = fake.createdOrders[0]
    assert.equal(order.paymentMethod, 'click')
    assert.equal(order.totalPrice, 25000) // 10000 + 15000 (DELIVERY yetkazish narxi)
    await app.close()
  })

  test('PAYME → paycom.uz paymentUrl, paymentMethod=payme, PICKUP yetkazish narxisiz', async () => {
    const { app, fake } = await buildOrdersTestApp(seed)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: json,
      payload: {
        storeId: 's1',
        deliveryType: 'PICKUP',
        paymentProvider: 'PAYME',
        items: [{ productId: 'p1', quantity: 1 }],
      },
    })
    assert.equal(res.statusCode, 201)
    assert.ok(res.json().paymentUrl?.includes('paycom.uz'))
    const order = fake.createdOrders[0]
    assert.equal(order.paymentMethod, 'payme')
    assert.equal(order.totalPrice, 10000) // PICKUP — yetkazish narxi yo'q
    await app.close()
  })

  test("CASH (paymentProvider yo'q) → paymentUrl yo'q, paymentMethod=cash", async () => {
    const { app, fake } = await buildOrdersTestApp(seed)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: json,
      payload: {
        storeId: 's1',
        deliveryType: 'PICKUP',
        items: [{ productId: 'p1', quantity: 1 }],
      },
    })
    assert.equal(res.statusCode, 201)
    assert.equal(res.json().paymentUrl, undefined)
    assert.equal(fake.createdOrders[0].paymentMethod, 'cash')
    await app.close()
  })

  test("narx server tomonda — soxta 'price' eʼtiborsiz, stok kamayadi", async () => {
    const seedV = {
      ...seed,
      variants: [{ id: 'v1', productId: 'p1', size: null, color: null, quantity: 4 }],
    }
    const { app, fake } = await buildOrdersTestApp(seedV)
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: json,
      payload: {
        storeId: 's1',
        deliveryType: 'PICKUP',
        paymentProvider: 'CLICK',
        items: [{ productId: 'p1', quantity: 2, price: 1 }], // soxta price — schema tashlaydi
      },
    })
    assert.equal(res.statusCode, 201)
    assert.equal(fake.createdOrders[0].totalPrice, 20000) // 10000*2 (PICKUP)
    assert.equal(fake.variants[0].quantity, 2) // 4 - 2
    await app.close()
  })
})
