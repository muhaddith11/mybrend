# App Review — Guideline 2.1 "Information Needed" javobi

Apple 1.0.0 (4) build'ini **Guideline 2.1 — Information Needed** bilan rad etdi.
Bu funksional xato emas: Apple yangi ilovalar uchun qo'shimcha ma'lumot so'ragan.
Kodga o'zgartirish kerak emas.

## Bajarish tartibi

1. **Ekran yozuvini tayyorlash** (pastdagi ssenariy bo'yicha) va biror joyga yuklash
   (masalan Google Drive) — havolasi ochiq bo'lsin.
2. App Store Connect → App Review → **Messages** → Apple xabariga **Reply** —
   pastdagi "Reply matni"ni to'liq joylashtirish.
3. Xuddi shu matnni **App Review Information → Notes** maydoniga ham qo'yish
   (Apple buni keyingi submissionlar uchun aniq so'ragan).
4. **Resubmit to App Review**.

---

## 1-band: ekran yozuvi (screen recording)

Talab: **haqiqiy qurilmada**, eng yangi iOS'da, ilovani **ochishdan boshlab**.
iPhone'da: Settings → Control Center → Screen Recording qo'shib, yozib olinadi.

Ssenariy (taxminan 2–3 daqiqa, tartib buzilmasin):

| # | Ko'rsatiladigan narsa |
|---|---|
| 1 | Bosh ekrandan ZYFF ikonkasini bosib ilovani ochish (splash ko'rinsin) |
| 2 | Onboarding / bosh sahifa, do'konlar ro'yxati |
| 3 | Do'konga kirish → mahsulotlar → bitta mahsulot sahifasi |
| 4 | O'lcham/rang tanlab savatga qo'shish |
| 5 | **Ro'yxatdan o'tish/kirish**: telefon raqam kiritish → SMS kod ekrani → `007700` → kirish |
| 6 | Savat → Buyurtma berish → yetkazish turini tanlash → xaritadan manzil belgilash |
| 7 | To'lov usuli: **Naqd** tanlab buyurtma berish → buyurtma kuzatuv sahifasi |
| 8 | To'lov usuli **Karta (Telegram bot)** ni ham ko'rsatish — bot ochilishi |
| 9 | **Kamera/galereya ruxsati** so'ralgan joyni ko'rsatish (profil rasmi yoki admin mahsulot rasmi) |
| 10 | Profil → **Hisobni butunlay o'chirish** → tasdiqlash ekrani (oxirigacha bosish shart emas, oqim ko'rinsa bas) |

Apple so'ragan, lekin ZYFF'da **yo'q** narsalar (yozuvda ko'rsatilmaydi, matnda tushuntiriladi):
pullik kontent, obuna, IAP, foydalanuvchi yaratadigan kontent, joylashuv (GPS), App Tracking Transparency.

---

## 2-band: sinovdan o'tkazilgan qurilmalar

> ⚠️ **Bu yerni o'zing to'ldir** — men qaysi qurilmalarda sinaganingni bilmayman.
> Kamida bitta real iPhone modeli va iOS versiyasi bo'lishi shart.
> Masalan: `iPhone 13, iOS 26.1` · `iPhone SE (3rd gen), iOS 18.6`

---

## Reply matni (App Store Connect'ga joylashtiriladi)

```
Hello App Review Team,

Thank you for the review. Please find the requested information below.

1) SCREEN RECORDING
A screen recording captured on a physical iPhone running the latest iOS is
available here: <RECORDING LINK>
It begins with launching the app and covers the full user flow: browsing
stores and products, adding an item to the cart, phone-number registration
and login, placing an order (cash on delivery and bank-transfer options),
the camera/photo-library permission prompt, and the in-app account deletion
flow.

Notes on items listed in your message that do not apply to ZYFF:
- The app contains no paid digital content, no in-app purchases and no
  subscriptions. All goods sold are physical clothing items, paid for in
  cash on delivery or by direct bank-card transfer to the store owner.
- The app contains no user-generated content. Customers cannot post text,
  images, reviews or comments, so no reporting or blocking mechanism is
  required. All catalogue content is uploaded by the partner stores through
  a private store-owner panel.
- The app does not request location access, contacts, microphone, or App
  Tracking Transparency. The only sensitive permissions requested are camera
  and photo library, used solely to let a user set a profile picture and to
  let store owners upload product photos.

2) DEVICES AND OPERATING SYSTEMS TESTED
<DEVICES>

3) APP FUNCTION AND TARGET AUDIENCE
ZYFF is a local clothing marketplace for the city of Qo'qon, Uzbekistan.

Problem it solves: clothing stores in Qo'qon sell almost exclusively offline
or through scattered Instagram and Telegram pages. Shoppers cannot compare
what is available across stores, and small stores have no affordable way to
sell online.

What the app does: it brings the catalogues of local clothing stores into one
place. Users browse stores and products, filter by category and gender, save
favourites, add items to a cart, and place an order for delivery or in-store
pickup. Each order goes directly to the store that owns the product; ZYFF does
not hold inventory and does not process payments.

Target audience: residents of Qo'qon aged roughly 16-45 who shop for clothing,
and the local clothing stores that want an online sales channel.

The interface is available in Uzbek, Russian and English.

4) SETUP AND ACCESS INSTRUCTIONS
No setup is required. The app opens directly into the store catalogue and can
be browsed without an account. An account is only needed to place an order.

Customer demo account:
- Sign in with any Uzbek phone number in the format +998XXXXXXXXX
  (for example +998901234567).
- Tap "Get code".
- Enter the verification code: 007700
  This universal test code is accepted for any phone number so that the review
  team does not need to receive a real SMS.

Store-owner (admin) account:
The app also contains a private panel used by partner store owners to manage
their own products and orders. It is not part of the customer experience and
is not linked from the customer interface.
- Email: <ADMIN EMAIL>
- Password: <ADMIN PASSWORD>

Account deletion:
Profile -> "Hisobni butunlay o'chirish" (Delete account). The user confirms
with an SMS code and the account together with personal data is removed.

5) EXTERNAL SERVICES USED
- Neon (managed PostgreSQL) - application database
- Vercel - hosting for the REST API and the companion website
- Supabase Storage - hosting of product and profile images
- TextUp.uz - SMS delivery for one-time login codes
- Telegram Bot API - order notifications to store owners, and confirmation of
  bank-transfer payment receipts
- CARTO basemaps - map tiles used when the customer marks a delivery address
- Sentry - crash and error reporting

There is no payment processor: the app never takes card details. A customer
either pays cash on delivery, or transfers the amount directly to the store
owner's bank card through the store's Telegram bot, where the store owner
manually confirms the receipt. No AI services are used.

6) REGIONAL DIFFERENCES
There are none. The app serves a single city (Qo'qon, Uzbekistan) and behaves
identically for every user in every region. The only variation is the
interface language, which the user chooses manually between Uzbek, Russian and
English; the catalogue and all features are the same in all three.

7) REGULATED INDUSTRY / THIRD-PARTY MATERIAL
ZYFF does not operate in a regulated industry. It sells ordinary clothing on
behalf of local retail stores. All product photographs, names and descriptions
are supplied by the partner stores themselves, which own the rights to that
material. The app includes no third-party protected content.

Thank you for your time.
```

---

## To'ldirilishi kerak bo'lgan joylar

| Belgi | Nima kerak |
|---|---|
| `<RECORDING LINK>` | Ekran yozuvining ochiq havolasi |
| `<DEVICES>` | Sinovdan o'tkazilgan iPhone modeli + iOS versiyasi |
| `<ADMIN EMAIL>` / `<ADMIN PASSWORD>` | Do'kon egasi demo akkaunti (masalan Asma) |

## Eslatma

`007700` universal kodi hozir **har qanday** telefon raqami bilan ishlaydi.
Bu review uchun qulay, lekin ilova chiqqach xavfsizlik teshigi bo'ladi —
uni faqat bitta demo raqamga cheklash kerak. Qarang: `backend/src/routes/auth.ts`.
