-- Do'kon baholari (Review) jadvali + eski qo'lda kiritilgan reytinglarni nolga tushirish.
-- Prisma 'migrate diff' generatsiya qilgan SQL asosida (qo'lda yozilmagan).
-- Neon SQL Editor'da bir marta bajariladi.

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");
CREATE INDEX "Review_storeId_idx" ON "Review"("storeId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Eski reytinglar qo'lda kiritilgan edi (Asma 4.9/312). Qaror: noldan boshlash —
-- bundan buyon faqat haqiqiy, yetkazilgan buyurtmadan keyingi baholar hisoblanadi.
UPDATE "Store" SET "rating" = 0, "reviewCount" = 0;
