import { z } from 'zod'

// VERCEL_ENV faqat haqiqiy Vercel production deploy'da 'production' bo'ladi.
// (NODE_ENV emas — `next build` uni lokalда ham 'production' qiladi va localhost tekshiruvini noto'g'ri yoqadi.)
const isVercelProd = process.env.VERCEL_ENV === 'production'

const schema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_API_URL o'rnatilmagan — backend manzili (masalan https://libos-api.vercel.app/api)"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
})

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

if (!parsed.success) {
  throw new Error(
    '❌ Web env sozlamalari xato:\n' +
      parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n'),
  )
}

// Production'da localhost = bugungi "jimgina buzilish" xatosi. Build'ni to'xtatamiz.
if (isVercelProd && /localhost|127\.0\.0\.1/.test(parsed.data.NEXT_PUBLIC_API_URL)) {
  throw new Error(
    "❌ Production'da NEXT_PUBLIC_API_URL localhost'ga ishora qilyapti!\n" +
      "Vercel → web loyihasi → Settings → Environment Variables → NEXT_PUBLIC_API_URL ni to'g'rilang.",
  )
}

export const env = parsed.data
