import { translateApiError } from '@libos/shared'
import type { Lang } from '@libos/shared'

// Backend xatolarini foydalanuvchi tilida ko'rsatish — MOBIL tomondagi qat'iy variant.
//
// `translateApiError` (shared) javobda `code` bo'lmasa server matnini o'zi
// ko'rsatadi, server matni esa DOIM o'zbekcha. Ya'ni `code` yubormaydigan
// endpointlarda (upload, 401 auth, Fastify'ning o'z 4xx xatolari) ruscha/inglizcha
// interfeysga baribir o'zbekcha matn sizib o'tardi.
//
// Bu yerdagi variant qoidani teskari qo'yadi: server matni FAQAT tanilgan `code`
// orqali ishlatiladi, aks holda tarjima qilingan zaxira matn beriladi.

type ApiErr = { code?: string; status?: number; message?: string } | null

export function translateApiErrorStrict(
  err: unknown,
  tr: Record<string, string>,
  fallback: string,
): string {
  const e = err as ApiErr
  // Tanilgan kod — shared tarjimon ishlatiladi (u `{param}` o'rinlarini ham to'ldiradi).
  if (e?.code && tr[`err${e.code}`]) return translateApiError(err, tr, fallback)
  // Sessiya tugagan / token yo'q. Backend bu holatda `code` yubormaydi (server.ts).
  if (e?.status === 401) return tr.mLoginRequired
  // Kod yo'q → server matni o'zbekcha, ko'rsatmaymiz.
  return fallback
}

/**
 * Rasm yuklash xatolari. Backend `/upload` `code` yubormaydi (uning matnlari
 * o'zbekcha), lekin HTTP holati ma'noli — shuni tarjima qilamiz.
 */
export function translateUploadError(err: unknown, lang: Lang): string {
  const status = (err as ApiErr)?.status
  const L = (uz: string, ru: string, en: string) => (lang === 'ru' ? ru : lang === 'en' ? en : uz)

  if (status === 413) {
    return L('Rasm hajmi juda katta (maksimum 6MB).', 'Файл слишком большой (максимум 6 МБ).', 'Image is too large (6MB maximum).')
  }
  if (status === 400) {
    return L(
      'Faqat JPG, PNG, WEBP, HEIC yoki GIF rasm yuklash mumkin.',
      'Можно загружать только JPG, PNG, WEBP, HEIC или GIF.',
      'Only JPG, PNG, WEBP, HEIC or GIF images can be uploaded.',
    )
  }
  if (status === 401) {
    return L('Avval tizimga kiring.', 'Сначала войдите в систему.', 'Please log in first.')
  }
  if (status === 503) {
    return L(
      'Rasm xizmati vaqtincha ishlamayapti. Keyinroq urinib ko\'ring.',
      'Сервис изображений временно недоступен. Попробуйте позже.',
      'The image service is temporarily unavailable. Please try again later.',
    )
  }
  return L(
    'Rasmni yuklab bo\'lmadi. Internetni tekshirib, qayta urinib ko\'ring.',
    'Не удалось загрузить изображение. Проверьте интернет и попробуйте снова.',
    'Could not upload the image. Check your connection and try again.',
  )
}
