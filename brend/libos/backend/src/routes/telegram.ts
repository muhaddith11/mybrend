import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { restoreStock } from '../lib/stock.js'
import { sendSms } from '../plugins/sms.js'
import {
  tgSendMessage,
  tgSendPhoto,
  tgAnswerCallback,
  tgEditMessageText,
  setBotWebhook,
  esc,
} from '../plugins/telegram.js'

// Bot orqali o'tkazma (TRANSFER) to'lov oqimi (mavjud bot, ko'p funksiyali):
//   1. Mijoz checkout'da "Karta" tanlaydi → t.me/<bot>?start=<orderId> ochiladi
//   2. /start <orderId> → bot TELEFON RAQAMINI so'raydi
//   3. Mijoz raqam yuboradi → bot do'kon kartasi/QR'ini ko'rsatadi
//   4. Mijoz chek RASMINI yuboradi → egaga tasdiq/rad tugmalari bilan jo'natiladi
//   5. Ega "✅ Tasdiqlash" bossa → buyurtma CONFIRMED, mijozga bot xabari + SMS
//   6. "❌ Rad etish" → CANCELLED + stok qaytadi
//
// Pul to'g'ridan-to'g'ri egasining kartasiga tushadi — platforma hisobidan o'tmaydi.

type TgUpdate = {
  message?: {
    chat: { id: number }
    text?: string
    photo?: Array<{ file_id: string }>
    contact?: { phone_number?: string }
  }
  callback_query?: {
    id: string
    from: { id: number }
    data?: string
    message?: { chat: { id: number }; message_id: number }
  }
}

// Telefon so'rash uchun "kontaktni ulashish" tugmasi (bir martalik klaviatura).
const PHONE_KEYBOARD = {
  keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
}

export default async function telegramRoutes(app: FastifyInstance) {
  const prisma: PrismaClient = app.prisma
  const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET

  // ─── Webhook'ni yoqish (bir martalik, CRON_SECRET bilan himoyalangan) ────────
  // Token serverda qoladi: backend o'z manzilini so'rovdan oladi va Telegram'ga
  // setWebhook qiladi. Foydalanish:
  //   curl -H "Authorization: Bearer <CRON_SECRET>" https://<backend>/api/telegram/set-webhook
  app.get('/telegram/set-webhook', async (req, reply) => {
    const secret = process.env.CRON_SECRET
    const auth = req.headers.authorization ?? ''
    if (!secret || auth !== `Bearer ${secret}`) {
      return reply.status(401).send({ error: 'Ruxsat yo\'q' })
    }
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
    const host = req.headers.host
    const url = `${proto}://${host}/api/telegram/webhook`
    const result = await setBotWebhook(url, WEBHOOK_SECRET)
    return reply.send({ ok: true, url, telegram: result })
  })

  // ─── Telegram update'lari ────────────────────────────────────────────────────
  app.post('/telegram/webhook', async (req, reply) => {
    // Xavfsizlik: faqat Telegram'dan kelgan so'rovlar (setWebhook secret_token).
    if (WEBHOOK_SECRET) {
      const got = req.headers['x-telegram-bot-api-secret-token']
      if (got !== WEBHOOK_SECRET) return reply.status(401).send({ ok: false })
    }

    const update = req.body as TgUpdate

    try {
      if (update.callback_query) {
        await handleCallback(prisma, app, update.callback_query)
      } else if (update.message) {
        const m = update.message
        const chatId = m.chat.id
        if (m.text?.startsWith('/start')) {
          await handleStart(prisma, chatId, m.text)
        } else if (m.contact?.phone_number) {
          await handlePhone(prisma, chatId, m.contact.phone_number)
        } else if (m.photo?.length) {
          await handleReceiptPhoto(prisma, chatId, m.photo[m.photo.length - 1].file_id)
        } else if (m.text) {
          // Matn — agar mijoz telefon kutilayotgan bo'lsa, raqam sifatida qabul qilamiz.
          await handlePhone(prisma, chatId, m.text)
        }
      }
    } catch (err) {
      // Telegram 200 olmasa update'ni qayta yuboradi — har doim 200, xato logga.
      app.log.error({ err }, 'Telegram webhook xatosi')
    }

    return reply.send({ ok: true })
  })
}

// ─── /start <orderId> → telefon so'rash ──────────────────────────────────────
async function handleStart(prisma: PrismaClient, chatId: number, text: string) {
  const orderId = text.split(/\s+/)[1]?.trim()

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

  // Payment yozuvi: mijoz chat'ini bog'laymiz (chek + tasdiq xabari uchun).
  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      provider: 'TRANSFER',
      status: 'PENDING',
      amount: BigInt(order.totalPrice) * 100n,
      customerChatId: String(chatId),
    },
    update: { customerChatId: String(chatId), status: 'PENDING' },
  })

  // Telefon allaqachon olingan bo'lsa (qayta /start) — to'g'ridan-to'g'ri rekvizit.
  if (payment.customerPhone) {
    await sendPaymentDetails(chatId, order)
    return
  }

  await tgSendMessage(
    chatId,
    [
      `🛍 <b>${esc(order.store.name)}</b> — buyurtma to'lovi`,
      `💰 Summa: <b>${order.totalPrice.toLocaleString()} so'm</b>`,
      ``,
      `📞 Davom etish uchun, iltimos, <b>telefon raqamingizni</b> yuboring.`,
      `Pastdagi tugmani bosing yoki raqamni yozing.`,
    ].join('\n'),
    PHONE_KEYBOARD,
  )
}

