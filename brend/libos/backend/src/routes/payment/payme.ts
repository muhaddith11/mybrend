import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { restoreStock } from '../../lib/stock.js'
import { safeEqual } from '../../lib/crypto.js'

// Payme checkout URL'ini quradi. Amount tiyinda (so'm × 100), BigInt — overflow yo'q.
// `c` (callback) — to'lovdan keyin qaytadigan manzil; web'da davom-etish sahifasi
// (savatdagi keyingi do'kon to'loviga yo'naltiradi), mobil'da deep-link beriladi.
export function buildPaymePaymentUrl(
  order: { id: string; totalPrice: number },
  opts: { callbackUrl?: string } = {},
): string {
  const webUrl = process.env.WEB_URL ?? 'https://zyff.uz'
  const merchantId = process.env.PAYME_MERCHANT_ID ?? ''
  const isTest = process.env.PAYME_IS_TEST === 'true'
  const callback = opts.callbackUrl ?? `${webUrl}/checkout/pay-return`
  // Payme URL: base64(m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT_TIYIN;c=CALLBACK)
  const params = `m=${merchantId};ac.order_id=${order.id};a=${BigInt(order.totalPrice) * 100n};c=${callback}`
  const encoded = Buffer.from(params).toString('base64')
  const baseUrl = isTest ? 'https://checkout.test.paycom.uz' : 'https://checkout.paycom.uz'
  return `${baseUrl}/${encoded}`
}

// JSON-RPC so'rovining `id` maydoni — string yoki son bo'lishi mumkin.
type JsonRpcId = string | number

// Payme webhook `params` maydonida keladigan qiymatlar (rasmiy protokol).
// Hammasi ixtiyoriy: metodga qarab faqat ba'zilari to'ldiriladi, shuning uchun
// har birini ishlatishdan oldin tekshiramiz.
type PaymeParams = {
  id?: string                    // Payme tranzaksiya ID
  account?: { order_id?: string } // bizning buyurtma ID
  amount?: number                // tiyin
  time?: number                  // Payme yaratish vaqti (ms)
  reason?: number                // bekor qilish sababi
  from?: number                  // GetStatement: boshlanish (ms)
  to?: number                    // GetStatement: tugash (ms)
}

// checkAuth faqat `authorization` sarlavhasiga muhtoj — to'liq FastifyRequest
// shart emas, shuning uchun minimal struktura bilan tiplaymiz (test ham shu
// shaklda chaqiradi).
type AuthLike = { headers: { authorization?: string } }

// Payme xato kodlari (rasmiy hujjatdan)
const PAYME_ERROR = {
  PARSE_ERROR:          { code: -32700, message: { ru: 'Ошибка парсинга', uz: 'Parse xatosi' } },
  METHOD_NOT_FOUND:     { code: -32601, message: { ru: 'Метод не найден', uz: 'Metod topilmadi' } },
  INVALID_AMOUNT:       { code: -31001, message: { ru: 'Неверная сумма', uz: 'Summa noto\'g\'ri' } },
  INVALID_ACCOUNT:      { code: -31050, message: { ru: 'Заказ не найден', uz: 'Buyurtma topilmadi' } },
  TRANSACTION_NOT_FOUND:{ code: -31003, message: { ru: 'Транзакция не найдена', uz: 'Tranzaksiya topilmadi' } },
  ALREADY_DONE:         { code: -31060, message: { ru: 'Уже оплачено', uz: 'Allaqachon to\'langan' } },
  UNABLE_TO_PERFORM:    { code: -31008, message: { ru: 'Невозможно выполнить', uz: 'Bajarib bo\'lmaydi' } },
  CANCEL_REASON_UNKNOWN:{ code: -31007, message: { ru: 'Неизвестная причина отмены', uz: 'Noma\'lum bekor sababi' } },
}

// Payme bekor qilish sabablari
const CANCEL_REASON = {
  RECEIVERS_NOT_FOUND: 1,
  PROCESSING_EXECUTION_FAILED: 2,
  EXECUTION_FAILED: 3,
  TIMEOUT: 4,
  FUND: 5,
  UNKNOWN: 10,
}

