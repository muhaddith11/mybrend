// iPhone screenshotlarini App Store talab qiladigan o'lchamga keltiradi.
//
// ISHLATISH:
//   1) Telefondan olingan screenshotlarni  app-store/screenshots/  papkasiga tashlang
//   2) node app-store/resize-screenshots.js
//   3) Tayyor fayllar  app-store/screenshots/ready/  ichida paydo bo'ladi
//
// iPhone 13 Pro (1170x2532) -> 1242x2688: nisbat farqi 0.09px, cho'zilish sezilmaydi.

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const TARGET_W = 1242
const TARGET_H = 2688

const srcDir = path.join(__dirname, 'screenshots')
const outDir = path.join(srcDir, 'ready')

fs.mkdirSync(outDir, { recursive: true })

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort()

if (files.length === 0) {
  console.log(`Rasm topilmadi. Screenshotlarni shu papkaga tashlang:\n  ${srcDir}`)
  process.exit(0)
}

;(async () => {
  for (const [i, file] of files.entries()) {
    const src = path.join(srcDir, file)
    const meta = await sharp(src).metadata()

    // Faqat vertikal (portret) rasmlar kerak — gorizontalini o'tkazib yuboramiz.
    if (meta.width > meta.height) {
      console.log(`SKIP  ${file} — gorizontal (${meta.width}x${meta.height})`)
      continue
    }

    const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}-${path.parse(file).name}.png`)

    await sharp(src)
      .resize(TARGET_W, TARGET_H, { fit: 'fill' }) // nisbat bir xil — 'fill' buzmaydi
      .flatten({ background: '#000000' }) // alfa kanalni olib tashlaymiz
      .png()
      .toFile(out)

    console.log(`OK    ${file}  ${meta.width}x${meta.height} -> ${TARGET_W}x${TARGET_H}`)
  }

  console.log(`\nTayyor fayllar: ${outDir}`)
})().catch((e) => {
  console.error('Xato:', e.message)
  process.exit(1)
})
