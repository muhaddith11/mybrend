import type { Prisma } from '@prisma/client'

export type OrderLine = { productId: string; quantity: number; size?: string | null; color?: string | null }

// Stok yetishmaganda tashlanadi — orders route'i buni ushlab 400 qaytaradi
// (buyurtma tranzaksiyasi rollback bo'ladi, ya'ni buyurtma yaratilmaydi).
export class InsufficientStockError extends Error {
  constructor(public readonly productId: string) {
    super('Mahsulot stokda yetarli emas')
    this.name = 'InsufficientStockError'
  }
}

// Buyurtma qatorlariga mos variant stokini kamaytiradi.
// Atomik va race-xavfsiz: `quantity: { gte }` sharti DB darajasida tekshiriladi,
// shuning uchun ikki parallel so'rov bir vaqtda oxirgi mahsulotni olishga
// urinsa ham stok HECH QACHON manfiyga tushmaydi — faqat biri kamaytira oladi.
//
// Variant umuman bo'lmasa (size+color kombinatsiyasi uchun stok kuzatilmaydi) —
// jimgina o'tkazib yuboramiz (variantsiz mahsulotlar bloklanmaydi). Ammo variant
// MAVJUD bo'lib stok yetmasa — InsufficientStockError tashlaymiz (overselling
// oldini olish): bunda butun buyurtma rad etiladi.
// Buyurtma yaratish bilan bitta tranzaksiyada chaqiriladi — shuning uchun `tx`.
export async function decrementStock(tx: Prisma.TransactionClient, items: OrderLine[]) {
  for (const it of items) {
    const variant = await tx.productVariant.findFirst({
      where: { productId: it.productId, size: it.size ?? null, color: it.color ?? null },
    })
    if (!variant) continue // stok kuzatilmaydi — ruxsat

    const res = await tx.productVariant.updateMany({
      where: {
        productId: it.productId,
        size: it.size ?? null,
        color: it.color ?? null,
        quantity: { gte: it.quantity },
      },
      data: { quantity: { decrement: it.quantity } },
    })
    // count 0 = variant bor, lekin stok yetmadi (yoki poygada tugab qoldi) → rad et
    if (res.count === 0) throw new InsufficientStockError(it.productId)
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
