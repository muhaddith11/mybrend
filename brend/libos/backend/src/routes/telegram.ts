import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { restoreStock } from '../lib/stock.js'
import { sendSms } from '../plugins/sms.js'
import {
  tgSendMessage,
  tgSendPhoto,
  tgAnswerCallback,
  tgEditMessageText,
  esc,
} from '../plugins/telegram.js'

// Bot orqali o'tkazma (TRANSFER) to'lov oqimi:
//   1. Mijoz checkout'da "Bot orqali" tanlaydi → t.me/<bot>?start=<orderId> ochiladi
//   2. /start <orderId> → bot do'kon kartasi/QR'ini ko'rsatadi, mijoz chatId saqlanadi
//   3. Mijoz chek RASMINI yuboradi → file_id saqlanadi, egaga tugmalar bilan jo'natiladi
//   4. Ega "✅ Tasdiqlash" bossa → buyurtma CONFIRMED; "❌ Rad etish" → CANCELLED + stok qaytadi
//   5. Mijozga natija xabari boradi
//
// Pul to'g'ridan-to'g'ri egasining kartasiga tushadi — platforma hisobidan o'tmaydi.

// Telegram Update'ning bizga keladigan qismlari (minimal tip — faqat ishlatadiganlarimiz).
type TgUpdate = {
  message?: {
    chat: { id: number }
    text?: string
    photo?: Array<{ file_id: string }>
  }
  callback_query?: {
    id: string
    from: { id: number }
    data?: string
    message?: { chat: { id: number }; message_id: number }
  }
}

export default async function telegramRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma
  const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET

  app.post('/telegram/webhook', async (req, reply) => {
    // Xavfsizlik: faqat Telegram'dan kelgan so'rovlarni qabul qilamiz. setWebhook
    // chaqirilganda o'rnatilgan secret_token har so'rovda shu sarlavhada qaytadi.
    if (WEBHOOK_SECRET) {
      const got = req.headers['x-telegram-bot-api-secret-token']
      if (got !== WEBHOOK_SECRET) return reply.status(401).send({ ok: false })
    }

    const update = req.body as TgUpdate

    try {
      if (update.callback_query) {
        await handleCallback(prisma, app, update.callback_query)
      } else if (update.message?.text?.startsWith('/start')) {
        await handleStart(prisma, update.message)
      } else if (update.message?.photo?.length) {
        await handleReceiptPhoto(prisma, update.message)
      }
    } catch (err) {
      // Telegram 200 olmasa update'ni qayta-qayta yuboradi — shuning uchun har doim
      // 200 qaytaramiz, xatoni faqat logga yozamiz.
      app.log.error({ err }, 'Telegram webhook xatosi')
    }

    return reply.send({ ok: true })
  })
}

// ─── /start <orderId> ────────────────────────────────────────────────────────
async function handleStart(
  prisma: PrismaClient,
  message: NonNullable<TgUpdate['message']>,
) {
  const chatId = message.chat.id
  const orderId = (message.text ?? '').split(/\s+/)[1]?.trim()

  if (!orderId) {
    await tgSendMessage(chatId, '👋 Salom! To\'lov uchun ilovadagi buyurtma havolasidan keling.')
    return
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true, payment: true, items: { include: { product: true } } },
  })

  if (!order || order.paymentMethod !== 'transfer') {
    await tgSendMessage(chatId, '❌ Buyurtma topilmadi yoki bu buyurtma bot orqali to\'lovga mo\'ljallanmagan.')
    return
  }
  if (order.payment?.status === 'PAID') {
    await tgSendMessage(chatId, '✅ Bu buyurtma allaqachon to\'langan.')
    return
  }
  if (order.status === 'CANCELLED') {
    await tgSendMessage(chatId, '❌ Bu buyurtma bekor qilingan.')
    return
  }
  if (!order.store.cardNumber && !order.store.paymentQr) {
    await tgSendMessage(chatId, '⚠️ Do\'kon hali to\'lov rekvizitini sozlamagan. Iltimos do\'kon bilan bog\'laning.')
    return
  }

  // Payment yozuvini yaratamiz/yangilaymiz va mijoz chat'ini bog'laymiz (chek
  // kelganda va tasdiq/rad xabarida shu chatId ishlatiladi). Chek hali yo'q.
  await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      provider: 'TRANSFER',
      status: 'PENDING',
      amount: BigInt(order.totalPrice) * 100n, // tiyin (Click/Payme bilan bir xil)
      customerChatId: String(chatId),
    },
    update: { customerChatId: String(chatId), status: 'PENDING' },
  })

  const itemLines = order.items
    .map(i => `  • ${esc(i.product.nameUz || i.product.name)} ×${i.quantity} — ${i.price.toLocaleString()} so'm`)
    .join('\n')

  const lines = [
    `🛍 <b>${esc(order.store.name)}</b> — buyurtma to'lovi`,
    ``,
    itemLines,
    ``,
    `💰 <b>To'lov summasi:</b> ${order.totalPrice.toLocaleString()} so'm`,
    ``,
    `💳 Quyidagi kartaga o'tkazing:`,
    order.store.cardNumber ? `<code>${esc(order.store.cardNumber)}</code>` : null,
    order.store.cardHolder ? `👤 ${esc(order.store.cardHolder)}` : null,
    ``,
    `📸 To'lovni amalga oshirgach, <b>chek rasmini</b> shu yerga yuboring.`,
  ].filter(Boolean).join('\n')

  await tgSendMessage(chatId, lines)
  // QR bo'lsa alohida rasm sifatida ham yuboramiz (skanerlash uchun qulay).
  if (order.store.paymentQr) {
    await tgSendPhoto(chatId, order.store.paymentQr, '📷 QR orqali to\'lash')
  }
}

