// TextUp.uz SMS gateway
// Oqim: email/parol bilan login → accessToken (JWT) → /v1/send bilan yuborish.
// Env: TEXTUP_EMAIL, TEXTUP_PASSWORD, TEXTUP_USER_ID (UUID), TEXTUP_NICKNAME_ID (ixtiyoriy).

const AUTH_URL = 'https://api-auth.textup.uz/v1/login'
const SEND_URL = 'https://sms-api.textup.uz/v1/send'

// Vercel env'ga xato bilan tushgan BOM (﻿), bo'sh joy va "NAME =" prefiksini tozalaymiz.
const cleanEnv = (s?: string) =>
  s?.replace(/^﻿/, '').trim().replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '').trim()

let accessToken: string | null = null
let tokenExpiry = 0

async function getToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEnv(process.env.TEXTUP_EMAIL),
      password: cleanEnv(process.env.TEXTUP_PASSWORD),
    }),
  })
  if (!res.ok) throw new Error('TextUp login failed')
  const data = await res.json()
  accessToken = data.accessToken
  tokenExpiry = Date.now() + 20 * 60 * 1000 // 20 daqiqa (401'da baribir yangilanadi)
  return accessToken!
}

export async function sendSms(phone: string, message: string, _retry = 0): Promise<void> {
  // Dev muhitda yoki sozlanmagan bo'lsa SMS yuborilmaydi — konsolga chiqaramiz.
  // (007700 universal test kodi baribir ishlaydi.)
  if (process.env.NODE_ENV !== 'production' || !process.env.TEXTUP_EMAIL) {
    console.log(`[SMS DEV] ${phone}: ${message}`)
    return
  }

  const token = await getToken()
  const recipient = phone.replace(/\D/g, '') // +998901234567 → 998901234567
  const nicknameId = cleanEnv(process.env.TEXTUP_NICKNAME_ID)

  const res = await fetch(SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId: cleanEnv(process.env.TEXTUP_USER_ID),
      message,
      recipients: [recipient],
      isOtp: true,
      // nicknameId berilmasa — qisqa raqamdan yuboriladi
      ...(nicknameId ? { nicknameId } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}) as any)
    // Token muddati o'tgan bo'lsa — yangilab BIR MARTA qayta urinish.
    if (res.status === 401 && _retry < 1) {
      accessToken = null
      return sendSms(phone, message, _retry + 1)
    }
    throw new Error(`SMS yuborilmadi (${res.status}): ${err.message ?? ''}`)
  }
}
