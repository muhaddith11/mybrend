// Rasmni Supabase Storage'ga yuklash. Fayl backend'ning /upload endpoint'iga
// (multipart) yuboriladi; backend service-key bilan Supabase'ga yozib, public
// URL qaytaradi. (Cloudinary geo-blok bo'lgani uchun Supabase'ga o'tildi.)
//
// ⚠️ Yuklashdan OLDIN rasm kichraytiriladi. Sabab: backend Vercel serverless'da
// ishlaydi va uning request body limiti ~4.5MB. Zamonaviy telefon kamerasi
// (50–108MP) rasmi expo-image-picker'ning `quality: 0.6` si bilan ham 4.5MB dan
// oshib ketardi → Vercel uni backend'gacha yetkazmay 413 (FUNCTION_PAYLOAD_TOO_LARGE)
// beradi yoki ulanish uziladi → foydalanuvchi "Rasmni yuklab bo'lmadi. Internetni
// tekshirib..." fallback xatosini ko'rardi. picker faqat SIFATNI pasaytiradi,
// piksel O'LCHAMINI emas — shuning uchun bu yerda o'lchamni ham cheklaymiz.

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

const _rawUrl =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3001/api'
const BASE_URL = _rawUrl.replace(/^﻿/, '')

// Yuklanadigan rasmning maksimal kengligi (piksel). Bundan kengrogʻi shu kenglikka
// kichraytiriladi (nisbat saqlanadi). 1280px avatar/mahsulot/QR uchun yetarli va
// hosil bo'lgan JPEG odatda <500KB — Vercel limitidan ancha past.
const MAX_WIDTH = 1280

/**
 * Rasmni MAX_WIDTH gacha kichraytirib, kichik faylga aylantiradi (kenglik katta
 * bo'lsa). Shaffoflik yo'qolmasligi uchun PNG manbasi PNG bo'lib qoladi; qolgani
 * JPEG (fotolar uchun eng kichik). Manipulyator biror sababdan yiqilса — asl
 * faylni qaytaradi, ya'ni yuklashni butunlay to'xtatib qo'ymaydi.
 */
async function shrink(localUri: string): Promise<{ uri: string; type: string; name: string }> {
  const isPng = /\.png(\?|$)/i.test(localUri)
  const format = isPng ? SaveFormat.PNG : SaveFormat.JPEG
  const type = isPng ? 'image/png' : 'image/jpeg'
  const name = isPng ? 'upload.png' : 'upload.jpg'
  try {
    const original = await ImageManipulator.manipulate(localUri).renderAsync()
    const ref =
      original.width > MAX_WIDTH
        ? await ImageManipulator.manipulate(localUri).resize({ width: MAX_WIDTH }).renderAsync()
        : original
    // Har doim qayta saqlaymiz — kichik o'lchamli, lekin ulkan faylli manba
    // (masalan siqilmagan PNG) ham kichrayib, payload kafolatli kichik bo'ladi.
    const saved = await ref.saveAsync({ compress: 0.7, format })
    return { uri: saved.uri, type, name }
  } catch {
    return { uri: localUri, type, name }
  }
}

export async function uploadImage(localUri: string, token: string): Promise<string> {
  const { uri, type, name } = await shrink(localUri)
  const form = new FormData()
  form.append('file', { uri, type, name } as any)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    // Serverning `error` matni o'zbekcha va `code` yubormaydi — uni foydalanuvchiga
    // ko'rsatib bo'lmaydi (ruscha/inglizcha interfeysga o'zbekcha sizardi). HTTP
    // holatini biriktiramiz: `translateUploadError` shundan tarjima qiladi,
    // `message` esa faqat log/Sentry uchun zaxira bo'lib qoladi.
    const error = new Error(data.error ?? 'upload-failed') as Error & { status?: number }
    error.status = res.status
    throw error
  }
  return data.url as string
}