// ─── Mijoz telefon raqamini yubordi → rekvizitni ko'rsatamiz ─────────────────
async function handlePhone(prisma: PrismaClient, chatId: number, raw: string) {
  // Telefon hali kutilayotgan (customerPhone yo'q) eng so'nggi buyurtma.
  const payment = await prisma.payment.findFirst({
    where: { provider: 'TRANSFER', status: 'PENDING', customerChatId: String(chatId), customerPhone: null },
    orderBy: { createdAt: 'desc' },
    include: { order: { include: { store: true, items: { include: { product: true } } } } },
  })
  if (!payment) return // telefon kutilmayapti — erkin matnga javob bermaymiz (shovqin yo'q)

  const phone = raw.replace(/[^\d+]/g, '').slice(0, 20)
  if (phone.replace(/\D/g, '').length < 7) {
    await tgSendMessage(chatId, '❌ Telefon raqami noto\'g\'ri. Iltimos qaytadan yuboring.', PHONE_KEYBOARD)
    return
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { customerPhone: phone } })
  // Klaviaturani olib tashlaymiz va rekvizitni ko'rsatamiz.
  await tgSendMessage(chatId, '✅ Rahmat! Endi to\'lovni amalga oshiring 👇', { remove_keyboard: true })
  await sendPaymentDetails(chatId, payment.order)
}

// Do'kon kartasi/QR + ko'rsatma (telefon olingach yuboriladi).
async function sendPaymentDetails(
  chatId: number,
  order: { totalPrice: number; store: { name: string; cardNumber: string | null; cardHolder: string | null; paymentQr: string | null }; items: Array<{ quantity: number; price: number; product: { name: string; nameUz: string | null } }> },
) {
  const itemLines = order.items
    .map((i) => `  • ${esc(i.product.nameUz || i.product.name)} ×${i.quantity} — ${i.price.toLocaleString()} so'm`)
    .join('\n')

  const lines = [
    `🛍 <b>${esc(order.store.name)}</b>`,
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
  if (order.store.paymentQr) {
    await tgSendPhoto(chatId, order.store.paymentQr, '📷 QR orqali to\'lash')
  }
}

// ─── Mijoz chek rasmini yubordi ──────────────────────────────────────────────
async function handleReceiptPhoto(prisma: PrismaClient, chatId: number, fileId: string) {
  // Shu chat bog'langan, hali chek kutilayotgan eng so'nggi TRANSFER to'lovi.
  const payment = await prisma.payment.findFirst({
    where: { provider: 'TRANSFER', status: 'PENDING', customerChatId: String(chatId), receiptFileId: null },
    orderBy: { createdAt: 'desc' },
    include: { order: { include: { store: true, items: { include: { product: true } } } } },
  })

  if (!payment) {
    await tgSendMessage(chatId, 'ℹ️ Avval ilovadagi havola orqali to\'lovni boshlang, keyin chek rasmini yuboring.')
    return
  }
  if (!payment.customerPhone) {
    await tgSendMessage(chatId, '📞 Avval telefon raqamingizni yuboring, keyin chek rasmini yuboring.', PHONE_KEYBOARD)
    return
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { receiptFileId: fileId } })
  await tgSendMessage(chatId, '✅ Chek qabul qilindi! Do\'kon to\'lovni tasdiqlashini kuting.')

  // Egaga chekni + buyurtmani tugmalar bilan yuboramiz.
  const order = payment.order
  const ownerChat = order.store.telegramChatId
  if (!ownerChat) return

  const itemLines = order.items
    .map((i) => `  • ${esc(i.product.nameUz || i.product.name)} ×${i.quantity}`)
    .join('\n')

  const caption = [
    `🧾 <b>Yangi to'lov cheki</b> — ${esc(order.store.name)}`,
    ``,
    itemLines,
    `💰 <b>Summa:</b> ${order.totalPrice.toLocaleString()} so'm`,
    `📞 <b>Mijoz:</b> ${esc(payment.customerPhone)}`,
    order.address ? `📍 ${esc(order.address)}` : null,
    `🔖 <code>${esc(order.id.slice(-8))}</code>`,
    ``,
    `To'lov to'g'rimi?`,
  ].filter(Boolean).join('\n')

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
    // Mijozga SMS ham (botni ochmagan bo'lishi mumkin). Buyurtmani bloklamaydi.
    const phone = payment.customerPhone || payment.order.user?.phone
    if (phone) {
      sendSms(phone, `ZYFF: to'lovingiz tasdiqlandi, buyurtmangiz qabul qilindi. Rahmat!`)
        .catch((err) => app.log.error({ err, orderId: payment.orderId }, 'Tasdiq SMS yuborilmadi'))
    }
  } else {
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
