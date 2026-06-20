// Next.js server boshlanishida ishga tushadi. Runtime'ga qarab tegishli
// Sentry sozlamasini yuklaydi.
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Server tomonidagi (RSC, route handler) xatolarni Sentry'ga yetkazadi
export const onRequestError = Sentry.captureRequestError
