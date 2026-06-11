import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

const PAYMENT_LABELS: Record<string, string> = {
  cash: '💵 Naqd (eshik oldida)',
  click: '💳 Click',
  payme: '💳 Payme',
}

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json({ ok: false, reason: 'no token' })
  }

  const order = await req.json()

  const itemLines = (order.items ?? [])
    .map((i: any) => `  • ${i.name} x${i.quantity}${i.size ? ` (${i.size})` : ''}${i.color ? ` [${i.color}]` : ''} — ${Number(i.price).toLocaleString()} so'm`)
    .join('\n')

  const text = [
    `🛍 *Yangi buyurtma!* — Asma Design`,
    ``,
    `👤 *Mijoz:* ${order.customerName || 'Noma\'lum'}`,
    `📞 *Tel:* ${order.phone}`,
    ``,
    `📦 *Mahsulotlar:*`,
    itemLines,
    ``,
    `${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}`,
    order.address ? `📍 *Manzil:* ${order.address}` : null,
    order.note ? `📝 *Izoh:* ${order.note}` : null,
    ``,
    `💰 *Jami:* ${Number(order.total).toLocaleString()} so'm`,
  ].filter(Boolean).join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
    })
  } catch (err) {
    console.error('Telegram error:', err)
  }

  return NextResponse.json({ ok: true })
}
