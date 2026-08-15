// App Store uchun tayyorlangan screenshotlarni Google Play talabiga moslaydi.
//
// Play qoidasi: uzun tomon qisqa tomondan 2 barobardan ko'p bo'lmasligi kerak.
// 1242x2688 = 2.16x -> RAD ETILADI. Shuning uchun yon tomonga fon qo'shamiz:
// 1512x2688 = aniq 9:16 (Google tavsiya qiladigan nisbat).
//
// ISHLATISH: node play-store/resize-screenshots.js

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const W = 1512
const H = 2688

// App Store uchun tanlangan tartib
const PICKS = [
  '02-IMG_4645.png',
  '03-IMG_4646.png',
  '07-IMG_4650.png',
  '04-IMG_4647.png',
  '06-IMG_4649.png',
  '08-IMG_4651.png',
  '10-IMG_4653.png',
]

const srcDir = path.join(__dirname, '..', 'app-store', 'screenshots', 'ready')
const outDir = path.join(__dirname, 'screenshots')

fs.mkdirSync(outDir, { recursive: true })

;(async () => {
  for (const [i, file] of PICKS.entries()) {
    const src = path.join(srcDir, file)
    if (!fs.existsSync(src)) {
      console.log(`YO'Q   ${file}`)
      continue
    }

    // Hoshiya rangini rasmning yuqori-chap burchagidan olamiz — bar tabiiy ko'rinsin
    const { data } = await sharp(src).extract({ left: 0, top: 0, width: 4, height: 4 }).raw().toBuffer({ resolveWithObject: true })
    const bg = { r: data[0], g: data[1], b: data[2] }

    const meta = await sharp(src).metadata()
    const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}-play.png`)

    await sharp({ create: { width: W, height: H, channels: 3, background: bg } })
      .composite([{ input: src, left: Math.round((W - meta.width) / 2), top: Math.round((H - meta.height) / 2) }])
      .flatten({ background: bg })
      .removeAlpha() // Play "24-bit PNG (no alpha)" talab qiladi
      .png({ palette: false })
      .toFile(out)

    console.log(`OK    ${file} -> ${path.basename(out)}  ${W}x${H}  hoshiya rgb(${bg.r},${bg.g},${bg.b})`)
  }
  console.log(`\nTayyor: ${outDir}`)
})().catch((e) => {
  console.error('XATO:', e.message)
  process.exit(1)
})
