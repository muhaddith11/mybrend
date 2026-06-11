import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

function hash(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Seed ma\'lumotlar kiritilmoqda...')

  // ─── Kategoriyalar ──────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'erkak-kurtka' }, update: {}, create: { name: 'Kurtka', slug: 'erkak-kurtka', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'erkak-futbolka' }, update: {}, create: { name: 'Futbolka', slug: 'erkak-futbolka', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'erkak-shim' }, update: {}, create: { name: 'Shim', slug: 'erkak-shim', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'ayol-koyilak' }, update: {}, create: { name: 'Ko\'ylak', slug: 'ayol-koyilak', gender: 'WOMEN' } }),
    prisma.category.upsert({ where: { slug: 'ayol-palto' }, update: {}, create: { name: 'Palto', slug: 'ayol-palto', gender: 'WOMEN' } }),
    prisma.category.upsert({ where: { slug: 'bola-kurtka' }, update: {}, create: { name: 'Kurtka', slug: 'bola-kurtka', gender: 'KIDS' } }),
    prisma.category.upsert({ where: { slug: 'bola-sport' }, update: {}, create: { name: 'Sport kiyim', slug: 'bola-sport', gender: 'KIDS' } }),
    prisma.category.upsert({ where: { slug: 'erkak-kostyum' }, update: {}, create: { name: 'Kostyum', slug: 'erkak-kostyum', gender: 'MEN' } }),
    // Asma Design kategoriyalari
    prisma.category.upsert({ where: { slug: 'suits' }, update: {}, create: { name: 'Kostyumlar', slug: 'suits', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'coats' }, update: {}, create: { name: 'Paltolar', slug: 'coats', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'shirts' }, update: {}, create: { name: "Ko'ylaklar", slug: 'shirts', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'knitwear' }, update: {}, create: { name: 'Trikotaj', slug: 'knitwear', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'shoes' }, update: {}, create: { name: 'Poyafzallar', slug: 'shoes', gender: 'MEN' } }),
    prisma.category.upsert({ where: { slug: 'accessories' }, update: {}, create: { name: 'Aksessuarlar', slug: 'accessories', gender: 'MEN' } }),
  ])

  console.log(`✅ ${categories.length} ta kategoriya`)

  // ─── Do'kon egalari ─────────────────────────────────────────
  const owners = await Promise.all([
    prisma.storeOwner.upsert({
      where: { email: 'zara@libos.uz' }, update: {},
      create: { email: 'zara@libos.uz', phone: '+998901234561', name: 'ZARA Manager', password: hash('secret123') },
    }),
    prisma.storeOwner.upsert({
      where: { email: 'sport@libos.uz' }, update: {},
      create: { email: 'sport@libos.uz', phone: '+998901234562', name: 'SportCity Manager', password: hash('secret123') },
    }),
    prisma.storeOwner.upsert({
      where: { email: 'nafosat@libos.uz' }, update: {},
      create: { email: 'nafosat@libos.uz', phone: '+998901234563', name: 'Nafosat Manager', password: hash('secret123') },
    }),
    prisma.storeOwner.upsert({
      where: { email: 'kidsland@libos.uz' }, update: {},
      create: { email: 'kidsland@libos.uz', phone: '+998901234564', name: 'KidsLand Manager', password: hash('secret123') },
    }),
    prisma.storeOwner.upsert({
      where: { email: 'asma@libos.uz' }, update: {},
      create: { email: 'asma@libos.uz', phone: '+998502500550', name: 'Asma Design', password: hash('secret123') },
    }),
  ])

  console.log(`✅ ${owners.length} ta do'kon egasi`)

  // ─── Do'konlar (barcha Qo'qon shahri) ───────────────────────
  const zaraStore = await prisma.store.upsert({
    where: { slug: 'zara-men' },
    update: { city: "Qo'qon", address: "Mustakillik ko'chasi, 14, Qo'qon" },
    create: {
      name: 'ZARA Men',
      slug: 'zara-men',
      city: "Qo'qon",
      description: 'Premium erkaklar kiyimlari. Zamonaviy uslub va yuqori sifat.',
      address: "Mustakillik ko'chasi, 14, Qo'qon",
      phone: '+998901234561',
      isOpen: true,
      rating: 4.8,
      reviewCount: 124,
      genders: ['MEN'],
      hasDelivery: true,
      hasPickup: true,
      hasCashOnDoor: true,
      deliveryTime: 45,
      themeColor: '#1a1a2e',
      themeBg: '#f0f0f5',
      ownerId: owners[0].id,
    },
  })

  const sportStore = await prisma.store.upsert({
    where: { slug: 'sport-city' },
    update: { city: "Qo'qon", address: "Istiqbol ko'chasi, 22, Qo'qon" },
    create: {
      name: 'SportCity',
      slug: 'sport-city',
      city: "Qo'qon",
      description: 'Sport kiyimlari va jihozlar. Erkaklar va ayollar uchun.',
      address: "Istiqbol ko'chasi, 22, Qo'qon",
      phone: '+998901234562',
      isOpen: true,
      rating: 4.6,
      reviewCount: 89,
      genders: ['MEN', 'WOMEN'],
      hasDelivery: true,
      hasPickup: true,
      hasCashOnDoor: false,
      deliveryTime: 30,
      themeColor: '#e63946',
      themeBg: '#fff5f5',
      ownerId: owners[1].id,
    },
  })

  const nafosatStore = await prisma.store.upsert({
    where: { slug: 'nafosat' },
    update: { city: "Qo'qon", address: "Hamid Olimjon ko'chasi, 8, Qo'qon" },
    create: {
      name: 'NafoSat',
      slug: 'nafosat',
      city: "Qo'qon",
      description: 'Ayollar uchun nafis va zamonaviy kiyimlar.',
      address: "Hamid Olimjon ko'chasi, 8, Qo'qon",
      phone: '+998901234563',
      isOpen: true,
      rating: 4.7,
      reviewCount: 203,
      genders: ['WOMEN'],
      hasDelivery: true,
      hasPickup: false,
      hasCashOnDoor: true,
      deliveryTime: 60,
      themeColor: '#d4449a',
      themeBg: '#fff0f8',
      ownerId: owners[2].id,
    },
  })

  const kidsStore = await prisma.store.upsert({
    where: { slug: 'kidsland' },
    update: { city: "Qo'qon", address: "Navoi ko'chasi, 5, Qo'qon" },
    create: {
      name: 'KidsLand',
      slug: 'kidsland',
      city: "Qo'qon",
      description: 'Bolalar uchun rang-barang va qulay kiyimlar.',
      address: "Navoi ko'chasi, 5, Qo'qon",
      phone: '+998901234564',
      isOpen: true,
      rating: 4.9,
      reviewCount: 167,
      genders: ['KIDS'],
      hasDelivery: true,
      hasPickup: true,
      hasCashOnDoor: true,
      deliveryTime: 40,
      themeColor: '#f4a261',
      themeBg: '#fffaf0',
      ownerId: owners[3].id,
    },
  })

  const asmaStore = await prisma.store.upsert({
    where: { slug: 'asma' },
    update: { city: "Qo'qon", address: "Istiqbol ko'chasi, 42, Qo'qon", telegramChatId: "8042807902" },
    create: {
      name: 'Asma Design',
      slug: 'asma',
      city: "Qo'qon",
      description: "Premium erkaklar kiyimi. Italiya ustaligi va zamonaviy dizayn uyg'unligi.",
      address: "Istiqbol ko'chasi, 42, Qo'qon",
      phone: '+998502500550',
      isOpen: true,
      rating: 4.9,
      reviewCount: 312,
      genders: ['MEN'],
      hasDelivery: true,
      hasPickup: true,
      hasCashOnDoor: true,
      deliveryTime: 60,
      themeColor: '#C9A84C',
      themeBg: '#0d0d0f',
      ownerId: owners[4].id,
    },
  })

  console.log("✅ 5 ta do'kon (barchasi Qo'qon)")

  // ─── Mahsulotlar (ZARA Men) ──────────────────────────────────
  const zaraProducts = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-zara-1' }, update: {},
      create: {
        id: 'prod-zara-1',
        name: "Slim Fit Ko'k Ko'ylak",
        description: "100% paxta, slim fit kesim. Rasmiy uchrashuvlar uchun ideal.",
        price: 180000,
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'],
        inStock: true,
        storeId: zaraStore.id,
        categoryId: categories[1].id,
        variants: { create: [
          { size: 'S', color: "Ko'k", quantity: 10 },
          { size: 'M', color: "Ko'k", quantity: 15 },
          { size: 'L', color: "Ko'k", quantity: 8 },
        ]},
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-zara-2' }, update: {},
      create: {
        id: 'prod-zara-2',
        name: 'Klassik Qora Shim',
        description: 'Stretch material, qulay va chiroyli. Ofis uchun mos.',
        price: 250000,
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'],
        inStock: true,
        storeId: zaraStore.id,
        categoryId: categories[2].id,
        variants: { create: [
          { size: '30', color: 'Qora', quantity: 12 },
          { size: '32', color: 'Qora', quantity: 20 },
          { size: '34', color: 'Qora', quantity: 9 },
        ]},
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-zara-3' }, update: {},
      create: {
        id: 'prod-zara-3',
        name: 'Qishki Kurtka',
        description: 'Issiq va engil. Wind-proof material.',
        price: 650000,
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'],
        inStock: true,
        storeId: zaraStore.id,
        categoryId: categories[0].id,
        variants: { create: [
          { size: 'M', color: 'Qora', quantity: 7 },
          { size: 'L', color: 'Kulrang', quantity: 4 },
        ]},
      },
    }),
  ])

  // ─── Mahsulotlar (NafoSat) ───────────────────────────────────
  const nafosatProducts = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-nafosat-1' }, update: {},
      create: {
        id: 'prod-nafosat-1',
        name: "Gul Naqshli Ko'ylak",
        description: 'Yozgi engil ko\'ylak. Rayon material.',
        price: 220000,
        images: ['https://images.unsplash.com/photo-1623609163859-ca93c959b5b8?w=400'],
        inStock: true,
        storeId: nafosatStore.id,
        categoryId: categories[3].id,
        variants: { create: [
          { size: 'S', color: 'Qizil', quantity: 8 },
          { size: 'M', color: 'Qizil', quantity: 12 },
          { size: 'L', color: 'Qizil', quantity: 6 },
        ]},
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-nafosat-2' }, update: {},
      create: {
        id: 'prod-nafosat-2',
        name: 'Qishki Palto',
        description: 'Issiq va nozik. Kuz-qish uchun.',
        price: 890000,
        images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400'],
        inStock: true,
        storeId: nafosatStore.id,
        categoryId: categories[4].id,
        variants: { create: [
          { size: 'S', color: 'Bej', quantity: 5 },
          { size: 'M', color: 'Bej', quantity: 9 },
        ]},
      },
    }),
  ])

  // ─── Mahsulotlar (KidsLand) ──────────────────────────────────
  const kidsProducts = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-kids-1' }, update: {},
      create: {
        id: 'prod-kids-1',
        name: 'Bolalar Sport Kostyumi',
        description: 'Yumshoq va qulay. 5-10 yoshli bolalar uchun.',
        price: 150000,
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400'],
        inStock: true,
        storeId: kidsStore.id,
        categoryId: categories[6].id,
        variants: { create: [
          { size: '110', color: "Ko'k", quantity: 15 },
          { size: '122', color: 'Yashil', quantity: 10 },
        ]},
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-kids-2' }, update: {},
      create: {
        id: 'prod-kids-2',
        name: 'Bolalar Kurtka',
        description: "Yomg'ir va shamoldan himoya. 3-8 yosh.",
        price: 280000,
        images: ['https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400'],
        inStock: true,
        storeId: kidsStore.id,
        categoryId: categories[5].id,
        variants: { create: [
          { size: '98', color: 'Sariq', quantity: 7 },
          { size: '110', color: 'Qizil', quantity: 6 },
        ]},
      },
    }),
  ])

  // ─── Mahsulotlar (Asma Design) ───────────────────────────────
  const asmaProducts = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-asma-1' }, update: {},
      create: {
        id: 'prod-asma-1',
        name: 'Milano Kostyumi',
        description: 'Italiya matosidan tayyorlangan slim-fit kostyum.',
        price: 1850000,
        images: ['/asma/products/suit-1.jpg'],
        inStock: true,
        storeId: asmaStore.id,
        categoryId: categories[7].id,
        variants: { create: [
          { size: '46', color: "Ko'mir", quantity: 5 },
          { size: '48', color: "Ko'mir", quantity: 8 },
          { size: '50', color: "Ko'mir", quantity: 6 },
        ]},
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-asma-2' }, update: {},
      create: {
        id: 'prod-asma-2',
        name: 'Kashmir Palto',
        description: '100% kashmir. Qishki sovuqlarga qarshi, elegantlik bilan.',
        price: 2400000,
        images: ['/asma/products/coat-1.jpg'],
        inStock: true,
        storeId: asmaStore.id,
        categoryId: categories[0].id,
        variants: { create: [
          { size: 'M', color: "Qo'ng'ir", quantity: 3 },
          { size: 'L', color: 'Qora', quantity: 4 },
        ]},
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-asma-3' }, update: {},
      create: {
        id: 'prod-asma-3',
        name: 'Oksford Ko\'ylak',
        description: 'Egipet paxtasidan. Slim-fit.',
        price: 420000,
        images: ['/asma/products/shirt-1.jpg'],
        inStock: true,
        storeId: asmaStore.id,
        categoryId: categories[1].id,
        variants: { create: [
          { size: 'M', color: 'Oq', quantity: 15 },
          { size: 'L', color: 'Moviy', quantity: 7 },
        ]},
      },
    }),
  ])

  console.log(`✅ ${zaraProducts.length + nafosatProducts.length + kidsProducts.length + asmaProducts.length} ta mahsulot`)
  console.log("\n🎉 Seed muvaffaqiyatli yakunlandi!")
  console.log("\nQo'qon do'konlari:")
  console.log("  • ZARA Men     → /stores/zara-men     (Mustakillik ko'chasi)")
  console.log("  • SportCity    → /stores/sport-city   (Istiqbol ko'chasi)")
  console.log("  • NafoSat      → /stores/nafosat      (Hamid Olimjon ko'chasi)")
  console.log("  • KidsLand     → /stores/kidsland     (Navoi ko'chasi)")
  console.log("  • Asma Design  → /stores/asma         (Istiqbol ko'chasi)")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
