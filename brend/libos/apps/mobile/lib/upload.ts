// Rasmni Supabase Storage'ga yuklash. Fayl backend'ning /upload endpoint'iga
// (multipart) yuboriladi; backend service-key bilan Supabase'ga yozib, public
// URL qaytaradi. (Cloudinary geo-blok bo'lgani uchun Supabase'ga o'tildi.)

const _rawUrl =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3001/api'
const BASE_URL = _rawUrl.replace(/^﻿/, '')

// localUri kengaytmasidan MIME turini aniqlaymiz (server ham tekshiradi).
function guessType(uri: string): { type: string; name: string } {
  const lower = uri.split('?')[0].toLowerCase()
  if (lower.endsWith('.png')) return { type: 'image/png', name: 'upload.png' }
  if (lower.endsWith('.webp')) return { type: 'image/webp', name: 'upload.webp' }
  if (lower.endsWith('.heic')) return { type: 'image/heic', name: 'upload.heic' }
  return { type: 'image/jpeg', name: 'upload.jpg' }
}

export async function uploadImage(localUri: string, token: string): Promise<string> {
  const { type, name } = guessType(localUri)
  const form = new FormData()
  form.append('file', { uri: localUri, type, name } as any)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Rasmni yuklab bo'lmadi")
  }
  return data.url as string
}
