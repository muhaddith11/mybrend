# Store'ga chiqarish (EAS Submit) — sozlash qo'llanmasi

`eas.json` → `submit.production` ichida to'ldirilishi kerak bo'lgan maydonlar bor.
Quyidagi qadamlardan so'ng `eas submit` ishlaydi.

---

## iOS (App Store Connect)

`eas.json` dagi `submit.production.ios` maydonlarini to'ldiring:

| Maydon | Qayerdan olinadi |
|--------|------------------|
| `appleId` | Apple Developer akkaunt email (masalan `you@example.com`) |
| `ascAppId` | App Store Connect → Ilova → App Information → **Apple ID** (raqam, masalan `6501234567`) |
| `appleTeamId` | [developer.apple.com/account](https://developer.apple.com/account) → Membership → **Team ID** (10 belgi) |

> Ilova hali App Store Connect'da yaratilmagan bo'lsa, avval u yerda ilova yozuvini yarating
> (Bundle ID: `uz.zyff.app`).

Muqobil (tavsiya etiladi) — **App Store Connect API Key** orqali (parolsiz, avtomatlashtirishga qulay):
`appleId`/`ascAppId` o'rniga EAS credentials'ga API key qo'shing yoki `eas submit` interaktiv rejimida so'raganda kiriting.

Yuborish:
```bash
eas submit --platform ios --profile production
```

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
