// Mijozga bildirishnoma: DB'ga yozuv + Expo push xizmati orqali qurilmaga xabar.
//
// Yozuv HAR DOIM saqlanadi, push esa yetib bormasligi mumkin (ruxsat berilmagan,
// qurilma oflayn, token eskirgan) — shuning uchun ilova ichidagi ro'yxat asosiy
// manba, push esa ustiga qo'shimcha. Chaqiruvchi xatoni `.catch()` bilan yutadi
// (routes/orders.ts:203 dagi Telegram xabari bilan bir xil yondashuv) — bildirishnoma
// asosiy amalni (buyurtma, status o'zgarishi) hech qachon bloklamasin.

import type { PrismaClient, NotificationType, Prisma } from '@prisma/client'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
// Expo bitta so'rovda ko'pi bilan 100 ta xabar qabul qiladi.
const EXPO_CHUNK_SIZE = 100

export type Lang = 'uz' | 'ru' | 'en'

export type NotificationPayload = {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, string>
}

/** Noma'lum til kelsa — o'zbekchaga tushamiz (DB'da default ham "uz"). */
function asLang(lang: string | null | undefined): Lang {
  return lang === 'ru' || lang === 'en' ? lang : 'uz'
}

// ─── Buyurtma holati matnlari ────────────────────────────────────────────────
// Bu yerda uch til saqlanadi, chunki backend `@libos/shared` paketiga bog'liq emas
// (mustaqil deploy qilinadi — auth.ts dagi SMS matnlari ham shunday).
// Nomlanish packages/shared/src/i18n.ts dagi status nomlariga mos bo'lsin.

type StatusKey = 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED'

const ORDER_STATUS_TEXT: Record<Lang, Record<StatusKey, { title: string; body: (store: string) => string }>> = {
  uz: {
    CONFIRMED: { title: 'Buyurtmangiz tasdiqlandi', body: (s) => `${s} buyurtmangizni tasdiqladi.` },
    PREPARING: { title: 'Buyurtmangiz tayyorlanmoqda', body: (s) => `${s} buyurtmangizni tayyorlamoqda.` },
    DELIVERING: { title: "Buyurtmangiz yo'lda", body: (s) => `${s} buyurtmangizni yetkazib bermoqda.` },
    DELIVERED: { title: 'Buyurtmangiz yetkazildi', body: (s) => `${s} buyurtmasi yetkazildi. Xaridingiz uchun rahmat!` },
    CANCELLED: { title: 'Buyurtmangiz bekor qilindi', body: (s) => `${s} buyurtmangizni bekor qildi.` },
  },
  ru: {
    CONFIRMED: { title: 'Заказ подтверждён', body: (s) => `${s} подтвердил ваш заказ.` },
    PREPARING: { title: 'Заказ готовится', body: (s) => `${s} готовит ваш заказ.` },
    DELIVERING: { title: 'Заказ в пути', body: (s) => `${s} доставляет ваш заказ.` },
    DELIVERED: { title: 'Заказ доставлен', body: (s) => `Заказ из ${s} доставлен. Спасибо за покупку!` },
    CANCELLED: { title: 'Заказ отменён', body: (s) => `${s} отменил ваш заказ.` },
  },
  en: {
    CONFIRMED: { title: 'Order confirmed', body: (s) => `${s} confirmed your order.` },
    PREPARING: { title: 'Order is being prepared', body: (s) => `${s} is preparing your order.` },
    DELIVERING: { title: 'Order on the way', body: (s) => `${s} is delivering your order.` },
    DELIVERED: { title: 'Order delivered', body: (s) => `Your order from ${s} has been delivered. Thank you!` },
    CANCELLED: { title: 'Order cancelled', body: (s) => `${s} cancelled your order.` },
  },
}