// Payme: tranzaksiya yaratilgach 12 soat ichida bajarilmasa — muddati o'tgan
// hisoblanadi va bekor qilinadi (rasmiy protokol talabi; sandbox testi tekshiradi).
const PAYME_TIMEOUT_MS = 12 * 60 * 60 * 1000

function jsonRpcResponse(id: string | number, result: object) {
  return { jsonrpc: '2.0', id, result }
}

function jsonRpcError(id: string | number, error: { code: number; message: object }) {
  return { jsonrpc: '2.0', id, error: { ...error, data: null } }
}

export function checkAuth(req: AuthLike): boolean {
  const auth = req.headers.authorization ?? ''
  if (!auth.startsWith('Basic ')) return false

  const base64 = auth.slice(6)
  const decoded = Buffer.from(base64, 'base64').toString('utf8')
  // Format: "Paycom:<SECRET_KEY>"
  const [login, password] = decoded.split(':')

  const isTest = process.env.PAYME_IS_TEST === 'true'
  const secretKey = isTest ? process.env.PAYME_TEST_SECRET_KEY : process.env.PAYME_SECRET_KEY

  // Login maxfiy emas (oddiy solishtirish kifoya); parol esa timing-safe
  // solishtiriladi. Secret sozlanmagan bo'lsa — hech qachon ruxsat bermaymiz.
  if (login !== 'Paycom' || !secretKey) return false
  return safeEqual(password ?? '', secretKey)
}

export default async function paymeRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma

  // Payme barcha so'rovlarni shu bitta endpoint'ga yuboradi
  app.post('/payme/webhook', async (req, reply) => {
    // 1. Autentifikatsiya tekshirish
    if (!checkAuth(req)) {
      return reply.status(401).send(
        jsonRpcError(0, { code: -32504, message: { ru: 'Unauthorized', uz: 'Ruxsat yo\'q' } })
      )
    }

    const { method, params, id } = req.body as {
      method: string
      params: PaymeParams
      id: JsonRpcId
    }

    app.log.info({ method, params }, 'Payme webhook')

    switch (method) {
      case 'CheckPerformTransaction':
        return reply.send(await checkPerformTransaction(prisma, id, params))

      case 'CreateTransaction':
        return reply.send(await createTransaction(prisma, id, params))

      case 'PerformTransaction':
        return reply.send(await performTransaction(prisma, id, params))

      case 'CancelTransaction':
        return reply.send(await cancelTransaction(prisma, id, params))

      case 'CheckTransaction':
        return reply.send(await checkTransaction(prisma, id, params))

      case 'GetStatement':
        return reply.send(await getStatement(prisma, id, params))

      default:
        return reply.send(jsonRpcError(id, PAYME_ERROR.METHOD_NOT_FOUND))
    }
  })

  // Mobil ilova uchun: Payme to'lov URL yaratish
  app.post('/payme/create-url', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { orderId } = req.body as { orderId: string }
    const { userId } = req.user as { userId: string }

    const order = await prisma.order.findFirst({ where: { id: orderId, userId } })
    if (!order) return reply.status(404).send({ error: 'Buyurtma topilmadi' })

    return reply.send({
      url: buildPaymePaymentUrl(order, { callbackUrl: `zyff://payment/result?orderId=${order.id}` }),
      orderId: order.id,
    })
  })
}

// ─── Payme metodlari ───────────────────────────────────────────────────────────

