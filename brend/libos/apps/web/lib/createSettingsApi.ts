import { API, adminFetch } from './apiBase'

export interface StoreSettings {
  phone: string
  address: string
  telegram: string
  instagram: string
  workingHours: string
  deliveryText: string
  logo: string
  banner: string
  // Bot orqali o'tkazma (TRANSFER) to'lovi rekvizitlari
  cardNumber: string
  cardHolder: string
  paymentQr: string
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
  cardNumber: '',
  cardHolder: '',
  paymentQr: '',
}

/** Do'kon `slug`i uchun sozlamalar API funksiyalarini yaratadi. */
export function createSettingsApi(slug: string) {
  async function fetchSettings(): Promise<StoreSettings> {
    try {
      const res = await fetch(`${API}/stores/${slug}`)
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
        cardNumber: store.cardNumber ?? '',
        cardHolder: store.cardHolder ?? '',
        paymentQr: store.paymentQr ?? '',
      }
    } catch {
      return defaultSettings
    }
  }

  // Yetkazib berish/olib ketish imkoniyatlari (checkout tanlovini ko'rsatish uchun).
  // StoreSettings'dan alohida — u faqat matn maydonlari (admin formasi uchun).
  async function fetchDeliveryOptions(): Promise<{ hasDelivery: boolean; hasPickup: boolean }> {
    try {
      const res = await fetch(`${API}/stores/${slug}`)
      if (!res.ok) return { hasDelivery: true, hasPickup: false }
      const store = await res.json()
      return { hasDelivery: store.hasDelivery ?? true, hasPickup: store.hasPickup ?? false }
    } catch {
      return { hasDelivery: true, hasPickup: false }
    }
  }

  async function updateSettings(s: StoreSettings): Promise<void> {
    const res = await adminFetch(slug, '/admin/store', {
      method: 'PATCH',
      body: JSON.stringify({
        phone: s.phone,
        address: s.address,
        telegramChatId: s.telegram,
        instagram: s.instagram,
        workingHours: s.workingHours,
        deliveryText: s.deliveryText,
        logo: s.logo,
        banner: s.banner,
        cardNumber: s.cardNumber,
        cardHolder: s.cardHolder,
        paymentQr: s.paymentQr,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Settings update failed')
    }
  }

  return { fetchSettings, updateSettings, fetchDeliveryOptions }
}
