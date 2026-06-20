// To'lov xavfsizligi testlari: imzo (Click) va auth (Payme) tekshiruvi.
// Bu joylardagi xato = soxta to'lov tasdig'i (firibgarlik), shuning uchun
// alohida e'tibor.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { checkSign } from '../src/routes/payment/click.js'
import { checkAuth } from '../src/routes/payment/payme.js'
import { buildPaymentTestApp } from './helpers/paymentApp.js'

// Bu modullar import paytida env o'qimaydi (faqat funksiya chaqiruvida yoki
// route registratsiyasida). Shuning uchun env'ni shu yerda — test'lar
// ishlashidan oldin — o'rnatish kifoya. Click route'i CLICK_SECRET_KEY'ni
// buildPaymentTestApp ichida (registratsiyada) o'qiydi.
const CLICK_SECRET = 'click_test_secret'
const PAYME_SECRET = 'payme_test_secret'
process.env.CLICK_SECRET_KEY = CLICK_SECRET
process.env.CLICK_SERVICE_ID = '12345'
process.env.PAYME_IS_TEST = 'true'
process.env.PAYME_TEST_SECRET_KEY = PAYME_SECRET

const json = { 'content-type': 'application/json' }

const baseClick: Record<string, string> = {
  click_trans_id: '111',
  service_id: '12345',
  click_paydoc_id: '999',
  merchant_trans_id: 'order_1',
  amount: '50000',
  action: '0',
  sign_time: '2026-01-01 00:00:00',
}

function clickSign(p: Record<string, string>, secret: string): string {
  return createHash('md5')
    .update(`${p.click_trans_id}${p.service_id}${secret}${p.merchant_trans_id}${p.amount}${p.action}${p.sign_time}`)
    .digest('hex')
}

function basicAuth(login: string, password: string): string {
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64')
}

describe('Click checkSign — MD5 imzo tekshiruvi', () => {
  test('toʻgʻri imzo → true', () => {
    const sign_string = clickSign(baseClick, CLICK_SECRET)
    assert.equal(checkSign({ ...baseClick, sign_string }, CLICK_SECRET, 0), true)
  })

  test('notoʻgʻri sign_string → false', () => {
    assert.equal(checkSign({ ...baseClick, sign_string: 'deadbeef' }, CLICK_SECRET, 0), false)
  })

  test('summa oʻzgartirilsa imzo buziladi → false (firibgarlikka qarshi)', () => {
    const sign_string = clickSign(baseClick, CLICK_SECRET)
    // Tajovuzkor summani oshiradi, lekin eski imzoni qoldiradi
    assert.equal(checkSign({ ...baseClick, amount: '1', sign_string }, CLICK_SECRET, 0), false)
  })

  test('notoʻgʻri maxfiy kalit bilan imzolansa → false', () => {
    const sign_string = clickSign(baseClick, 'boshqa_secret')
    assert.equal(checkSign({ ...baseClick, sign_string }, CLICK_SECRET, 0), false)
  })
})

describe('Payme checkAuth — Basic auth tekshiruvi', () => {
  test('toʻgʻri Paycom:secret → true', () => {
    assert.equal(checkAuth({ headers: { authorization: basicAuth('Paycom', PAYME_SECRET) } }), true)
  })

  test('auth header yoʻq → false', () => {
    assert.equal(checkAuth({ headers: {} }), false)
  })

  test('Basic boʻlmagan sxema → false', () => {
    assert.equal(checkAuth({ headers: { authorization: 'Bearer xyz' } }), false)
  })

  test('notoʻgʻri parol → false', () => {
    assert.equal(checkAuth({ headers: { authorization: basicAuth('Paycom', 'xato') } }), false)
  })

  test('notoʻgʻri login → false', () => {
    assert.equal(checkAuth({ headers: { authorization: basicAuth('Hacker', PAYME_SECRET) } }), false)
  })
})

describe('Click webhook — soxta imzo rad etiladi', () => {
  test('notoʻgʻri imzo → SIGN_FAILED (-1) va DB ga tegmaydi', async () => {
    const { app } = await buildPaymentTestApp() // throwingPrisma: DB ga tegsa yiqiladi
    const res = await app.inject({
      method: 'POST',
      url: '/api/payment/click/webhook',
      headers: json,
      payload: { ...baseClick, sign_string: 'soxta_imzo' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().error, -1) // CLICK_ERROR.SIGN_FAILED
    await app.close()
  })
})

describe('Payme webhook — ruxsatsiz soʻrov rad etiladi', () => {
  test('auth yoʻq → 401, kod -32504 va DB ga tegmaydi', async () => {
    const { app } = await buildPaymentTestApp() // throwingPrisma
    const res = await app.inject({
      method: 'POST',
      url: '/api/payment/payme/webhook',
      headers: json,
      payload: { method: 'CheckPerformTransaction', params: {}, id: 1 },
    })
    assert.equal(res.statusCode, 401)
    assert.equal(res.json().error.code, -32504)
    await app.close()
  })

  test('notoʻgʻri parol bilan → 401 va DB ga tegmaydi', async () => {
    const { app } = await buildPaymentTestApp() // throwingPrisma
    const res = await app.inject({
      method: 'POST',
      url: '/api/payment/payme/webhook',
      headers: { ...json, authorization: basicAuth('Paycom', 'xato_parol') },
      payload: { method: 'CheckPerformTransaction', params: {}, id: 1 },
    })
    assert.equal(res.statusCode, 401)
    assert.equal(res.json().error.code, -32504)
    await app.close()
  })
})