async function checkPerformTransaction(prisma: PrismaClient, id: JsonRpcId, params: PaymeParams) {
  const orderId = params.account?.order_id
  const amount = params.amount // tiyin

  if (!orderId) return jsonRpcError(id, PAYME_ERROR.INVALID_ACCOUNT)

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  })

  if (!order) return jsonRpcError(id, PAYME_ERROR.INVALID_ACCOUNT)

  // Summa tekshirish (Payme tiyin yuboradi). BigInt — Click bilan bir xil va overflow yo'q.
  const expectedAmount = BigInt(order.totalPrice) * 100n
  if (amount == null || !Number.isInteger(amount) || BigInt(amount) !== expectedAmount)
    return jsonRpcError(id, PAYME_ERROR.INVALID_AMOUNT)

  if (order.payment?.status === 'PAID') return jsonRpcError(id, PAYME_ERROR.ALREADY_DONE)

  return jsonRpcResponse(id, { allow: true })
}

async function createTransaction(prisma: PrismaClient, id: JsonRpcId, params: PaymeParams) {
  const orderId = params.account?.order_id
  const paymeTransId = params.id ?? ''
  const amount = params.amount
  const time = params.time ?? 0

  if (!orderId) return jsonRpcError(id, PAYME_ERROR.INVALID_ACCOUNT)

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  })
  if (!order) return jsonRpcError(id, PAYME_ERROR.INVALID_ACCOUNT)

  // Summa tekshirish — BigInt (Click bilan bir xil va overflow yo'q)
  const expectedAmount = BigInt(order.totalPrice) * 100n
  if (amount == null || !Number.isInteger(amount) || BigInt(amount) !== expectedAmount)
    return jsonRpcError(id, PAYME_ERROR.INVALID_AMOUNT)

  // Agar bu tranzaksiya allaqachon mavjud bo'lsa
  if (order.payment?.paymeTransId === paymeTransId) {
    if (order.payment.status === 'CANCELLED')
      return jsonRpcError(id, PAYME_ERROR.UNABLE_TO_PERFORM)

    // Muddat tekshiruvi: 12 soatdan oshib hali to'lanmagan bo'lsa — bekor qilamiz
    // va xato qaytaramiz (Payme protokoli talabi).
    if (order.payment.status === 'PENDING') {
      const age = Date.now() - Number(order.payment.paymeCreateTime ?? 0n)
      if (age > PAYME_TIMEOUT_MS) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'CANCELLED',
            paymeCancelTime: BigInt(Date.now()),
            paymeCancelReason: CANCEL_REASON.TIMEOUT,
          },
        })
        return jsonRpcError(id, PAYME_ERROR.UNABLE_TO_PERFORM)
      }
    }

    return jsonRpcResponse(id, {
      create_time: Number(order.payment.paymeCreateTime),
      transaction: order.payment.id,
      state: 1,
    })
  }

  // Boshqa tranzaksiya allaqachon to'langan bo'lsa
  if (order.payment?.status === 'PAID') return jsonRpcError(id, PAYME_ERROR.ALREADY_DONE)

  // Yangi payment yaratish
  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider: 'PAYME',
      status: 'PENDING',
      amount: expectedAmount, // tasdiqlangan summa (tiyin), BigInt — overflow yo'q
      paymeTransId,
      paymeTime: BigInt(time),
      paymeCreateTime: BigInt(Date.now()),
    },
    update: {
      paymeTransId,
      paymeTime: BigInt(time),
      paymeCreateTime: BigInt(Date.now()),
      status: 'PENDING',
    },
  })

  return jsonRpcResponse(id, {
    create_time: Number(payment.paymeCreateTime),
    transaction: payment.id,
    state: 1,
  })
}

async function performTransaction(prisma: PrismaClient, id: JsonRpcId, params: PaymeParams) {
  const paymeTransId = params.id ?? ''

  const payment = await prisma.payment.findUnique({ where: { paymeTransId } })
  if (!payment) return jsonRpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND)

  // Allaqachon to'langan
  if (payment.status === 'PAID') {
    return jsonRpcResponse(id, {
      transaction: payment.id,
      perform_time: Number(payment.paymePerformTime),
      state: 2,
    })
  }

  if (payment.status === 'CANCELLED') return jsonRpcError(id, PAYME_ERROR.UNABLE_TO_PERFORM)

  const performTime = BigInt(Date.now())

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paymePerformTime: performTime },
    })
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' },
    })
  })

  return jsonRpcResponse(id, {
    transaction: payment.id,
    perform_time: Number(performTime),
    state: 2,
  })
}

