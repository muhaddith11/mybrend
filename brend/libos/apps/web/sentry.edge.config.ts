// Edge runtime (middleware, edge route'lar) uchun Sentry sozlamasi.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    'https://4791f292c71685bf6dd6d6a8ab4041be@o4511596229296128.ingest.us.sentry.io/4511596232638464',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1.0,
})
