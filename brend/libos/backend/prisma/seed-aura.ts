// Aura Med Forma do'konini bazaga qo'shadi (idempotent — bir necha marta
// ishlatsa ham dublikat yaratmaydi, faqat yangilaydi).
//
// Ishga tushirish:
//   cd backend
//   AURA_ADMIN_PASSWORD='...' npx tsx prisma/seed-aura.ts
//
// Parol faqat env orqali beriladi — repoga tushmasin. Do'kon egasi keyin
// admin panelda logo/banner, manzil, karta rekvizitlari va mahsulotlarni
// o'zi kiritadi.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Do'kon ma'lumotlari ────────────────────────────────────────────
const STORE = {
  name: 'Aura Med Forma',
  slug: 'aura', // mobil ilovadagi maxsus dizayn shu slug'ga bog'langan (lib/storeDesigns.ts)
  city: "Qo'qon",
  // Hero ostidagi matn va "brend hikoyasi" bo'limida ko'rinadi — t.me/Aura_Medforma dan.
  description:
    "AURA MED FORMA — siz loyiq bo'lgan sifat. Premium med xalat va formalar: " +
    "erkaklar va ayollar uchun, turli rang va razmerlarda. Dona va optim savdo.",
  address: "Qo'qon shahri, O'zbekiston", // TODO: aniq ko'cha/uy raqami
  phone: '+998919776777',
  telegram: 'Aura_Medforma',
  workingHours: 'Har kuni: 10:00 - 22:00',
  // 40°31'10.7"N 70°56'49.9"E — footer'dagi manzil bosilganda xaritada yo'nalish ochiladi
  lat: 40.5196389,
  lng: 70.9471944,
  themeColor: '#D4AF6A', // oltin — storeDesigns.ts dagi accent bilan bir xil
  themeBg: '#06302A', // to'q zumrad — do'kon avatari foni
  genders: ['MEN', 'WOMEN'] as const,
  hasDelivery: true, // kanalda: "Yetkazib berish xizmati mavjud"
  hasPickup: true,
  hasCashOnDoor: true,
  deliveryTime: 45,
}

const OWNER = {
  email: process.env.AURA_ADMIN_USER ?? 'auraadmin', // admin panelga kirish logini
  name: 'Aura Med Forma Manager',
  phone: STORE.phone,
}

// Do'konning o'z kategoriyalari (storeId bog'langan — boshqa do'konlarda ko'rinmaydi)
const CATEGORIES: { slug: string; name: string; gender: 'MEN' | 'WOMEN' | 'KIDS' }[] = [
  { slug: 'aura-halat', name: 'Halatlar', gender: 'WOMEN' },
  { slug: 'aura-kostyum', name: 'Med kostyumlar', gender: 'WOMEN' },
  { slug: 'aura-erkak', name: 'Erkaklar formasi', gender: 'MEN' },
  { slug: 'aura-tapichka', name: 'Tapichkalar', gender: 'WOMEN' },
  { slug: 'aura-qalpoq', name: 'Qalpoqlar', gender: 'WOMEN' },
  { slug: 'aura-asbob', name: 'Tibbiy asboblar', gender: 'MEN' },
  { slug: 'aura-aksessuar', name: 'Med aksessuarlar', gender: 'WOMEN' },
]

async function main() {
  const rawPassword = process.env.AURA_ADMIN_PASSWORD
  if (!rawPassword || rawPassword.length < 6) {
    throw new Error(
      "AURA_ADMIN_PASSWORD env o'zgaruvchisi kerak (kamida 6 belgi).\n" +
      "Masalan: AURA_ADMIN_PASSWORD='...' npx tsx prisma/seed-aura.ts",
    )
  }
  // Bu hisob jonli bazadagi buyurtmalar va mijoz ma'lumotlarini ko'radi —
  // qisqa parol qo'yilsa ogohlantiramiz (bloklamaymiz, tanlov egasiniki).
  if (rawPassword.length < 12) {
    console.warn(`⚠️  Parol qisqa (${rawPassword.length} belgi) — ishga tushirishdan oldin kuchaytiring.`)
  }
  const password = await bcrypt.hash(rawPassword, 10)

  // ─── Do'kon egasi ───────────────────────────────────────────────
  const owner = await prisma.storeOwner.upsert({
    where: { email: OWNER.email },
    update: { password, name: OWNER.name },
    create: { ...OWNER, password },
  })
  console.log(`✅ Do'kon egasi: ${owner.email}`)

  // ─── Do'kon ─────────────────────────────────────────────────────
  // update'da faqat brendga oid maydonlarni yangilaymiz — egasi admin panelda
  // o'zgartirgan manzil/telefon/ish vaqti/logo qayta ishga tushirilganda o'chib
  // ketmasin. Koordinatalar bundan mustasno: ularni admin panelda tahrirlab
  // bo'lmaydi, demak shu skript yagona manba.
  const store = await prisma.store.upsert({
    where: { slug: STORE.slug },
    update: {
      name: STORE.name,
      description: STORE.description,
      themeColor: STORE.themeColor,
      themeBg: STORE.themeBg,
      genders: [...STORE.genders],
      lat: STORE.lat,
      lng: STORE.lng,
    },
    create: {
      ...STORE,
      genders: [...STORE.genders],
      isOpen: true,
      ownerId: owner.id,
    },
  })
  console.log(`✅ Do'kon: ${store.name} → /store/${store.slug}`)

  // ─── Kategoriyalar ──────────────────────────────────────────────
  // (storeId, slug) juftligi unikal — shuning uchun upsert o'rniga
  // findFirst + create (idempotent).
  let created = 0
  for (const c of CATEGORIES) {
    const existing = await prisma.category.findFirst({ where: { slug: c.slug, storeId: store.id } })
    if (existing) continue
    await prisma.category.create({ data: { ...c, storeId: store.id } })
    created++
  }
  console.log(`✅ Kategoriyalar: ${created} ta yangi, jami ${CATEGORIES.length} ta`)

  // Logo/banner ataylab bo'sh qoldiriladi — ilovada `aura` dizayniga biriktirilgan
  // bundled rasmlar ishlatiladi (apps/mobile/lib/storeDesigns.ts). Admin panelda
  // rasm yuklansa, bazadagi qiymat ustun bo'ladi va bundled rasm o'rnini bosadi.
  console.log('\nKeyingi qadam — admin panelda (ilova → Profil → Admin):')
  console.log(`  login: ${owner.email}`)
  console.log('  • Mahsulotlarni qo\'shish')
  console.log('  • Aniq manzil va ish vaqtini kiritish')
  console.log("  • Karta rekvizitlari (bot orqali to'lov uchun)")
  console.log('  • Xohlasa — o\'z logo/bannerini yuklash (bundled rasm o\'rniga)')
}

main()
  .catch((e) => {
    console.error('❌', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