async function cancelTransaction(prisma: PrismaClient, id: JsonRpcId, params: PaymeParams) {
  const paymeTransId = params.id ?? ''
  const reason = params.reason ?? null

  const payment = await prisma.payment.findUnique({ where: { paymeTransId } })
  if (!payment) return jsonRpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND)

  // Idempotentlik: allaqachon bekor qilingan bo'lsa, stokni qayta qaytarmasdan
  // mavjud holatni qaytaramiz (Payme CancelTransaction'ni takror yuborishi mumkin).
  if (payment.status === 'CANCELLED') {
    return jsonRpcResponse(id, {
      transaction: payment.id,
      cancel_time: Number(payment.paymeCancelTime ?? 0),
      state: payment.paymePerformTime ? -2 : -1,
    })
  }

  // Allaqachon to'langan bo'lsa bekor qilib bo'lmaydi (yetkazilgan bo'lsa)
  const wasPaid = payment.status === 'PAID'
  if (wasPaid) {
    const order = await prisma.order.findUnique({ where: { id: payment.orderId } })
    if (order?.status === 'DELIVERED') return jsonRpcError(id, PAYME_ERROR.UNABLE_TO_PERFORM)
  }

  const cancelTime = BigInt(Date.now())

  // Bekor qilish + stokni qaytarish — bitta atomik tranzaksiyada
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
        paymeCancelTime: cancelTime,
        paymeCancelReason: reason,
      },
    })
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: 'CANCELLED' },
    })
    await restoreStock(tx, payment.orderId)
  })

  return jsonRpcResponse(id, {
    transaction: payment.id,
    cancel_time: Number(cancelTime),
    // Bajarilgan (PAID) tranzaksiya bekor qilinsa state -2, aks holda -1
    state: wasPaid ? -2 : -1,
  })
}

async function checkTransaction(prisma: PrismaClient, id: JsonRpcId, params: PaymeParams) {
  const paymeTransId = params.id ?? ''

  const payment = await prisma.payment.findUnique({ where: { paymeTransId } })
  if (!payment) return jsonRpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND)

  const stateMap: Record<string, number> = {
    PENDING: 1,
    PAID: 2,
    CANCELLED: payment.paymePerformTime ? -2 : -1,
    FAILED: -1,
  }

  return jsonRpcResponse(id, {
    create_time: Number(payment.paymeCreateTime ?? 0),
    perform_time: Number(payment.paymePerformTime ?? 0),
    cancel_time: Number(payment.paymeCancelTime ?? 0),
    transaction: payment.id,
    state: stateMap[payment.status] ?? -1,
    reason: payment.paymeCancelReason ?? null,
  })
}

async function getStatement(prisma: PrismaClient, id: JsonRpcId, params: PaymeParams) {
  const from = params.from ?? 0
  const to = params.to ?? 0

  const payments = await prisma.payment.findMany({
    where: {
      provider: 'PAYME',
      paymeCreateTime: { gte: BigInt(from), lte: BigInt(to) },
    },
  })

  const stateMap: Record<string, number> = {
    PENDING: 1, PAID: 2, CANCELLED: -1, FAILED: -1,
  }

  const transactions = payments.map(p => ({
    id: p.paymeTransId,
    time: Number(p.paymeTime ?? 0),
    amount: Number(p.amount), // BigInt → Number (Fastify BigInt'ni serialize qilmaydi)
    account: { order_id: p.orderId },
    create_time: Number(p.paymeCreateTime ?? 0),
    perform_time: Number(p.paymePerformTime ?? 0),
    cancel_time: Number(p.paymeCancelTime ?? 0),
    transaction: p.id,
    state: stateMap[p.status] ?? -1,
    reason: p.paymeCancelReason ?? null,
  }))

  return jsonRpcResponse(id, { transactions })
}
