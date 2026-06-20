// Sentry'ni server boshlanishida ishga tushiramiz.
// MUHIM: bu fayl server.ts'da ENG BIRINCHI import bo'lishi kerak — shunda
// Sentry boshqa kutubxonalardan oldin ishga tushadi (avto-instrumentatsiya).
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ||
    'https://4791f292c71685bf6dd6d6a8ab4041be@o4511596229296128.ingest.us.sentry.io/4511596232638464',
  // Faqat productionda — lokal dev xatolari Sentry'ni to'ldirmasin
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1.0,
})
