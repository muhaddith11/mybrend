// Yangi (v2) dizayn skrinshotlarini do'konlar uchun tayyorlaydi.
// - iOS status bar (soat / LTE / zaryad) ni fon rangi bilan tozalaydi
// - App Store va Google Play talab qiladigan o'lchamga keltiradi (buzilishsiz)
//
// ISHLATISH:
//   1) Telefondan olingan (1170x2532, iPhone 13 Pro) skrinshotlarni tartib bilan
//      app-store/screenshots/source-v2/  ichiga tashlang: 01-*.jpg, 02-*.jpg ...
//   2) node app-store/prepare-screenshots-v2.js
//   3) Natija:
//        screenshots/ready-v2/         -> 1242x2688  (App Store 6.5" + Google Play)
//        screenshots/ready-v2/native/  -> 1170x2532  (asl o'lchamdagi toza nusxa)
//
// NEGA "qirqib" emas, "bo'yab"? App Store aynan 1242x2688 (2.164:1) nisbatni talab
// qiladi. Status barni qirqsak nisbat buziladi va rasm cho'ziladi. Shuning uchun
// biz status bar tasmasini shu ekranning fon rangi bilan bo'yaymiz — soat/zaryad
// yo'qoladi, o'lcham va nisbat esa saqlanadi (natijada faqat toza bo'sh tepa qoladi).

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const APP_W = 1242 // App Store 6.5" (iPhone 11 Pro Max / XS Max)
const APP_H = 2688

// Status bar balandligi 1170x2532 uchun ~138px (gliflar ~99px da tugaydi,
// kontent 141px dan boshlanadi — 138 xavfsiz oraliq). Boshqa o'lchamga proporsional.
const SB_REF_H = 138
const SB_REF_TOTAL = 2532

const srcDir = path.join(__dirname, 'screenshots', 'source-v2')
const outDir = path.join(__dirname, 'screenshots', 'ready-v2')
const natDir = path.join(outDir, 'native')
fs.mkdirSync(natDir, { recursive: true })

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort()

if (files.length === 0) {
  console.log(`Rasm topilmadi. Skrinshotlarni shu papkaga tashlang:\n  ${srcDir}`)
  process.exit(0)
}

const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

// Markaz-tepa blokidan fon rangini o'rtacha hisoblaydi (u yerda doim toza fon bo'ladi).
const sampleBg = (data, W, C, H) => {
  const x0 = Math.round(W * 0.44)
  const x1 = Math.round(W * 0.56)
  const y0 = Math.round(H * 0.008)
  const y1 = Math.round(H * 0.028)
  let r = 0, g = 0, b = 0, n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * C
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++
    }
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
}

;(async () => {
  for (const file of files) {
    const src = path.join(srcDir, file)
    const meta = await sharp(src).metadata()

    if (meta.width > meta.height) {
      console.log(`SKIP  ${file} — gorizontal (${meta.width}x${meta.height})`)
      continue
    }

    const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true })
    const W = info.width, H = info.height, C = info.channels

    const sbH = Math.round((H * SB_REF_H) / SB_REF_TOTAL)
    const [br, bg, bb] = sampleBg(data, W, C, H)

    // Status bar tasmasi uchun bir rangli plomba (fon rangida).
    const bar = Buffer.alloc(W * sbH * 3)
    for (let p = 0; p < W * sbH; p++) {
      bar[p * 3] = br; bar[p * 3 + 1] = bg; bar[p * 3 + 2] = bb
    }
    const barPng = await sharp(bar, { raw: { width: W, height: sbH, channels: 3 } }).png().toBuffer()

    // Toza (status barsiz) native nusxa.
    const cleanBuf = await sharp(src)
      .composite([{ input: barPng, top: 0, left: 0 }])
      .png()
      .toBuffer()

    const base = path.parse(file).name

    await sharp(cleanBuf).png().toFile(path.join(natDir, `${base}.png`))
    await sharp(cleanBuf)
      .resize(APP_W, APP_H, { fit: 'fill' }) // nisbat bir xil -> bir tekis kattalashtirish
      .flatten({ background: '#f7f6fc' })
      .png()
      .toFile(path.join(outDir, `${base}.png`))

    console.log(`OK    ${file}  bg=${hex(br, bg, bb)}  sbH=${sbH}px  -> ${APP_W}x${APP_H}`)
  }

  console.log(`\nTayyor fayllar:\n  ${outDir}          (App Store + Google Play, 1242x2688)`)
  console.log(`  ${natDir}   (native 1170x2532)`)
})().catch((e) => {
  console.error('Xato:', e.message)
  process.exit(1)
})