/** Buyurtma holati uchun sarlavha+matn. Noma'lum status bo'lsa `null` (xabar yuborilmaydi). */
export function orderStatusMessage(
  status: string,
  storeName: string,
  lang: string | null | undefined,
): { title: string; body: string } | null {
  const tpl = ORDER_STATUS_TEXT[asLang(lang)][status as StatusKey]
  if (!tpl) return null
  return { title: tpl.title, body: tpl.body(storeName) }
}

// ─── Expo push ───────────────────────────────────────────────────────────────

type ExpoMessage = {
  to: string
  title: string
  body: string
  data?: Record<string, string>
  sound: 'default'
  channelId: 'default'
  priority: 'high'
}

type ExpoTicket = {
  status: 'ok' | 'error'
  message?: string
  details?: { error?: string }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Expo'ga xabarlarni yuboradi va yaroqsiz token'larni qaytaradi.
 * `DeviceNotRegistered` — ilova o'chirilgan yoki token almashgan: bunday token
 * DB'da qolsa har safar bekorga so'rov ketadi, shuning uchun tozalanadi.
 */
async function sendExpoPush(messages: ExpoMessage[]): Promise<string[]> {
  const invalid: string[] = []

  for (const batch of chunk(messages, EXPO_CHUNK_SIZE)) {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(batch),
    })
    if (!res.ok) throw new Error(`Expo push ${res.status}`)

    // Javobdagi `data` — kiritilgan xabarlar bilan bir xil tartibda.
    const json = (await res.json().catch(() => null)) as { data?: ExpoTicket[] } | null
    json?.data?.forEach((ticket, i) => {
      if (ticket?.status !== 'error') return
      if (ticket.details?.error === 'DeviceNotRegistered') {
        invalid.push(batch[i].to)
      } else {
        // Masalan InvalidCredentials (FCM kaliti) yoki MessageRateExceeded — jimgina
        // yutilsa push nega kelmayotgani hech qayerda ko'rinmaydi. Token loglanmaydi.
        console.warn('[push] Expo ticket error:', ticket.details?.error ?? 'unknown', ticket.message ?? '')
      }
    })
  }

  return invalid
}

/** Foydalanuvchi token'lariga push yuboradi; yaroqsizlarini DB'dan o'chiradi. */
async function pushToTokens(
  prisma: PrismaClient,
  tokens: { token: string }[],
  payload: NotificationPayload,
): Promise<void> {
  if (!tokens.length) return

  const messages: ExpoMessage[] = tokens.map((t) => ({
    to: t.token,
    title: payload.title,
    body: payload.body,
    ...(payload.data ? { data: payload.data } : {}),
    sound: 'default',
    channelId: 'default',
    priority: 'high',
  }))

  const invalid = await sendExpoPush(messages)
  if (invalid.length) {
    await prisma.pushToken.deleteMany({ where: { token: { in: invalid } } })
  }
}

// ─── Ommaviy API ─────────────────────────────────────────────────────────────

/**
 * Bitta mijozga bildirishnoma: DB yozuvi + uning barcha qurilmalariga push.
 * Push xatosi yozuvni bekor qilmaydi — chaqiruvchi `.catch()` bilan loglaydi.
 */
export async function notifyUser(
  prisma: PrismaClient,
  userId: string,
  payload: NotificationPayload,
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      ...(payload.data ? { data: payload.data as Prisma.InputJsonValue } : {}),
    },
  })

  const tokens = await prisma.pushToken.findMany({ where: { userId }, select: { token: true } })
  await pushToTokens(prisma, tokens, payload)
}

/**
 * Bir nechta mijozga bir xil bildirishnoma (do'kon e'loni).
 * Yozuvlar bitta `createMany` bilan, push esa 100 talik bo'laklarda ketadi.
 */
export async function notifyUsers(
  prisma: PrismaClient,
  userIds: string[],
  payload: NotificationPayload,
): Promise<void> {
  if (!userIds.length) return

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      ...(payload.data ? { data: payload.data as Prisma.InputJsonValue } : {}),
    })),
  })

  const tokens = await prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  })
  await pushToTokens(prisma, tokens, payload)
}
