// Sentry'ni server boshlanishida ishga tushiramiz.
// MUHIM: bu fayl server.ts'da ENG BIRINCHI import bo'lishi kerak — shunda
// Sentry boshqa kutubxonalardan oldin ishga tushadi (avto-instrumentatsiya).
import * as Sentry from '@sentry/node'

Sentry.init({
  // DSN env'dan (SENTRY_DSN). O'rnatilmasa Sentry o'chiq qoladi.
  dsn: process.env.SENTRY_DSN,
  // Faqat productionda — lokal dev xatolari Sentry'ni to'ldirmasin
  enabled: process.env.NODE_ENV === 'production',
  // So'rovlarning 10% trace qilinadi (1.0 = 100% kvota/xarajatni tez tugatardi).
  // SENTRY_TRACES_SAMPLE_RATE bilan boshqarish mumkin.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
})
