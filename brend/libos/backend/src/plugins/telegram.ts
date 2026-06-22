const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID

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
