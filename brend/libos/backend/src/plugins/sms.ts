// TextUp.uz SMS gateway (SMSPortal REST API asosida)
// Auth: HTTP Basic (apiKey:apiSecret). Endpoint: POST /bulkmessages
// Body: { messages: [{ content, destination }] }

// Baza URL — kerak bo'lsa TEXTUP_API_URL env bilan almashtiriladi. BOM/probel tozalanadi.
const API_URL = (process.env.TEXTUP_API_URL || 'https://rest.smsportal.com/bulkmessages')
  .replace(/^﻿/, '')
  .trim()

const cleanEnv = (s?: string) =>
  s?.replace(/^﻿/, '').trim().replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '').trim()

export async function sendSms(phone: string, message: string): Promise<void> {
  const apiKey = cleanEnv(process.env.TEXTUP_API_KEY)
  const apiSecret = cleanEnv(process.env.TEXTUP_API_SECRET)

  // Dev muhitda yoki kalitlar yo'q bo'lsa — SMS yuborilmaydi, konsolga yoziladi.
  // (007700 universal test kodi baribir ishlaydi.)
  if (process.env.NODE_ENV !== 'production' || !apiKey || !apiSecret) {
    console.log(`[SMS DEV] ${phone}: ${message}`)
    return
  }

  const destination = phone.replace(/\D/g, '') // +998901234567 → 998901234567
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      messages: [{ content: message, destination }],
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`SMS yuborilmadi (${res.status}): ${err.slice(0, 200)}`)
  }
}
