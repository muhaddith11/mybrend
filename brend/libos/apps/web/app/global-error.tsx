'use client'

// Ildiz darajasidagi (layout/render) xatolarni ushlaб Sentry'ga yuboradi.
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="uz">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          gap: '1rem',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Nimadir xato ketdi
        </h2>
        <p style={{ color: '#666' }}>
          Sahifani yangilab koʻring yoki birozdan soʻng qayta urining.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid #ddd',
            cursor: 'pointer',
          }}
        >
          Yangilash
        </button>
      </body>
    </html>
  )
}
