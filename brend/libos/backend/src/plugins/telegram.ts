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
      const displayName = i.product.nameUz || i.product.name
      return `  • ${i.product.sku ? `[${i.product.sku}] ` : ''}${displayName} x${i.quantity}${i.size ? ` (${i.size})` : ''}${i.color ? ` [${i.color}]` : ''} — ${i.price.toLocaleString()} so'm`
    })
    .join('\n')

  const mapsLink = order.lat && order.lng
    ? `https://maps.google.com/?q=${order.lat},${order.lng}`
    : null

  const customerName = order.customerName || order.user.name || 'Noma\'lum'

  const text = [
    `🛍 *Yangi buyurtma!* — ${order.store.name}`,
    ``,
    `👤 *Mijoz:* ${customerName}`,
    `📞 *Tel:* ${order.user.phone}`,
    ``,
    `📦 *Mahsulotlar:*`,
    itemLines,
    ``,
    order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : (DELIVERY_LABELS[order.deliveryType] || order.deliveryType),
    order.address ? `📍 *Manzil:* ${order.address}` : null,
    mapsLink ? `🗺 [Xaritada ko'rish](${mapsLink})` : null,
    order.note ? `📝 *Izoh:* ${order.note}` : null,
    ``,
    `💰 *Jami:* ${order.totalPrice.toLocaleString()} so'm`,
    `🔖 *ID:* \`${order.id.slice(-8)}\``,
  ].filter(Boolean).join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
  } catch (err) {
    console.error('Telegram notification failed:', err)
  }
}
