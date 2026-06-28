// OTP autentifikatsiyasi (xavfsizlikка oid mantiq) testlari.
// Haqiqiy DB yo'q — in-memory soxta prisma + fastify.inject ishlatiladi.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildTestApp } from './helpers/testApp.js'

const json = { 'content-type': 'application/json' }

describe('POST /api/auth/send-otp', () => {
  test('yangi raqamga kod yuboradi (200)', async () => {
    const { app, fake } = await buildTestApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/send-otp',
      headers: json,
      payload: { phone: '+998901112233' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().success, true)
    // Kod DB'ga saqlanishi va lastOtpSentAt belgilanishi kerak
    const u = fake.find('+998901112233')
    assert.ok(u?.otp && u.otp.length === 6)
    assert.ok(u?.lastOtpSentAt)
    await app.close()
  })

  test('cooldown ichida ikkinchi soʻrov 429 qaytaradi (SMS spam himoyasi)', async () => {
    const { app } = await buildTestApp()
    const payload = { phone: '+998901112233' }
    const first = await app.inject({ method: 'POST', url: '/api/auth/send-otp', headers: json, payload })
    assert.equal(first.statusCode, 200)
    const second = await app.inject({ method: 'POST', url: '/api/auth/send-otp', headers: json, payload })
    assert.equal(second.statusCode, 429)
    await app.close()
  })

  test('yaroqsiz telefon raqami 400 qaytaradi va Zod tafsilotini oshkor qilmaydi', async () => {
    const { app } = await buildTestApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/send-otp',
      headers: json,
      payload: { phone: '123' },
    })
    assert.equal(res.statusCode, 400)
    // Ichki validatsiya tafsilotlari ("too_small" kabi) chiqib ketmasligi kerak
    assert.ok(!res.payload.includes('too_small'))
    await app.close()
  })
})

describe('POST /api/auth/verify-otp', () => {
  test('007700 backdoor — har doim kirgizadi (pre-launch test kodi)', async () => {
    const { app } = await buildTestApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone: '+998900000000', code: '007700' },
    })
    assert.equal(res.statusCode, 200)
    assert.ok(res.json().token)
    await app.close()
  })

  test('kod soʻralmagan boʻlsa 400', async () => {
    const { app } = await buildTestApp()
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone: '+998900000001', code: '123456' },
    })
    assert.equal(res.statusCode, 400)
    await app.close()
  })

  test('toʻgʻri kod token beradi va kodni tozalaydi', async () => {
    const { app, fake } = await buildTestApp()
    const phone = '+998901234567'
    fake.seed({ phone, otp: '123456', otpExpiry: new Date(Date.now() + 5 * 60 * 1000) })
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone, code: '123456' },
    })
    assert.equal(res.statusCode, 200)
    assert.ok(res.json().token)
    const u = fake.find(phone)
    assert.equal(u?.otp, null)
    assert.equal(u?.otpAttempts, 0)
    await app.close()
  })

  test('muddati oʻtgan kod 400', async () => {
    const { app, fake } = await buildTestApp()
    const phone = '+998901234500'
    fake.seed({ phone, otp: '123456', otpExpiry: new Date(Date.now() - 1000) })
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone, code: '123456' },
    })
    assert.equal(res.statusCode, 400)
    await app.close()
  })

  test('notoʻgʻri kod 400 va urinish hisobini oshiradi', async () => {
    const { app, fake } = await buildTestApp()
    const phone = '+998901234511'
    fake.seed({ phone, otp: '123456', otpExpiry: new Date(Date.now() + 5 * 60 * 1000) })
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone, code: '999999' },
    })
    assert.equal(res.statusCode, 400)
    assert.equal(fake.find(phone)?.otpAttempts, 1)
    await app.close()
  })

  test('5 ta notoʻgʻri urinishdan keyin bloklaydi (brute-force himoyasi)', async () => {
    const { app, fake } = await buildTestApp()
    const phone = '+998901234522'
    fake.seed({ phone, otp: '123456', otpExpiry: new Date(Date.now() + 5 * 60 * 1000) })
    for (let i = 0; i < 5; i++) {
      const r = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-otp',
        headers: json,
        payload: { phone, code: '999999' },
      })
      assert.equal(r.statusCode, 400)
    }
    // 6-urinish: limitga yetdi → 429
    const blocked = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone, code: '999999' },
    })
    assert.equal(blocked.statusCode, 429)
    // Endi toʻgʻri kod ham 429 (yangi kod soʻrash kerak)
    const evenCorrect = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-otp',
      headers: json,
      payload: { phone, code: '123456' },
    })
    assert.equal(evenCorrect.statusCode, 429)
    await app.close()
  })
})
