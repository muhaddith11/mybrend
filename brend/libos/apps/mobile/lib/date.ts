// Sanani formatlash.
//
// Ilgari `toLocaleDateString('uz-UZ')` ishlatilardi — ikki muammosi bor edi:
//  1. Locale qotib qolgan: interfeys ruscha/inglizcha bo'lsa ham o'zbekcha format.
//  2. Hermes'da `Intl` platformaga tayanadi va `uz-UZ` eski Android'larda umuman
//     resolve bo'lmaydi — natija qurilmadan qurilmaga farq qilardi.
//
// Shuning uchun locale'siz, qo'lda formatlaymiz. `dd.mm.yyyy` — O'zbekistonda
// standart va uchala tilda ham bir xil tushuniladi (mm/dd bilan chalkashmaydi).
export function formatDate(value: string | number | Date): string {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`
}
