// Sentry'ni server boshlanishida ishga tushiramiz.
// MUHIM: bu fayl server.ts'da ENG BIRINCHI import bo'lishi kerak — shunda
// Sentry boshqa kutubxonalardan oldin ishga tushadi (avto-instrumentatsiya).
import * as Sentry from '@sentry/node'

Sentry.init({
  // DSN env'dan (SENTRY_DSN). O'rnatilmasa Sentry o'chiq qoladi.
  dsn: process.env.SENTRY_DSN,
  // Faqat productionda — lokal dev xatolari Sentry'ni to'ldirmasin
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1.0,
})
