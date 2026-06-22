// Brauzer (client) uchun Sentry sozlamasi. Next.js buni avtomatik yuklaydi.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1.0,
})

// Sahifalar orasidagi navigatsiyani kuzatish uchun
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
