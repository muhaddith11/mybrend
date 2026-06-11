const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const DELIVERY_LABELS: Record<string, string> = {
  DELIVERY: '🚚 Yetkazib berish',
  PICKUP: '🏃 Olib ketish',
  CASH_ON_DOOR: '💵 Eshikda to\'lov',
}

export async function sendOrderNotification(order: {
  chatId?: string | null
  id: string
  totalPrice: number
  deliveryType: string
  address?: string | null
  note?: string | null
  store: { name: string }
  user: { phone: string; name?: string | null }
  items: Array<{
    quantity: number
    size?: string | null
    color?: string | null
    price: number
    product: { name: string }
  }>
}) {
  const chatId = order.chatId || DEFAULT_CHAT_ID
  if (!BOT_TOKEN || !chatId) return

  const itemLines = order.items
    .map(i => `  • ${i.product.name} x${i.quantity}${i.size ? ` (${i.size})` : ''}${i.color ? ` [${i.color}]` : ''} — ${i.price.toLocaleString()} so'm`)
    .join('\n')

  const text = [
    `🛍 *Yangi buyurtma!* — ${order.store.name}`,
    ``,
    `👤 *Mijoz:* ${order.user.name || 'Noma\'lum'}`,
    `📞 *Tel:* ${order.user.phone}`,
    ``,
    `📦 *Mahsulotlar:*`,
    itemLines,
    ``,
    `${DELIVERY_LABELS[order.deliveryType] || order.deliveryType}`,
    order.address ? `📍 *Manzil:* ${order.address}` : null,
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
