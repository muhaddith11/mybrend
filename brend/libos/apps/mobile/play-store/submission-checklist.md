# ZYFF — Google Play va App Store'ga chiqarish checklist

## HOZIRGI HOLAT (tekshirildi)

- [x] Android production build tayyor: EAS'da `.aab` fayl bor
      (build ID `8d5bf238`, version code 3, commit `04488f8`)
      https://expo.dev/accounts/muhaddith/projects/zyff/builds/8d5bf238-c5db-40c5-8a06-3a3616070227
- [x] Play Store listing matni tayyor → `play-store/listing-uz.md`
- [x] Play ikon (512x512) va feature graphic (1024x500) tayyor → `play-store/` papkasida
- [x] Privacy policy sahifasi bor: https://zyff.uz/privacy
- [x] Terms sahifasi bor: https://zyff.uz/terms
- [x] Ilova ichida hisobni o'chirish funksiyasi qo'shildi (Play Store majburiy talabi)
- [ ] Apple Developer akkaunt — hali yo'q ($99/yil, pastga qarang)
- [ ] Play Console'da app entry yaratilmagan (quyida qadamlar)

---

## 1-QISM: GOOGLE PLAY (hozir qilsa bo'ladi)

### 1. Play Console'da yangi ilova yarating
1. https://play.google.com/console → "Create app"
2. Nomi: **ZYFF**, til: O'zbek, turi: App, bepul/pullik: Bepul
3. Deklaratsiyalarni tasdiqlang (developer policies, US export laws)

### 2. Store listing to'ldirish
`play-store/listing-uz.md` faylidagi matnlarni copy-paste qiling:
- Short description, Full description
- App icon: `assets/icon.png` (512x512 kerak — kerak bo'lsa `play-store/play-icon-512.png` dan foydalaning)
- Feature graphic: `play-store/feature-graphic-1024x500.png`
- **Phone screenshots (kamida 2 ta kerak)**: hozircha tayyor emas — pastga qarang

### 3. Content rating anketasi
Play Console → Policy → App content → Content rating. Savollarga javoblar (kodni tekshirib chiqdim):
- Zo'ravonlik, jinsiy kontent, giyohvandlik: **Yo'q**
- Foydalanuvchi tomonidan yaratiladigan kontent (UGC): **Yo'q**
- Ijtimoiy tarmoq funksiyalari: **Yo'q**
- Xarid qilish imkoniyati (in-app purchase emas, lekin tashqi to'lov): savolga qarab "Digital purchases" bo'limida CASH/CLICK/PAYME orqali xarid borligini ko'rsating
- Joylashuv ulashish: **Yo'q** (ilova joylashuvdan foydalanmaydi)

### 4. Data Safety forma (kodni to'liq audit qildim — aniq javoblar)
- **Yig'iladigan ma'lumotlar**: Telefon raqami (autentifikatsiya uchun), yetkazib berish manzili (buyurtma uchun)
- **Kolleksiya usuli**: Ixtiyoriy emas — hisob yaratish uchun telefon raqami shart
- **Shifrlash**: Ha, HTTPS orqali uzatiladi
- **Uchinchi tomonlarga uzatish**: Yo'q (Click/Payme to'lov holida ular o'z sahifalarida ishlaydi, karta ma'lumoti ilovaga kirmaydi)
- **Hisobni o'chirish**: Ha — ilova ichida (Profil → Hisobni butunlay o'chirish). Play so'raganda shu yo'lni tasvirlab bering, alohida veb-sahifa shart emas chunki in-app yechim bor
- **Reklama/analytics SDK**: Yo'q hech qanday (Sentry ham mobile ilovada yo'q)

### 5. Pricing & distribution
- Mamlakatlar: O'zbekiston (yoki barcha davlatlar, xohishga qarab)
- Reklama mavjudmi: Yo'q
- Bolalar uchunmi: Yo'q

### 6. `.aab` faylni yuklash
Ikki yo'l bor:
- **Qo'lda**: https://expo.dev/artifacts/eas/TK5GiUSnHCZYBO2Uggr_VRsgAbkzcRtiiLGfMB_8jjo.aab dan yuklab oling, Play Console → Production → Create release → Upload
- **EAS orqali avtomatik** (`eas submit`): quyidagi sozlash kerak:
  1. Play Console → Setup → API access → Google Cloud'da service account yarating
  2. Service account'ga "Release manager" huquqi bering, JSON kalitni yuklab oling
  3. `eas.json`'dagi `submit.production` ichiga qo'shing:
     ```json
     "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "production" }
     ```
  4. `npx eas submit --platform android --latest`

### 7. Screenshotlar (etishmayapti — bitta qadam qoldi)
Play kamida 2 ta, tavsiya 4-8 ta telefon skrinshoti talab qiladi. Eng tez yo'l:
- Android build'ni telefoningizga yoki emulatorga o'rnating:
  `npx eas build:run -p android` (oxirgi buildni yuklab, emulatorda ochadi — Android Studio kerak)
  yoki `.aab`/APK'ni real telefonga o'rnatib, qo'lda screenshot oling
- Kamida shu ekranlar: Bosh sahifa, Do'kon sahifasi (mahsulotlar ro'yxati), Mahsulot detali, Savat/checkout
- **Eslatma**: hozirgi test ma'lumotlarida ba'zi do'konlarning mahsulot rasmlari yo'q yoki Unsplash stok-rasm — screenshot olishdan oldin kamida bitta do'konda (masalan One Pro) haqiqiy rasmlar borligiga ishonch hosil qiling

### 8. Submit for review
Barcha bo'limlar (Store listing, Content rating, Data safety, Pricing, App content) yashil belgi bo'lgach → "Send for review". Odatda 1-7 kun ichida javob keladi.

---

## 2-QISM: APPLE APP STORE (akkaunt kerak)

### 1. Apple Developer Program'ga ro'yxatdan o'ting
- https://developer.apple.com/programs/enroll/
- $99/yil, Apple ID kerak, shaxsni tasdiqlash (pasport/ID) so'ralishi mumkin
- Tasdiqlash odatda 24-48 soat, ba'zan bir necha kun

### 2. Akkaunt tayyor bo'lgach — menga ayting, quyidagilarni qilaman:
- `eas build --platform ios --profile production` — birinchi iOS build (EAS avtomatik App ID/sertifikat yaratadi, Apple ID bilan interaktiv login so'raydi)
- App Store Connect'da yangi app entry yaratish (bundle ID: `uz.zyff.app` allaqachon `app.json`'da tayyor)
- App Privacy (nutrition label) — Play'dagi Data Safety bilan bir xil ma'lumotlar asosida to'ldiriladi
- iOS screenshotlari kerak: 6.7" (iPhone 15 Pro Max) va 6.5" o'lchamlarida — simulatorda olish mumkin, akkaunt kutilayotganda ham EAS simulator build orqali tayyorlab qo'yish mumkin

### 3. iOS uchun app.json'da hozircha yetarli
`ios.bundleIdentifier: "uz.zyff.app"` bor. Kamera/joylashuv kabi permission ishlatilmagani uchun `NSCameraUsageDescription` va shunga o'xshash tavsif matnlari kerak emas.

---

## Xulosa — hozir nima qilish kerak

1. **Bugun**: Play Console'da app yarating, listing matnini kiriting, content rating + data safety to'ldiring (yuqoridagi javoblar bilan)
2. **1-2 kun ichida**: telefon/emulatorda skrinshotlar oling, .aab'ni yuklang, review'ga yuboring
3. **Parallel**: Apple Developer Program'ga ariza bering — tasdiqlansa aytib qo'ying, iOS build'ni boshlaymiz
