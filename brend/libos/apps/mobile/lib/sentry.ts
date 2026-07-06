// Crash-reporting uchun tayyor ulanish nuqtasi (hozircha NO-OP).
//
// Sentry native paketi (@sentry/react-native) production Android build'da
// SENTRY_AUTH_TOKEN'siz Gradle bosqichida yiqilgani uchun olib tashlandi.
// ErrorBoundary baribir ishlaydi (oq ekran o'rniga fallback + dev konsol).
//
// Sentry'ni yoqish uchun (hisob ochilgach):
//   1) npx expo install @sentry/react-native
//   2) app.json plugins ga "@sentry/react-native" qo'shing
//   3) eas.json build.production.env ga EXPO_PUBLIC_SENTRY_DSN qo'shing
//   4) SENTRY_AUTH_TOKEN ni EAS secret sifatida bering (source-map yuklash uchun)
//   5) quyidagi funksiyalarni Sentry.init / Sentry.captureException bilan to'ldiring
// Batafsil: SUBMIT_SETUP.md → "Sentry" bo'limi.

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

export const sentryEnabled = false

export function initSentry() {
  // Sentry native paketi qo'shilgach shu yerda Sentry.init({ dsn: DSN, ... }) chaqiriladi.
  void DSN
}

export function captureException(error: unknown) {
  // Sentry qo'shilgach: if (DSN) Sentry.captureException(error)
  void error
}
