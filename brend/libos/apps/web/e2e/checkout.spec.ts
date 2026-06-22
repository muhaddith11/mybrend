import { test, expect } from '@playwright/test'

// Storefront (asma) — MEHMON NAQD checkout happy-path.
// API mock qilinadi (backend/DB shart emas), savat zustand-persist localStorage
// orqali oldindan seed qilinadi. Maqsad: eng tavakkalchi oqim — "savatdan buyurtmaga" —
// UI darajasida buzilmasligini tekshirish.

const STORE_KEY = 'asma-design-store'

// Zustand persist formati: { state: <partialize natijasi>, version: 0 }
const SEEDED_CART = {
  state: {
    cart: [
      {
        product: {
          id: 'p_e2e',
          name: 'Test Koylak',
          nameUz: 'Test Koylak',
          price: 100000,
          images: [],
          category: 'shirts',
          sizes: ['M'],
          colors: ['Qora'],
          description: '',
          descriptionUz: '',
          inStock: true,
          featured: false,
          new: true,
        },
        quantity: 1,
        size: 'M',
        color: 'Qora',
      },
    ],
    wishlist: [],
    authPhone: null,
    authName: null,
    orderIds: [],
  },
  version: 0,
}

test.describe('Mehmon checkout (asma storefront)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Savatni oldindan seed qilamiz — mahsulot qo'shish UI'sini chetlab o'tamiz
    await page.addInitScript(
      ([key, val]) => localStorage.setItem(key, val),
      [STORE_KEY, JSON.stringify(SEEDED_CART)],
    )

    // 2. API'ni mock qilamiz — haqiqiy backend/DB kerak emas
    await page.route('**/api/stores/asma', (route) =>
      route.fulfill({ json: { slug: 'asma', name: 'Asma', hasDelivery: true, hasPickup: false } }),
    )
    await page.route('**/api/orders/guest', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, orderId: 'e2e_order_1' }) }),
    )
  })

  test('naqd to\'lov: buyurtma yaratiladi va kuzatuv havolasi chiqadi', async ({ page }) => {
    await page.goto('/store/asma/checkout')

    // Form to'ldirish
    await page.getByPlaceholder("To'liq ismingiz").fill('Ali Valiyev')
    await page.getByPlaceholder('+998 __ ___ __ __').fill('+998 90 123 45 67')
    await page.getByPlaceholder("Shahar, ko'cha, uy raqami").fill("Qo'qon, Istiqbol ko'chasi 1")

    // Naqd to'lov — default tanlangan. Buyurtmani tasdiqlaymiz.
    await page.getByRole('button', { name: 'Buyurtmani tasdiqlash' }).click()

    // Muvaffaqiyat ekrani
    await expect(page.getByText('Buyurtmangiz qabul qilindi!')).toBeVisible()
    const trackLink = page.getByRole('link', { name: 'Buyurtmani kuzatish' })
    await expect(trackLink).toBeVisible()
    await expect(trackLink).toHaveAttribute('href', '/store/asma/order/e2e_order_1')
  })

  test('bo\'sh savat: checkout bo\'sh holatni ko\'rsatadi', async ({ page }) => {
    // Savatni tozalab kiramiz
    await page.addInitScript((key) => localStorage.removeItem(key), STORE_KEY)
    await page.goto('/store/asma/checkout')
    await expect(page.getByText("Savatingiz bo'sh")).toBeVisible()
  })
})
