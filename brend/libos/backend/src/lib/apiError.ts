import type { FastifyReply } from 'fastify'

/**
 * Mijozga ko'rinadigan xatolar uchun barqaror KODLAR.
 *
 * Muammo: backend xato matnini faqat o'zbekcha qaytarardi va ilova uni
 * to'g'ridan-to'g'ri ko'rsatardi. Natijada interfeys ingliz/rus tilida bo'lsa ham
 * server xatosi o'zbekcha chiqardi. (Apple reviewer'i 2026-08-18 da aynan shuni
 * ko'rib ilovani buzuq deb hisobladi va rad etdi.)
 *
 * Yechim: javobda `code` qaytariladi, tarjimani MIJOZ qiladi
 * (`translateApiError` — packages/shared). `error` maydoni o'zbekcha matn bilan
 * QOLADI: eski ilova versiyalari va boshqa mijozlar buzilmasin (fallback).
 */
export const ErrorCodes = {
  // Auth / OTP
  OTP_COOLDOWN: 'OTP_COOLDOWN',       // params: { seconds }
  OTP_NOT_REQUESTED: 'OTP_NOT_REQUESTED',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_TOO_MANY: 'OTP_TOO_MANY',
  OTP_WRONG: 'OTP_WRONG',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  SMS_FAILED: 'SMS_FAILED',
  // Buyurtma
  STORE_NOT_FOUND: 'STORE_NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_NOT_DELIVERED: 'ORDER_NOT_DELIVERED',
  REVIEW_EXISTS: 'REVIEW_EXISTS',
  PICKUP_UNSUPPORTED: 'PICKUP_UNSUPPORTED',
  TRANSFER_UNAVAILABLE: 'TRANSFER_UNAVAILABLE',
  INVALID_CART_ITEMS: 'INVALID_CART_ITEMS',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  // Umumiy
  FORBIDDEN: 'FORBIDDEN',
  INVALID_INPUT: 'INVALID_INPUT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Xato javobini yuboradi: `{ error, code, params }`.
 *
 * @param message O'zbekcha matn — kodni tanimaydigan mijoz uchun zaxira.
 * @param params  Matndagi o'rin egallovchilar (masalan `{ seconds: 54 }`).
 */
export function fail(
  reply: FastifyReply,
  status: number,
  code: ErrorCode,
  message: string,
  params?: Record<string, string | number>,
) {
  return reply.status(status).send({ error: message, code, ...(params ? { params } : {}) })
}
