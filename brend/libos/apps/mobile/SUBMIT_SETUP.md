# Store'ga chiqarish (EAS Submit) — sozlash qo'llanmasi

`eas.json` → `submit.production` ichida to'ldirilishi kerak bo'lgan maydonlar bor.
Quyidagi qadamlardan so'ng `eas submit` ishlaydi.

---

## iOS (App Store Connect)

`eas.json` da endi placeholder yo'q — `submit.production.ios` faqat `language: "en-US"`
saqlaydi. Qolganini (Apple ID, Team ID, ASC app ID) EAS **interaktiv** so'raydi va
App Store Connect'dagi ilova yozuvini ham o'zi yaratadi (Bundle ID: `uz.zyff.app`).

Shuning uchun quyidagi buyruqlarni **o'zingiz terminalda** ishga tushiring —
Apple ID paroli va 2FA kodi so'raladi:

```bash
npx eas-cli build --platform ios --profile production
```

Birinchi ishga tushirishda EAS so'raydi:
- Apple ID email + parol + 2FA kod (faqat siz kiritasiz)
- "Generate a new Apple Distribution Certificate?" → **Yes**
- "Generate a new Apple Provisioning Profile?" → **Yes**

Build tugagach (~20-40 daqiqa) TestFlight'ga yuborish:

```bash
npx eas-cli submit --platform ios --profile production --latest
```

### App Store Connect API kaliti (parolsiz avtomatlashtirish)

Kalit yaratilgan: `credentials/AuthKey_22GXNUDC8B.p8` (gitignore'da, repo **ochiq**
bo'lgani uchun kalit ID'lari ham `eas.json`ga yozilmaydi).

`eas submit` kalitni `eas.json`dan yoki EAS serveridan kutadi. Repo ochiq bo'lgani
uchun to'g'ri yechim — kalitni **bir marta EAS serveriga yuklash**:

```bash
npx eas-cli credentials --platform ios
```
→ `production` → **App Store Connect: Manage your API Key** → **Set up your project
with an existing API Key** → `.p8` yo'lini, Key ID va Issuer ID ni kiriting.

Shundan keyin `eas submit` hech qanday qo'shimcha sozlamasiz ishlaydi.

> Vaqtinchalik muqobil: `eas.json` → `submit.production.ios` ga `ascApiKeyPath`,
> `ascApiKeyId`, `ascApiKeyIssuerId` qo'shish — lekin **commit qilmang**.

---

## Android (Google Play)

1. [Google Play Console](https://play.google.com/console) → **Setup → API access** →
   Google Cloud'da **Service Account** yarating va unga Play Console'da ruxsat bering
   (Release manager).
2. Service account uchun **JSON key** yuklab oling.
3. Uni shu papkaga joylashtiring (gitignore qilingan, commit qilinmaydi):
   ```
   apps/mobile/credentials/google-play-service-account.json
   ```
   `eas.json` allaqachon shu yo'lga (`serviceAccountKeyPath`) ishora qiladi.
4. `track` hozir `internal` (ichki test). Keyin `production` ga o'zgartiring.

Yuborish:
```bash
eas submit --platform android --profile production
```

> Birinchi marta Android'da ilova Play Console'da qo'lda yaratilishi va birinchi AAB
> qo'lda yuklanishi kerak bo'lishi mumkin (Google talabi).

---

## Sentry (crash-reporting) — ixtiyoriy, keyin qo'shiladi

> Sentry native paketi production Android build'ni `SENTRY_AUTH_TOKEN`siz Gradle
> bosqichida yiqitgani uchun **hozircha olib tashlandi**. `ErrorBoundary` baribir
> ishlaydi (crash bo'lsa oq ekran o'rniga fallback). Ulanish nuqtasi `lib/sentry.ts`
> da NO-OP holatda tayyor turibdi — hisob ochilgach quyidagicha yoqasiz:

1. [sentry.io](https://sentry.io) da **React Native** loyihasi yarating → **DSN** ni nusxalang.
2. Paketni qaytaring:
   ```bash
   npx expo install @sentry/react-native
   ```
3. `app.json` → `plugins` ga `"@sentry/react-native"` qo'shing.
4. `eas.json` → `build.production.env` ga `EXPO_PUBLIC_SENTRY_DSN` qo'shing:
   ```json
   "env": {
     "EXPO_PUBLIC_API_URL": "https://libos-api.vercel.app/api",
     "EXPO_PUBLIC_SENTRY_DSN": "https://xxxx@oyyy.ingest.sentry.io/zzz"
   }
   ```
5. **Muhim:** source-map yuklash uchun `SENTRY_AUTH_TOKEN` ni EAS secret sifatida bering
   (aks holda Gradle yana yiqiladi):
   ```bash
   eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value <token>
   ```
6. `lib/sentry.ts` dagi `initSentry` / `captureException` funksiyalarini
   `Sentry.init(...)` / `Sentry.captureException(...)` bilan to'ldiring
   (fayl ichida namuna izohlar bor).

---

## Build → Submit tartibi

```bash
# 1) Production build (birinchi build EAS'da versiyani initsializatsiya qiladi)
eas build --platform all --profile production

# 2) Store'larga yuborish
eas submit --platform ios --profile production
eas submit --platform android --profile production
```
