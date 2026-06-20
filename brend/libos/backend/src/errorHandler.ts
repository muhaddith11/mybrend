import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

// Markaziy xato ishlovchisi.
// - Zod validatsiya xatolari → 400 (ichki tafsilotlar oshkor qilinmaydi)
// - Fastify'ning o'z 4xx xatolari (buzilgan JSON, noto'g'ri content-type) → o'sha holat
// - Qolganlari → 500, faqat serverda log qilinadi, mijozga umumiy xabar
export function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  if (err instanceof ZodError) {
    return reply.status(400).send({ error: "Yaroqsiz ma'lumot yuborildi" })
  }

  if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 500) {
    return reply.status(err.statusCode).send({ error: err.message })
  }

  req.log.error(err)
  return reply.status(500).send({ error: 'Server xatosi' })
}