// ─── Mijoz chek rasmini yubordi ──────────────────────────────────────────────
async function handleReceiptPhoto(
  prisma: PrismaClient,
  message: NonNullable<TgUpdate['message']>,
) {
  const chatId = message.chat.id
  // Telegram bir rasmni bir necha o'lchamda yuboradi — eng kattasi (oxirgisi) sifatli.
  const fileId = message.photo![message.photo!.length - 1].file_id

  // Shu chat bog'langan, hali chek kutilayotgan eng so'nggi TRANSFER to'lovini topamiz.
  const payment = await prisma.payment.findFirst({
    where: { provider: 'TRANSFER', status: 'PENDING', customerChatId: String(chatId) },
    orderBy: { createdAt: 'desc' },
    include: { order: { include: { store: true, items: { include: { product: true } } } } },
  })

  if (!payment) {
    await tgSendMessage(chatId, 'ℹ️ Avval ilovadagi havola orqali to\'lovni boshlang, keyin chek rasmini yuboring.')
    return
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { receiptFileId: fileId } })

  await tgSendMessage(chatId, '✅ Chek qabul qilindi! Do\'kon to\'lovni tasdiqlashini kuting.')

  // Egaga chekni + buyurtmani tugmalar bilan yuboramiz.
  const order = payment.order
  const ownerChat = order.store.telegramChatId
  if (!ownerChat) return // ega chat sozlamagan — tasdiq imkonsiz, lekin mijoz xabar oldi

  const itemLines = order.items
    .map(i => `  • ${esc(i.product.nameUz || i.product.name)} ×${i.quantity}`)
    .join('\n')

  const caption = [
    `🧾 <b>Yangi to'lov cheki</b> — ${esc(order.store.name)}`,
    ``,
    itemLines,
    `💰 <b>Summa:</b> ${order.totalPrice.toLocaleString()} so'm`,
    `🔖 <code>${esc(order.id.slice(-8))}</code>`,
    ``,
    `To'lov to'g'rimi?`,
  ].join('\n')

  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Tasdiqlash', callback_data: `pay_ok:${payment.id}` },
      { text: '❌ Rad etish', callback_data: `pay_no:${payment.id}` },
    ]],
  }

  await tgSendPhoto(ownerChat, fileId, caption, keyboard)
}

// ─── Ega tugmani bosdi (tasdiq / rad) ────────────────────────────────────────
async function handleCallback(
  prisma: PrismaClient,
  app: FastifyInstance,
  cb: NonNullable<TgUpdate['callback_query']>,
) {
  const data = cb.data ?? ''
  const [action, paymentId] = data.split(':')
  if ((action !== 'pay_ok' && action !== 'pay_no') || !paymentId) {
    await tgAnswerCallback(cb.id)
    return
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { store: true, user: { select: { phone: true } } } } },
  })

  if (!payment) {
    await tgAnswerCallback(cb.id, 'To\'lov topilmadi')
    return
  }

  // Xavfsizlik: faqat shu do'kon egasining chat'i tasdiqlay/rad eta oladi.
  // Shaxsiy chatda from.id == chat.id (foydalanuvchi ID'si).
  if (String(cb.from.id) !== (payment.order.store.telegramChatId ?? '')) {
    await tgAnswerCallback(cb.id, 'Ruxsat yo\'q')
    return
  }

  const ownerChat = cb.message?.chat.id
  const messageId = cb.message?.message_id

  // Idempotentlik: allaqachon hal qilingan bo'lsa qayta ishlamaymiz.
  if (payment.status !== 'PENDING') {
    await tgAnswerCallback(cb.id, payment.status === 'PAID' ? 'Allaqachon tasdiqlangan' : 'Allaqachon rad etilgan')
    return
  }

  if (action === 'pay_ok') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } })
      await tx.order.update({ where: { id: payment.orderId }, data: { status: 'CONFIRMED' } })
    })
    await tgAnswerCallback(cb.id, '✅ Tasdiqlandi')
    if (ownerChat && messageId != null) {
      await tgEditMessageText(ownerChat, messageId, `✅ To'lov tasdiqlandi — <code>${esc(payment.orderId.slice(-8))}</code>`)
    }
    if (payment.customerChatId) {
      await tgSendMessage(payment.customerChatId, '✅ To\'lovingiz tasdiqlandi! Buyurtmangiz qabul qilindi.')
    }
    // Mijozga SMS ham — bot xabaridan tashqari (mijoz botni ochmagan bo'lishi mumkin).
    // Buyurtmani bloklamaydi: xato bo'lsa faqat logga yoziladi.
    const phone = payment.order.user?.phone
    if (phone) {
      sendSms(phone, `ZYFF: to'lovingiz tasdiqlandi, buyurtmangiz qabul qilindi. Rahmat!`)
        .catch((err) => app.log.error({ err, orderId: payment.orderId }, 'Tasdiq SMS yuborilmadi'))
    }
  } else {
    // Rad etish — buyurtma bekor, stok qaytadi (bitta atomik tranzaksiyada).
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'CANCELLED' } })
      await tx.order.update({ where: { id: payment.orderId }, data: { status: 'CANCELLED' } })
      await restoreStock(tx, payment.orderId)
    })
    await tgAnswerCallback(cb.id, '❌ Rad etildi')
    if (ownerChat && messageId != null) {
      await tgEditMessageText(ownerChat, messageId, `❌ To'lov rad etildi — <code>${esc(payment.orderId.slice(-8))}</code>`)
    }
    if (payment.customerChatId) {
      await tgSendMessage(payment.customerChatId, '❌ To\'lov tasdiqlanmadi. Savol bo\'lsa do\'kon bilan bog\'laning.')
    }
  }
}
