// Eskiz.uz SMS gateway

let eskizToken: string | null = null
let tokenExpiry = 0

async function getEskizToken(): Promise<string> {
  if (eskizToken && Date.now() < tokenExpiry) return eskizToken

  const res = await fetch('https://notify.eskiz.uz/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }),
  })

  if (!res.ok) throw new Error('Eskiz login failed')
  const data = await res.json()
  eskizToken = data.data.token
  tokenExpiry = Date.now() + 29 * 60 * 1000 // 29 daqiqa
  return eskizToken!
}

export async function sendSms(phone: string, message: string): Promise<void> {
  // Dev muhitda SMS yuborilmaydi
  if (process.env.NODE_ENV !== 'production' || !process.env.ESKIZ_EMAIL) {
    console.log(`[SMS DEV] ${phone}: ${message}`)
    return
  }

  const token = await getEskizToken()
  const normalizedPhone = phone.replace(/\D/g, '') // +998901234567 → 998901234567

  const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mobile_phone: normalizedPhone,
      message,
      from: process.env.ESKIZ_FROM ?? '4546',
      callback_url: '',
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    // Token muddati o'tgan bo'lsa, yangilab qayta urinish
    if (err.message?.includes('token')) {
      eskizToken = null
      return sendSms(phone, message)
    }
    throw new Error(`SMS yuborilmadi: ${err.message}`)
  }
}
