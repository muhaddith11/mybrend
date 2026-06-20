// Test (seed) do'konlarni prod bazadan xavfsiz o'chiradi.
//
// Ishlatish (PowerShell):
//   cd F:\projects\ZYFF.UZ\brend\libos\backend
//   $env:DATABASE_URL="<Vercel'dagi prod Neon URL>"
//   npx tsx prisma/cleanup-test-stores.ts          # DRY-RUN — faqat ko'rsatadi, o'chirmaydi
//   npx tsx prisma/cleanup-test-stores.ts --yes     # HAQIQIY o'chirish
//
// O'chiriladigan do'konlar quyida. Real do'konlar (asma, boosner, onepro) TEGILMAYDI.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEST_SLUGS = ['zara-men', 'sport-city', 'nafosat', 'kidsland']
const TEST_OWNER_EMAILS = ['zara@libos.uz', 'sport@libos.uz', 'nafosat@libos.uz', 'kidsland@libos.uz']

const APPLY = process.argv.includes('--yes')

function maskDbHost() {
  const url = process.env.DATABASE_URL ?? ''
  const m = url.match(/@([^/:]+)/)
  return m ? m[1] : '(noma\'lum host)'
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL o\'rnatilmagan. Avval $env:DATABASE_URL ni qo\'ying.')
    process.exit(1)
  }

  console.log(`\n🗄  Baza host: ${maskDbHost()}`)
  console.log(APPLY ? '⚠️  REJIM: HAQIQIY O\'CHIRISH (--yes)\n' : '👀 REJIM: DRY-RUN (hech narsa o\'chirilmaydi)\n')

  let totalOrders = 0
  let totalProducts = 0

  for (const slug of TEST_SLUGS) {
    const store = await prisma.store.findUnique({
      where: { slug },
      include: { _count: { select: { products: true, orders: true } } },
    })

    if (!store) {
      console.log(`  •  ${slug.padEnd(12)} → topilmadi (allaqachon o'chirilgan)`)
      continue
    }

    const oCount = store._count.orders
    const pCount = store._count.products
    totalOrders += oCount
    totalProducts += pCount
    console.log(`  •  ${slug.padEnd(12)} → ${pCount} mahsulot, ${oCount} buyurtma`)

    if (!APPLY) continue

    // Bog'liq ma'lumotni to'g'ri tartibda o'chiramiz (FK cheklovlari uchun):
    // payment → order → store (store o'chsa product/variant/favorite cascade bo'ladi)
    const orders = await prisma.order.findMany({ where: { storeId: store.id }, select: { id: true } })
    const orderIds = orders.map((o) => o.id)
    if (orderIds.length) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } })
      await prisma.order.deleteMany({ where: { storeId: store.id } }) // orderItems cascade
    }
    await prisma.store.delete({ where: { id: store.id } }) // products, variants, favorites cascade
    console.log(`     ✅ o'chirildi`)
  }

  // Egasiz qolgan test do'kon-egalarini ham tozalaymiz (boshqa do'koni qolmaganlarini)
  if (APPLY) {
    for (const email of TEST_OWNER_EMAILS) {
      const owner = await prisma.storeOwner.findUnique({
        where: { email },
        include: { _count: { select: { stores: true } } },
      })
      if (owner && owner._count.stores === 0) {
        await prisma.storeOwner.delete({ where: { id: owner.id } })
        console.log(`  •  egasi ${email} → o'chirildi (do'koni qolmadi)`)
      }
    }
  }

  console.log(`\n📊 Jami: ${totalProducts} mahsulot, ${totalOrders} buyurtma ${APPLY ? 'o\'chirildi' : 'o\'chiriladi'}.`)
  if (!APPLY) {
    console.log('➡️  Haqiqatan o\'chirish uchun: npx tsx prisma/cleanup-test-stores.ts --yes\n')
  } else {
    console.log('🎉 Tozalash tugadi. Real do\'konlar (asma, boosner, onepro) tegilmadi.\n')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
