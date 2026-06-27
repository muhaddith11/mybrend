const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID

// ─── Telegram Bot API past darajali yordamchilari ────────────────────────────
// Interaktiv to'lov-boti (TRANSFER) shu funksiyalardan foydalanadi. Hammasi
// BOT_TOKEN yo'q bo'lsa jimgina no-op qiladi (mahalliy/test muhitida xato bermaydi).

async function tgCall(method: string, body: object): Promise<any> {
  if (!BOT_TOKEN) return null
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json().catch(() => null)
}

export function tgSendMessage(chatId: string | number, text: string, replyMarkup?: object) {
  return tgCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  })
}

// Chek rasmini (file_id orqali) qayta yuboradi — egaga chekni ko'rsatish uchun.
export function tgSendPhoto(chatId: string | number, fileId: string, caption: string, replyMarkup?: object) {
  return tgCall('sendPhoto', {
    chat_id: chatId,
    photo: fileId,
    caption,
    parse_mode: 'HTML',
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  })
}

// Tugma bosilganda Telegram "loading" holatini yopadi (majburiy, aks holda
// mijozda tugma muzlab qoladi).
export function tgAnswerCallback(callbackQueryId: string, text?: string) {
  return tgCall('answerCallbackQuery', { callback_query_id: callbackQueryId, ...(text ? { text } : {}) })
}

// Tasdiq/rad bo'lgach egadagi tugmali xabarni tahrirlaydi (qayta bosib bo'lmasin).
export function tgEditMessageText(chatId: string | number, messageId: number, text: string) {
  return tgCall('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' })
}

// Bot @username — deep-link uchun kerak (token o'zi yetmaydi). Avval env (qo'lda
// override), bo'lmasa MAVJUD bot tokenidan `getMe` orqali avtomatik olamiz va
// keshlaymiz. Shu sabab qo'shimcha env sozlash shart emas — bot allaqachon bor.
let cachedUsername: string | null = null
export async function getBotUsername(): Promise<string> {
  if (process.env.TELEGRAM_BOT_USERNAME) return process.env.TELEGRAM_BOT_USERNAME
  if (cachedUsername) return cachedUsername
  const me = await tgCall('getMe', {})
  const u = me?.result?.username
  if (u) cachedUsername = u // faqat muvaffaqiyatda keshlaymiz (xatoda qayta urinadi)
  return u ?? ''
}

// Checkout botga yo'naltirish uchun deep-link: t.me/<bot>?start=<orderId>.
// start payload faqat [A-Za-z0-9_-], 64 belgigacha — cuid mos keladi.
export async function buildBotPaymentUrl(orderId: string): Promise<string> {
  const username = await getBotUsername()
  return `https://t.me/${username}?start=${orderId}`
}

// Telegram webhook'ini o'rnatadi — bot interaktiv bo'lishi (xabar/tugma qabul
// qilishi) uchun. Idempotent: bir xil URL'ni qayta o'rnatish xavfsiz.
export async function setBotWebhook(url: string, secretToken?: string): Promise<any> {
  return tgCall('setWebhook', {
    url,
    ...(secretToken ? { secret_token: secretToken } : {}),
    allowed_updates: ['message', 'callback_query'],
  })
}

export { esc }

const DELIVERY_LABELS: Record<string, string> = {
  DELIVERY: '🚚 Yetkazib berish',
  PICKUP: '🏃 Olib ketish',
  CASH_ON_DOOR: '💵 Eshikda to\'lov',
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: '💵 Naqd (eshik oldida)',
  click: '💳 Click',
  payme: '💳 Payme',
}

// Telegram HTML rejimi uchun foydalanuvchi matnini xavfsizlaymiz.
// Mijoz ismi/manzilida `<`, `>`, `&` bo'lsa, escape qilmasak Telegram 400 qaytarib
// xabar umuman yetib bormaydi (injection). HTML'da faqat shu uch belgi maxsus.
function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function sendOrderNotification(order: {
  chatId?: string | null
  id: string
  totalPrice: number
  deliveryType: string
  paymentMethod?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  customerName?: string | null
  note?: string | null
  store: { name: string }
  user: { phone: string; name?: string | null }
  items: Array<{
    quantity: number
    size?: string | null
    color?: string | null
    price: number
    product: { name: string; nameUz?: string | null; sku?: string | null }
  }>
}) {
  const chatId = order.chatId || DEFAULT_CHAT_ID
  if (!BOT_TOKEN || !chatId) return

  const itemLines = order.items
    .map(i => {
      const displayName = esc(i.product.nameUz || i.product.name)
      return `  • ${i.product.sku ? `[${esc(i.product.sku)}] ` : ''}${displayName} x${i.quantity}${i.size ? ` (${esc(i.size)})` : ''}${i.color ? ` [${esc(i.color)}]` : ''} — ${i.price.toLocaleString()} so'm`
    })
    .join('\n')

  const mapsLink = order.lat && order.lng
    ? `https://maps.google.com/?q=${order.lat},${order.lng}`
    : null

  const customerName = esc(order.customerName || order.user.name || 'Noma\'lum')

  const text = [
    `🛍 <b>Yangi buyurtma!</b> — ${esc(order.store.name)}`,
    ``,
    `👤 <b>Mijoz:</b> ${customerName}`,
    `📞 <b>Tel:</b> ${esc(order.user.phone)}`,
    ``,
    `📦 <b>Mahsulotlar:</b>`,
    itemLines,
    ``,
    // Yetkazish turi DOIM ko'rsatiladi (pickup/delivery'ni do'kon ko'rishi shart)
    esc(DELIVERY_LABELS[order.deliveryType] || order.deliveryType),
    order.paymentMethod ? esc(PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : null,
    order.address ? `📍 <b>Manzil:</b> ${esc(order.address)}` : null,
    mapsLink ? `🗺 <a href="${mapsLink}">Xaritada ko'rish</a>` : null,
    order.note ? `📝 <b>Izoh:</b> ${esc(order.note)}` : null,
    ``,
    `💰 <b>Jami:</b> ${order.totalPrice.toLocaleString()} so'm`,
    `🔖 <b>ID:</b> <code>${esc(order.id.slice(-8))}</code>`,
  ].filter(Boolean).join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch (err) {
    console.error('Telegram notification failed:', err)
  }
}
