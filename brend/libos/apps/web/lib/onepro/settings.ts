const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('onepro_admin_token')
}

export interface StoreSettings {
  phone: string
  address: string
  telegram: string
  instagram: string
  workingHours: string
  deliveryText: string
  logo: string
  banner: string
}

export const defaultSettings: StoreSettings = {
  phone: '',
  address: '',
  telegram: '',
  instagram: '',
  workingHours: 'Har kuni: 09:00 - 21:00',
  deliveryText: "Qo'qon shahri bo'ylab 2 soat ichida bepul yetkazib beramiz",
  logo: '',
  banner: '',
}

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${API}/stores/onepro`)
    if (!res.ok) return defaultSettings
    const store = await res.json()
    return {
      phone: store.phone ?? '',
      address: store.address ?? '',
      telegram: store.telegramChatId ?? '',
      instagram: store.instagram ?? '',
      workingHours: store.workingHours ?? defaultSettings.workingHours,
      deliveryText: store.deliveryText ?? defaultSettings.deliveryText,
      logo: store.logo ?? '',
      banner: store.banner ?? '',
    }
  } catch {
    return defaultSettings
  }
}

export async function updateSettings(s: StoreSettings): Promise<void> {
  const token = getAdminToken()
  const res = await fetch(`${API}/admin/store`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({
      phone: s.phone,
      address: s.address,
      telegramChatId: s.telegram,
      instagram: s.instagram,
      workingHours: s.workingHours,
      deliveryText: s.deliveryText,
      logo: s.logo,
      banner: s.banner,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Settings update failed')
  }
}
