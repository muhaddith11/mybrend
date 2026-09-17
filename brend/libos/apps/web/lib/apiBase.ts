// Barcha do'kon API modullari uchun umumiy asos.
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/** Do'kon `slug`iga bog'liq admin token (`<slug>_admin_token`) va sarlavhalar. */
export function makeAdminAuth(slug: string) {
  const getAdminToken = (): string | null =>
    typeof window === 'undefined' ? null : localStorage.getItem(`${slug}_admin_token`)

  const adminHeaders = (): Record<string, string> => {
    const token = getAdminToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  return { getAdminToken, adminHeaders }
}

/**
 * Admin endpointlari uchun fetch o'rami. Token muddati tugab (JWT 12 soat) 401
 * qaytsa — tokenni tozalab login sahifasiga yo'naltiradi. Aks holda admin panel
 * "jim xato"da qolib ketardi (token localStorage'da bor, lekin yaroqsiz).
 *
 * DIQQAT: `redirectOn401=false` faqat ADMIN BO'LMAGAN kontekstlar uchun (masalan
 * ommaviy navbar logotipni shu endpoint orqali o'qiydi) — aks holda har qanday
 * mehmon (login qilmagan oddiy xaridor) shu sahifaga kirganda darhol admin
 * login'ga otilib ketardi (401 → global redirect). Bu haqiqiy production bug
 * edi — 2026-09-18 aniqlanib tuzatildi. Admin panelning o'z sahifalari doim
 * standart (true) bilan chaqirsin — sessiya tugaganda login'ga qaytishi kerak.
 */
export async function adminFetch(
  slug: string,
  path: string,
  init: RequestInit = {},
  redirectOn401 = true,
): Promise<Response> {
  const { adminHeaders } = makeAdminAuth(slug)
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...adminHeaders(), ...(init.headers as Record<string, string> | undefined) },
  })
  if (res.status === 401 && typeof window !== 'undefined' && redirectOn401) {
    localStorage.removeItem(`${slug}_admin_token`)
    window.location.href = `/store/${slug}/admin/login`
  }
  return res
}
