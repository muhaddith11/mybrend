import type { Prisma } from '@prisma/client'

export type OrderLine = { productId: string; quantity: number; size?: string | null; color?: string | null }

// Buyurtma qatorlariga mos variant stokini kamaytiradi.
// Atomik va race-xavfsiz: `quantity: { gte }` sharti DB darajasida tekshiriladi,
// shuning uchun ikki parallel so'rov bir vaqtda oxirgi mahsulotni olishga
// urinsa ham stok HECH QACHON manfiyga tushmaydi — faqat biri kamaytira oladi.
// Variant topilmasa yoki stok yetmasa — jimgina o'tkazib yuboramiz (best-effort:
// buyurtma stok yetishmovchiligi sababli bloklanmaydi).
// Buyurtma yaratish bilan bitta tranzaksiyada chaqiriladi — shuning uchun `tx`.
export async function decrementStock(tx: Prisma.TransactionClient, items: OrderLine[]) {
  for (const it of items) {
    await tx.productVariant.updateMany({
      where: {
        productId: it.productId,
        size: it.size ?? null,
        color: it.color ?? null,
        quantity: { gte: it.quantity },
      },
      data: { quantity: { decrement: it.quantity } },
    })
  }
}

// Bekor qilingan buyurtmaning stokini qaytaradi (decrementStock teskarisi).
// To'lov bekor qilinganda chaqiriladi — aks holda "g'oyib bo'lgan" tovar qoladi.
// Buyurtma qatorlarini (OrderItem) DB'dan o'qib, har bir variant miqdorini
// oshiramiz. Bekor qilish bilan bitta tranzaksiyada chaqirilishi shart, va
// faqat hali bekor qilinmagan to'lov uchun — ikki marta qaytarib yubormaslik uchun.
export async function restoreStock(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } })
  for (const it of items) {
    await tx.productVariant.updateMany({
      where: {
        productId: it.productId,
        size: it.size ?? null,
        color: it.color ?? null,
      },
      data: { quantity: { increment: it.quantity } },
    })
  }
}
