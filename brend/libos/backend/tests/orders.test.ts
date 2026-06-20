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
