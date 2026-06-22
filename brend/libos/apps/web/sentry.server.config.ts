// Server (Node.js runtime) uchun Sentry sozlamasi.
// DSN env'dan olinadi (NEXT_PUBLIC_SENTRY_DSN). O'rnatilmasa Sentry o'chiq qoladi.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Faqat productionda yoqamiz — lokal dev xatolari Sentry'ni to'ldirmasin
  enabled: process.env.NODE_ENV === 'production',
  // Performance tracing. Trafik oshganda kvotani tejash uchun pasaytirish mumkin.
  tracesSampleRate: 1.0,
})
