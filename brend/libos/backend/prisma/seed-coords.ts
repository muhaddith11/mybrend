import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Qo'qon shahridagi taxminiy do'kon joylashuvlari
const QOQON_LOCATIONS = [
  { lat: 40.5283, lng: 70.9423 }, // Markaziy bozor yaqini
  { lat: 40.5310, lng: 70.9455 }, // Shimoliy qism
  { lat: 40.5260, lng: 70.9390 }, // G'arbiy ko'cha
  { lat: 40.5295, lng: 70.9380 }, // Istiklol ko'chasi
  { lat: 40.5270, lng: 70.9460 }, // Janubiy bozor
  { lat: 40.5320, lng: 70.9430 }, // Mustakillik maydoni
  { lat: 40.5250, lng: 70.9420 }, // Xumoyun ko'chasi
  { lat: 40.5300, lng: 70.9410 }, // Navoi ko'chasi
  { lat: 40.5275, lng: 70.9440 }, // Amir Temur ko'chasi
  { lat: 40.5290, lng: 70.9470 }, // Sharqiy qism
]

async function main() {
  const stores = await prisma.store.findMany({ where: { lat: null } })
  console.log(`${stores.length} ta do'kon koordinatasiz topildi`)

  for (let i = 0; i < stores.length; i++) {
    const loc = QOQON_LOCATIONS[i % QOQON_LOCATIONS.length]
    await prisma.store.update({
      where: { id: stores[i].id },
      data: { lat: loc.lat, lng: loc.lng },
    })
    console.log(`✓ ${stores[i].name}: ${loc.lat}, ${loc.lng}`)
  }
  console.log('Tayyor!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
