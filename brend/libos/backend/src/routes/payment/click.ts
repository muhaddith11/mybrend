import type { FastifyInstance } from 'fastify'
import { createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'

// Click webhook action kodlari
const CLICK_ACTION_PREPARE = 0
const CLICK_ACTION_COMPLETE = 1

// Click xato kodlari
const CLICK_ERROR = {
  SUCCESS: 0,
  SIGN_FAILED: -1,
  INVALID_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  USER_NOT_FOUND: -5,
  TRANSACTION_NOT_FOUND: -6,
  FAILED_UPDATE: -7,
  SYSTEM_ERROR: -8,
  INVALID_REQUEST: -9,
}

export function checkSign(params: Record<string, string>, secretKey: string, action: number): boolean {
  const {
    click_trans_id, service_id, click_paydoc_id,
    merchant_trans_id, amount, action: act, sign_time, sign_string,
  } = params

  // Click imzo algoritmi: MD5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
  const hash = createHash('md5')
    .update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`)
    .digest('hex')

  return hash === sign_string
}

export default async function clickRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = (app as any).prisma
  const SECRET_KEY = process.env.CLICK_SECRET_KEY ?? ''
  const SERVICE_ID = process.env.CLICK_SERVICE_ID ?? ''

  // Click bu endpoint'ga POST so'rov yuboradi
  app.post('/click/webhook', async (req, reply) => {
    const body = req.body as Record<string, string>

    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id, // bu bizning order.id
      amount,
      action,
      sign_time,
      sign_string,
      error,
    } = body

    const actionNum = Number(action)

    // 1. Imzoni tekshirish
    if (!checkSign(body, SECRET_KEY, actionNum)) {
      return reply.send({
        click_trans_id,
        merchant_trans_id,
        error: CLICK_ERROR.SIGN_FAILED,
        error_note: 'Imzo noto\'g\'ri',
      })
    }

    // 2. Buyurtmani topish
    const order = await prisma.order.findUnique({
      where: { id: merchant_trans_id },
      include: { payment: true },
    })

    if (!order) {
      return reply.send({
        click_trans_id,
        merchant_trans_id,
        error: CLICK_ERROR.USER_NOT_FOUND,
        error_note: 'Buyurtma topilmadi',
      })
    }

    // 3. Summa tekshirish (Click tiyin yubormaydi, so'mda yuboradi)
    const sentAmount = Math.round(Number(amount))
    const orderAmount = Math.round(order.totalPrice)

    if (sentAmount !== orderAmount) {
      return reply.send({
        click_trans_id,
        merchant_trans_id,
        error: CLICK_ERROR.INVALID_AMOUNT,
        error_note: `Summa noto'g'ri. Kutilgan: ${orderAmount}, kelgan: ${sentAmount}`,
      })
    }

    // PREPARE (action=0) — to'lovni tekshirish bosqichi
    if (actionNum === CLICK_ACTION_PREPARE) {
      // Agar allaqachon to'langan bo'lsa
      if (order.payment?.status === 'PAID') {
        return reply.send({
          click_trans_id,
          merchant_trans_id,
          error: CLICK_ERROR.ALREADY_PAID,
          error_note: 'Buyurtma allaqachon to\'langan',
        })
      }

      // Payment yaratish yoki mavjudini yangilash
      await prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          provider: 'CLICK',
          status: 'PENDING',
          amount: order.totalPrice * 100, // tiyinga o'tkazamiz
          clickTransId: click_trans_id,
          clickPaydocId: click_paydoc_id,
        },
        update: {
          clickTransId: click_trans_id,
          clickPaydocId: click_paydoc_id,
        },
      })

      return reply.send({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: order.id,
        error: CLICK_ERROR.SUCCESS,
        error_note: 'Success',
      })
    }

    // COMPLETE (action=1) — to'lovni tasdiqlash bosqichi
    if (actionNum === CLICK_ACTION_COMPLETE) {
      const payment = await prisma.payment.findUnique({ where: { orderId: order.id } })

      if (!payment) {
        return reply.send({
          click_trans_id,
          merchant_trans_id,
          error: CLICK_ERROR.TRANSACTION_NOT_FOUND,
          error_note: 'Prepare qilinmagan',
        })
      }

      // Click error yuborsa — bekor qilish
      if (Number(error) < 0) {
        await prisma.payment.update({
          where: { orderId: order.id },
          data: { status: 'CANCELLED' },
        })
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        })
        return reply.send({
          click_trans_id,
          merchant_trans_id,
          merchant_confirm_id: order.id,
          error: CLICK_ERROR.SUCCESS,
          error_note: 'Bekor qilindi',
        })
      }

      // To'lovni tasdiqlash
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { status: 'PAID' },
      })
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      })

      return reply.send({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: order.id,
        error: CLICK_ERROR.SUCCESS,
        error_note: 'Success',
      })
    }

    return reply.send({
      click_trans_id,
      merchant_trans_id,
      error: CLICK_ERROR.ACTION_NOT_FOUND,
      error_note: 'Noma\'lum action',
    })
  })

  // Mobil ilova uchun: Click to'lov URL yaratish
  app.post('/click/create-url', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { orderId } = req.body as { orderId: string }
    const { userId } = req.user as { userId: string }

    const order = await prisma.order.findFirst({ where: { id: orderId, userId } })
    if (!order) return reply.status(404).send({ error: 'Buyurtma topilmadi' })

    // Click to'lov URL formatı
    const params = new URLSearchParams({
      service_id: SERVICE_ID,
      merchant_id: process.env.CLICK_MERCHANT_ID ?? '',
      amount: String(order.totalPrice),
      transaction_param: order.id,
      return_url: `libos://payment/result?orderId=${order.id}`,
    })

    const url = `https://my.click.uz/services/pay?${params}`
    return reply.send({ url, orderId: order.id })
  })
}
