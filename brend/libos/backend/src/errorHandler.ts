import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import * as Sentry from '@sentry/node'
import { ZodError } from 'zod'

// Markaziy xato ishlovchisi.
// - Zod validatsiya xatolari → 400 (ichki tafsilotlar oshkor qilinmaydi)
// - Fastify'ning o'z 4xx xatolari (buzilgan JSON, noto'g'ri content-type) → o'sha holat
// - Qolganlari → 500: serverda log + Sentry'ga yuboriladi, mijozga umumiy xabar
// Faqat kutilmagan 500'lar Sentry'ga boradi — 4xx (mijoz xatolari) yuborilmaydi.
export async function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  if (err instanceof ZodError) {
    return reply.status(400).send({ error: "Yaroqsiz ma'lumot yuborildi" })
  }

  if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 500) {
    return reply.status(err.statusCode).send({ error: err.message })
  }

  req.log.error(err)
  Sentry.captureException(err)
  // Serverless'da funksiya "muzlab" qolishidan oldin event yuborib ulgurish uchun.
  // Sentry ishga tushmagan bo'lsa (test/dev) — darrov resolve bo'ladi.
  await Sentry.flush(2000)
  return reply.status(500).send({ error: 'Server xatosi' })
}
