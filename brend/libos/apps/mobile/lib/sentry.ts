// Yengil crash-reporting — native SDK'siz (u production Android build'ni buzgani
// uchun olib tashlangan edi). Xatolar backend'ning /api/client-error endpointiga
// yuboriladi; backend ularni o'z Sentry'siga (SENTRY_DSN bo'lsa) yoki Vercel
// loglariga uzatadi. To'liq JS — OTA update bilan yetkaziladi, hech qanday paket
// yoki EAS secret talab qilinmaydi.
//
// Ikki manba qamrab olinadi:
//   1) React render xatolari — components/ErrorBoundary.tsx → captureException
//   2) Ushlanmagan global JS xatolari (async, event handler) — ErrorUtils global handler

import { Platform } from 'react-native'
import Constants from 'expo-constants'

const _rawUrl =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3001/api'
const BASE_URL = _rawUrl.replace(/^﻿/, '')
const APP_VERSION = Constants.expoConfig?.version ?? 'dev'

export const sentryEnabled = true

// Bir xil xatoni takror-takror yubormaslik (crash-loop/flood himoyasi):
// so'nggi (message+context) kalitlari 30s davomida eslab qolinadi.
const recent = new Set<string>()

export function captureException(error: unknown, context?: string): void {
  try {
    const err = error as any
    const message = String(err?.message ?? err ?? 'Unknown error').slice(0, 2000)
    const stack = typeof err?.stack === 'string' ? err.stack.slice(0, 8000) : undefined

    // Dev'da faqat konsolga — prod backend'ni dev xatolari bilan to'ldirmaymiz.
    if (__DEV__) {
      console.error('[captureException]', message, context ?? '')
      return
    }

    const key = message + '|' + (context ?? '')
    if (recent.has(key)) return
    recent.add(key)
    setTimeout(() => recent.delete(key), 30_000)

    // Best-effort: hisobot yuborish ilovani HECH QACHON bloklamaydi/yiqitmaydi.
    fetch(`${BASE_URL}/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        stack,
        context,
        platform: Platform.OS,
        appVersion: APP_VERSION,
      }),
    }).catch(() => {})
  } catch {
    // Hisobotning o'zi yiqilsa — jim (aks holda cheksiz loop bo'lishi mumkin).
  }
}

export function initSentry(): void {
  // Render'dan tashqaridagi ushlanmagan JS xatolarini ham qamrab olamiz.
  // Standart handler'ni SAQLAYMIZ — redbox (dev) / native crash ekrani baribir ishlaydi.
  const g = global as any
  if (g?.ErrorUtils && typeof g.ErrorUtils.getGlobalHandler === 'function') {
    const prev = g.ErrorUtils.getGlobalHandler()
    g.ErrorUtils.setGlobalHandler((err: any, isFatal?: boolean) => {
      captureException(err, isFatal ? 'fatal' : 'global')
      if (typeof prev === 'function') prev(err, isFatal)
    })
  }
}
