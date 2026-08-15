# App Store Connect — ilova sahifasi matni

App Store Connect → My Apps → ZYFF → **Distribution** bo'limiga copy-paste qilinadi.
Primary language: **English (U.S.)** (App Store o'zbek tilini localization sifatida
qo'llab-quvvatlamaydi — matn o'zbekcha, locale esa en-US bo'ladi).

---

## Name (max 30 belgi)

```
ZYFF
```

## Subtitle (max 30 belgi)

```
Qo'qon kiyim do'konlari
```

## Promotional text (max 170 belgi — review'siz istalgan payt yangilanadi)

```
Qo'qondagi kiyim do'konlari bitta ilovada. Yangi mahsulotlar har hafta qo'shiladi — ko'ring, solishtiring va uydan chiqmasdan buyurtma bering.
```

## Description (max 4000 belgi)

```
ZYFF — Qo'qon shahridagi kiyim do'konlarini bitta ilovaga jamlagan marketplace.
Asma Design, Boosner, One Pro va boshqa ishonchli do'konlardan erkaklar,
ayollar va bolalar kiyimlarini bir joyda ko'ring, solishtiring va xarid qiling.

NIMA UCHUN ZYFF?

• Bir nechta do'konni alohida-alohida qidirish shart emas — barchasi bitta ilovada
• Mahsulotlarni narx, o'lcham va rangi bo'yicha solishtirish qulay
• Tez va oddiy buyurtma berish jarayoni
• Telefon raqam orqali bir zumda ro'yxatdan o'tish (SMS-kod)
• Qo'qon va O'zbekiston bo'ylab yetkazib berish
• Qorong'i (dark) rejim va o'zbek/rus tillari

QANDAY ISHLAYDI

1. Telefon raqamingizni kiriting va SMS-kod bilan tasdiqlang
2. Yoqqan mahsulotlarni savatga qo'shing
3. Yetkazib berish manzilini kiriting
4. Qulay to'lov usulini tanlang
5. Buyurtmangiz sotuvchiga yetkaziladi

TO'LOV USULLARI

• Naqd pul (kuryerga qo'lda yoki do'kondan olib ketishda)
• Karta orqali o'tkazma (buyurtmadan so'ng sotuvchi karta raqami/QR yuboradi)

Karta ma'lumotlari ilovada saqlanmaydi va ilova ichida so'ralmaydi.

DO'KON EGALARI UCHUN

ZYFF ichida do'kon ochish va mahsulotlarni boshqarish imkoniyati bor:
mahsulot qo'shish, narx va stokni yangilash, buyurtmalarni kuzatish.

MAXFIYLIK

Biz faqat xizmat uchun zarur ma'lumotni yig'amiz: telefon raqami (kirish uchun)
va yetkazib berish manzili (buyurtma uchun). Reklama yoki analitika SDK'lari yo'q.
Hisobingizni istalgan payt ilova ichidan butunlay o'chirishingiz mumkin
(Profil → Hisobni butunlay o'chirish).

ZYFF — Qo'qonda onlayn kiyim xaridini soddalashtiramiz.
```

## Keywords (max 100 belgi, vergul bilan)

```
kiyim,do'kon,Qo'qon,onlayn,xarid,marketplace,moda,savdo,yetkazib berish,O'zbekiston
```

## URL'lar

| Maydon | Qiymat |
|--------|--------|
| Support URL | https://zyff.uz/help |
| Marketing URL | https://zyff.uz |
| Privacy Policy URL | https://zyff.uz/privacy |

## Boshqa maydonlar

- **Category**: Primary → Shopping, Secondary → Lifestyle
- **Copyright**: `2026 ZYFF`
- **Age rating**: 4+ (zo'ravonlik/kattalar kontenti yo'q; UGC yo'q)
- **Price**: Free
- **Availability**: O'zbekiston (yoki barcha davlatlar)

---

## App Review Information (⚠️ ENG MUHIM — bo'sh qoldirilsa rad etiladi)

Ilova telefon+SMS orqali kirishni talab qiladi. Apple reviewer O'zbekiston raqamiga
SMS ololmaydi, shuning uchun **demo hisob berish SHART** (Guideline 2.1).

**Sign-in required**: Yes

| Maydon | Qiymat |
|--------|--------|
| Demo phone | `+998 90 123 45 67` ← istalgan +998 raqam yozing |
| Demo code | `007700` |

**Notes** (reviewer uchun izoh — inglizcha):

```
Sign-in uses phone number + SMS one-time code.

SMS is only delivered to Uzbek (+998) numbers, so instead of requesting a
real code, use the universal test code 007700, which works with any phone
number entered:

  Phone: +998 90 123 45 67  (or any +998 number)
  Verification code: 007700

Steps: open the app -> Profile tab -> enter any +998 phone number ->
tap "Get code" -> enter 007700 -> you are signed in.

Payments: the app sells physical clothing from local stores in Kokand,
Uzbekistan. Payment is cash on delivery or a bank transfer arranged
directly with the seller after the order is placed. No digital goods or
in-app purchases are sold, and no card details are collected in the app.

Account deletion: Profile -> "Hisobni butunlay o'chirish" (Delete account).
```

---

## App Privacy (majburiy — usiz submit tugmasi ochilmaydi)

App Store Connect → **App Privacy** (chap menyuda, Distribution'dan alohida sahifa).

**"Do you or your third-party partners collect data from this app?"** → **Yes**

Yig'iladigan ma'lumotlar (kod audit qilindi, 2026-08-12):

| Kategoriya | Ma'lumot turi | Maqsad | Shaxsga bog'liqmi | Tracking |
|-----------|---------------|--------|-------------------|----------|
| Contact Info | **Name** | App Functionality | Ha (Linked) | Yo'q |
| Contact Info | **Phone Number** | App Functionality | Ha (Linked) | Yo'q |
| Contact Info | **Physical Address** | App Functionality | Ha (Linked) | Yo'q |
| Purchases | **Purchase History** | App Functionality | Ha (Linked) | Yo'q |
| Identifiers | **User ID** | App Functionality | Ha (Linked) | Yo'q |

Har bir turda so'raladigan uchta savolga javob bir xil:
- **Purpose** → faqat `App Functionality` (Analytics/Advertising/Personalization → **Yo'q**)
- **Linked to the user's identity?** → **Yes** (hisobga bog'langan)
- **Used for tracking purposes?** → **No**

**YIG'ILMAYDI** (belgilamang):
- ❌ Location — ilova qurilma GPS'iga murojaat qilmaydi (`expo-location` o'rnatilmagan);
  manzil foydalanuvchi tomonidan qo'lda kiritiladi va u Physical Address sifatida
  yuqorida e'lon qilingan
- ❌ Health, Financial Info (karta ma'lumoti ilovada so'ralmaydi)
- ❌ Usage Data, Diagnostics — mobil ilovada analytics/crash SDK **yo'q**
  (Sentry faqat web va backend'da)
- ❌ Contacts, Photos (galereya faqat do'kon egasi mahsulot rasmini yuklashi uchun
  ochiladi — rasm serverga mahsulot rasmi sifatida ketadi, shaxsiy ma'lumot
  sifatida yig'ilmaydi), Search History, Sensitive Info

**Tracking**: "Data Used to Track You" → **None**. ATT (App Tracking Transparency)
so'rovi kerak emas.

---

## Submit tartibi — qaysi sahifada nima

Submit tugmasi faqat **hamma yashil** bo'lganda ishlaydi:

| # | Sahifa | Nima to'ldiriladi | Manba |
|---|--------|-------------------|-------|
| 1 | **App Information** | Name `ZYFF`, Subtitle, Category (Shopping), Content Rights, Age Rating (4+) | yuqorida |
| 2 | **Pricing and Availability** | Free, mamlakat tanlovi | yuqorida |
| 3 | **App Privacy** | jadval yuqorida | ↑ |
| 4 | **Distribution → iOS App 1.0** | Screenshotlar, Promotional text, Description, Keywords, Support/Marketing URL, Copyright | yuqorida |
| 5 | **Distribution → App Review Information** | demo raqam + `007700` + Notes | ↑ |
| 6 | — | **Add for Review** | — |

> ⚠️ Screenshotsiz va App Privacy'siz submit **bloklanadi** — eng ko'p vaqt
> shu ikkisiga ketadi.

---

## TestFlight → Test Information (beta test uchun alohida forma)

Bu App Store listing'dan **alohida** forma: App Store Connect → TestFlight →
Test Information. Tashqi testerlar va beta review uchun kerak
(ichki testerlar uchun shart emas).

**Beta App Description** (kamida 10 belgi):

```
ZYFF is a marketplace app for clothing stores in Kokand, Uzbekistan.
Browse stores and products, add items to the cart, and place an order
for delivery or pickup.

Sign in with any +998 phone number and use the verification code 007700.

What to test: browsing stores, product details with size and color
selection, cart and checkout, order history, dark mode, and account
deletion in Profile.
```

**Sign-In Information** — ilova parol ishlatmaydi (telefon + SMS kod), shuning
uchun Apple'ning ikki maydoni shunday moslashtiriladi:

| Apple maydoni | Yoziladigan qiymat |
|---------------|--------------------|
| User Name | `+998901234567` (soxta raqam — shaxsiy raqamingizni YOZMANG) |
| Password | `007700` |

---

## Screenshotlar (majburiy)

`supportsTablet: false` bo'lgani uchun **faqat iPhone** kerak, iPad shart emas.

App Store Connect (2026-08 holati) **6.5" Display** slotini so'raydi:

| O'lcham | Qabul qilinadigan piksel | Nechta |
|---------|--------------------------|--------|
| iPhone 6.5" | `1242 × 2688` yoki `1284 × 2778` (yoki gorizontal teskarisi) | 3–10 |

> Apple shu to'plamni qolgan iPhone o'lchamlariga avtomatik moslashtiradi.
> Birinchi 3 tasi o'rnatish oynasida ko'rinadi — eng yaxshilarini oldinga qo'ying.
> iPad va Apple Watch tablari bo'sh qolsa bo'ladi (`supportsTablet: false`).

**Windows'da iOS simulyator yo'q** — eng oson yo'l: birinchi build TestFlight'ga
chiqqach, uni shaxsiy iPhone'ingizga o'rnatib, qo'lda screenshot oling
(iPhone 15/16/17 Pro Max bo'lsa o'lcham to'g'ri keladi; kichikroq iPhone bo'lsa
screenshot'ni 1320×2868 ga kattalashtirish kerak).

Tavsiya etilgan 5 ta ekran:
1. Bosh sahifa (do'konlar ro'yxati)
2. Do'kon sahifasi (mahsulotlar gridi)
3. Mahsulot detali (rasm + o'lcham/rang tanlash)
4. Savat / checkout
5. Profil yoki qorong'i rejim

⚠️ Screenshot olishdan oldin kamida bitta do'konda haqiqiy mahsulot rasmlari
borligiga ishonch hosil qiling (stok/Unsplash rasm bilan Apple "placeholder
content" deb rad etishi mumkin).
