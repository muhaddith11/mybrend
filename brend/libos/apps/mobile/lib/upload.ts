// Rasmni Cloudinary'ga yuklash: avval backenddan imzo olamiz, keyin faylni
// to'g'ridan-to'g'ri Cloudinary'ga yuboramiz (server orqali o'tmaydi).
// Backend /upload/sign endi owner (admin) tokenini ham qabul qiladi.

const _rawUrl =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3001/api'
const BASE_URL = _rawUrl.replace(/^﻿/, '')

interface SignResponse {
  cloudName: string
  apiKey: string
  timestamp: string
  folder: string
  signature: string
  uploadUrl: string
}

export async function uploadImage(localUri: string, token: string): Promise<string> {
  // 1) Backenddan Cloudinary imzosini olamiz
  const signRes = await fetch(`${BASE_URL}/upload/sign`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!signRes.ok) {
    const e = await signRes.json().catch(() => ({}))
    throw new Error(e.error ?? "Rasm yuklash sozlanmagan yoki ruxsat yo'q")
  }
  const sign: SignResponse = await signRes.json()

  // 2) Faylni to'g'ridan-to'g'ri Cloudinary'ga yuklaymiz
  const form = new FormData()
  form.append('file', { uri: localUri, type: 'image/jpeg', name: 'upload.jpg' } as any)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', sign.timestamp)
  form.append('folder', sign.folder)
  form.append('signature', sign.signature)

  const upRes = await fetch(sign.uploadUrl, { method: 'POST', body: form })
  const data = await upRes.json()
  if (!data.secure_url) {
    throw new Error(data.error?.message ?? "Rasmni yuklab bo'lmadi")
  }
  return data.secure_url as string
}
