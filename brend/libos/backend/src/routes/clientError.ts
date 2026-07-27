import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import * as Sentry from '@sentry/node'

// Mijoz (mobil/veb) crash hisobotlari uchun yengil qabul nuqtasi.
// Native Sentry SDK mobil EAS build'ni buzgani uchun (source-map bosqichi), mijoz
// xatolarini shu endpoint orqali qabul qilamiz va backend Sentry'ga uzatamiz
// (SENTRY_DSN bo'lsa) — aks holda Vercel loglariga tushadi. Auth talab qilinmaydi
// (ilova ochilishidayoq, login'gacha ham crash bo'lishi mumkin), lekin tor
// rate-limit va qat'iy uzunlik cheklovlari bilan himoyalangan.
const reportSchema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  platform: z.string().max(40).optional(), // ios | android | web
  appVersion: z.string().max(40).optional(),
  context: z.string().max(500).optional(), // qaysi ekran/oqim (masalan "checkout")
})

export default async function clientErrorRoutes(app: FastifyInstance) {
  // Log-flood/spam oldini olish: bitta IP daqiqasiga 30 ta hisobot.
  // (Testlarda rate-limit plugini yo'q → e'tiborsiz.)
  const rl = { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }

  app.post('/client-error', rl, async (req, reply) => {
    const body = reportSchema.parse(req.body)

    // Sentry'ga mijoz konteksti bilan yuboramiz. Message'ga [client] prefiks —
    // dashboard'da server xatolaridan ajralib tursin. Stack + kontekst `extra`da.
    Sentry.captureException(new Error(`[client] ${body.message}`), {
      tags: { source: 'client', platform: body.platform ?? 'unknown' },
      extra: {
        clientStack: body.stack,
        context: body.context,
        appVersion: body.appVersion,
      },
    })
    // Sentry o'chiq bo'lsa ham (DSN yo'q) — Vercel loglarida ko'rinsin.
    req.log.error({ clientError: body }, 'Mijoz crash hisoboti')
    // Serverless funksiya muzlashidan oldin yuborib ulgurish (Sentry o'chiq → darrov resolve).
    await Sentry.flush(2000)

    return reply.send({ ok: true })
  })
}
