const { withAppBuildGradle } = require('expo/config-plugins')

// Nima uchun bu plugin kerak
// ─────────────────────────
// app.json dagi `locales` iOS ruxsat oynalarining matnlarini uch tilda saqlaydi
// (NSPhotoLibraryUsageDescription, NSCameraUsageDescription). SDK 57 dan boshlab
// Expo'ning `@expo/config-plugins/android/Locales` plugini bu fayllarni Android
// resurslariga HAM yozadi: values-b+uz/, values-b+ru/, values-b+en/strings.xml.
//
// Android bu kalitlarni umuman ishlatmaydi (ruxsat matnlari iOS'ga xos), va ular
// standart lokalda (values/strings.xml) yo'q. Natijada `:app:lintVitalRelease`
// bosqichida lint 6 ta `ExtraTranslation` xatosi berib, release build'ni yiqitadi
// — 2026-08-24 dagi versionCode 18 build aynan shundan tushgan.
//
// `getLocales()` `config.locales` ni shartsiz o'qiydi, platforma bo'yicha ajratish
// imkoni yo'q; expo-build-properties'da ham lint sozlamasi yo'q. Shuning uchun
// tekshiruvni maqsadli o'chiramiz.
//
// Bu xavfsiz: ilovaning o'z tarjimalari JS tomonda (packages/shared/src/i18n.ts),
// Android string resurslarida hech qanday tarjima yo'q. Ya'ni ExtraTranslation
// tekshiruvi bu loyihada haqiqiy xatoni ushlay olmaydi.
//
// Faqat shu bitta tekshiruv o'chiriladi — qolgan lint qoidalari kuchda qoladi
// (`checkReleaseBuilds false` kabi ommaviy yechimdan farqi shu).

const LINT_BLOCK = [
  '    lint {',
  "        // iOS locale matnlari Android resurslariga tushadi — qarang plugins/withAndroidLintFix.js",
  "        disable 'ExtraTranslation'",
  '    }',
].join('\n')

module.exports = function withAndroidLintFix(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        'withAndroidLintFix: app/build.gradle groovy emas — plugin moslashtirilishi kerak',
      )
    }

    let contents = cfg.modResults.contents

    // Takroriy qo'shilmasin (prebuild bir necha marta ishlashi mumkin)
    if (contents.includes("disable 'ExtraTranslation'")) {
      return cfg
    }

    // `android {` blokining ochilishidan keyin joylashtiramiz
    const marker = /^android\s*\{[ \t]*$/m
    if (!marker.test(contents)) {
      throw new Error("withAndroidLintFix: app/build.gradle da 'android {' bloki topilmadi")
    }
    contents = contents.replace(marker, (m) => `${m}\n${LINT_BLOCK}\n`)

    cfg.modResults.contents = contents
    return cfg
  })
}
