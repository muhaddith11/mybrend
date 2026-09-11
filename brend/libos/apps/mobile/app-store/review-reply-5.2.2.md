# App Review — Guideline 5.2.2 (Legal) javobi

**Holat:** `1.0.0 (9)`, review 2026-08-22, iPad Air 11-inch (M3).

✅ **Oldingi 2.1(a) muammosi HAL BO'LDI** — bu rad javobida u yo'q. Navigatsiya
tuzatishi (`fbe2fc1`) ishladi, reviewer ilovaga kirib do'konlarni ko'rdi.

❗ **Yangi masala:** Apple 4 ta do'kon mahsulotlari sotilayotganini ko'rib,
ular bilan shartnoma borligini hujjat bilan isbotlashni so'radi.
**Kodga o'zgartirish kerak emas.**

## Tanlangan yechim

| Do'kon | Qaror |
|---|---|
| Aura Med Forma | qoladi — ruxsatnoma tayyor |
| Asma Design | qoladi — ruxsatnoma tayyor |
| One Pro | **yashiriladi** (`isHidden = true`) |
| Boosner | **yashiriladi** (`isHidden = true`) |

Yashirish yangi build talab qilmaydi — bu ma'lumot o'zgarishi. Apple o'sha
`1.0.0 (9)` ni qayta ko'radi.

---

## Bajarish tartibi

1. **Do'konlarni yashirish** (Neon SQL):
   ```sql
   UPDATE "Store" SET "isHidden" = true WHERE slug IN ('onepro', 'boosner');
   ```
2. **Tekshirish** — API'da 2 ta do'kon qolganini ko'ring:
   ```
   https://libos-api.vercel.app/api/stores
   ```
   Shuningdek `/api/products/featured` da yashirilgan do'kon mahsulotlari
   yo'qligiga ishonch hosil qiling.
3. **PDF tayyorlash** — `ruxsatnoma-a4.html` ni brauzerda oching → **Print** →
   *Destination* sifatida **Save as PDF**. Printer kerak emas. Ikki varaq
   chiqadi: 1-si Aura, 2-si Asma.
4. **Egalarga yuborish** — PDF'ni Telegram orqali Sardor va Alisherga yuboring.
   Ular telefonda o'zlari to'ldiradi: **telefon raqami, sana va imzo**.
   - iPhone: PDF'ni ochib → **Markup** (qalam belgisi) → matn va imzo qo'shish
   - Android: **Adobe Acrobat Reader** → **Fill & Sign**

   Muhr ixtiyoriy — bo'lmasa talab qilinmaydi.
5. Qaytgan ikki varaqni **bitta PDF** ga jamlab, **App Store Connect →
   App Information → App Review Information → Attachment** ga yuklang.
6. **App Review → Messages → Reply** ga pastdagi matnni joylang.
7. **Submit for Review** (o'sha `1.0.0 (9)` build bilan).

⚠️ 1-qadamni javob yuborishdan **oldin** bajaring. Reviewer ilovani ochganda
4 ta do'kon ko'rsa, xat 2 ta bo'lgani uchun darhol rad qiladi.

---

## Reply matni

```
Hello App Review Team,

Thank you for the review, and thank you for confirming that the sign-in
issue from our previous submission is now resolved.

Regarding Guideline 5.2.2, we have taken both of the steps you outlined.

First, the app now lists two stores instead of four. We have removed One Pro
and Boosner from the application while we complete their paperwork; they are
no longer visible anywhere in the app.

Second, we have attached signed authorisation letters from the owners of the
two stores that remain — Aura Med Forma and Asma Design — in the App Review
Information section. Each letter is signed by the owner of that store and
authorises ZYFF to display their catalogue and to receive customer orders on
their behalf.

We would also like to clarify how the app works, as we believe this
addresses the underlying concern:

1. The stores are contracted partners, not third-party services. They are
   small local clothing retailers in Qo'qon, Uzbekistan, who joined the
   platform voluntarily in order to sell online.

2. ZYFF does not collect or copy their content. Each store owner has their
   own account and uploads and manages their own product photos, names,
   descriptions and prices through a private store-owner panel inside the
   app. All catalogue content on the platform was published by the store
   owners themselves.

3. The app does not charge users for access. ZYFF is free to download, has
   no in-app purchases, no subscriptions and no paywall of any kind. Every
   store and every product is visible to all users at no cost. There is no
   fee for access to any store.

4. ZYFF does not process payments. A customer either pays the store in cash
   on delivery, or transfers the amount directly to that store owner's own
   bank card. Money never passes through ZYFF. The purchase contract is
   between the customer and the store, which is stated in our Terms of Use
   inside the app.

If any additional documentation would help, we are happy to provide it.

Thank you for your time.
```

---

## Diqqat qilinadigan ikki narsa

**1. Yashirilgan do'konlarni qaytarish.** One Pro va Boosner'ni keyin
qaytarmoqchi bo'lsangiz, ularning ruxsatnomasi ham tayyor bo'lishi kerak —
Apple bu yozishmadan keyin do'kon sonini kuzatadi. Hujjatsiz qaytarish
keyingi update'da rad javobga olib kelishi mumkin.

**2. Reviewer qurilmasi yana iPad** (iPad Air 11-inch M3), ilova iPhone
rejimida qora ramkada ishlaydi (`supportsTablet: false`). Hozircha rad sababi
emas, lekin kelajakdagi xavf sifatida yodda tursin.
