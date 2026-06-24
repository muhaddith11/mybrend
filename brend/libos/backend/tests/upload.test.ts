// Cloudinary signed-upload endpointi testlari: imzo determinizmi, auth himoyasi,
// sozlanmagan holatda 503, va sozlangan holatda to'liq javob.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import { createHash } from 'node:crypto'
import { cloudinarySign } from '../src/routes/upload.js'
import uploadRoutes from '../src/routes/upload.js'

async function buildUploadApp() {
  const app = Fastify()
  app.register(jwt, { secret: 'test-secret' })
  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      await req.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Kirish uchun tizimga kiring' })
    }
  })
  app.register(uploadRoutes, { prefix: '/api' })
  await app.ready()
  return app
}

describe('cloudinarySign — SHA1 imzo', () => {
  test('determinizm + 40-belgili hex va qo\'lda hisob bilan mos', () => {
    const params = { timestamp: '1700000000', folder: 'libos' }
    const sig = cloudinarySign(params, 'maxfiy')
    assert.match(sig, /^[a-f0-9]{40}$/)
    // Cloudinary algoritmi: sha1(sorted "k=v&..." + apiSecret)
    const expected = createHash('sha1').update('folder=libos&timestamp=1700000000' + 'maxfiy').digest('hex')
    assert.equal(sig, expected)
  })

  test('boshqa secret → boshqa imzo', () => {
    const params = { timestamp: '1700000000', folder: 'libos' }
    assert.notEqual(cloudinarySign(params, 'a'), cloudinarySign(params, 'b'))
  })
})

describe('GET /api/upload/sign', () => {
  test('tokensiz → 401', async () => {
    const app = await buildUploadApp()
    const res = await app.inject({ method: 'GET', url: '/api/upload/sign' })
    assert.equal(res.statusCode, 401)
    await app.close()
  })

  test('Cloudinary sozlanmagan bo\'lsa → 503', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME
    delete process.env.CLOUDINARY_API_KEY
    delete process.env.CLOUDINARY_API_SECRET
    const app = await buildUploadApp()
    const token = app.jwt.sign({ userId: 'u1' })
    const res = await app.inject({
      method: 'GET',
      url: '/api/upload/sign',
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(res.statusCode, 503)
    await app.close()
  })

  test('sozlangan bo\'lsa → 200 va imzolangan parametrlar', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo'
    process.env.CLOUDINARY_API_KEY = 'key123'
    process.env.CLOUDINARY_API_SECRET = 'secret123'
    const app = await buildUploadApp()
    const token = app.jwt.sign({ userId: 'u1' })
    const res = await app.inject({
      method: 'GET',
      url: '/api/upload/sign',
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(res.statusCode, 200)
    const body = res.json()
    assert.equal(body.cloudName, 'demo')
    assert.equal(body.apiKey, 'key123')
    assert.match(body.signature, /^[a-f0-9]{40}$/)
    assert.equal(body.folder, 'zyff')
    assert.ok(body.uploadUrl.includes('demo'))
    await app.close()
  })
})
