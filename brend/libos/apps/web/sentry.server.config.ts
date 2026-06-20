// Server (Node.js runtime) uchun Sentry sozlamasi.
// DSN env'dan olinadi; bo'lmasa ma'lum qiymatga qaytadi (DSN ommaviy — xavfsiz).
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    'https://4791f292c71685bf6dd6d6a8ab4041be@o4511596229296128.ingest.us.sentry.io/4511596232638464',
  // Faqat productionda yoqamiz — lokal dev xatolari Sentry'ni to'ldirmasin
  enabled: process.env.NODE_ENV === 'production',
  // Performance tracing. Trafik oshganda kvotani tejash uchun pasaytirish mumkin.
  tracesSampleRate: 1.0,
})
