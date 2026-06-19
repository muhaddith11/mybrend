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
