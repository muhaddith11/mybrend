import { supabase } from './supabase'

export interface StoreSettings {
  phone: string
  address: string
  telegram: string
  instagram: string
  workingHours: string
  deliveryText: string
}

export const defaultSettings: StoreSettings = {
  phone: '',
  address: '',
  telegram: '',
  instagram: '',
  workingHours: 'Har kuni: 09:00 - 21:00',
  deliveryText: "Qo'qon shahri bo'ylab 2 soat ichida bepul yetkazib beramiz",
}

type DBSettings = {
  phone: string | null
  address: string | null
  telegram: string | null
  instagram: string | null
  working_hours: string | null
  delivery_text: string | null
}

export async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (error || !data) return defaultSettings
  const row = data as DBSettings
  return {
    phone: row.phone ?? '',
    address: row.address ?? '',
    telegram: row.telegram ?? '',
    instagram: row.instagram ?? '',
    workingHours: row.working_hours ?? defaultSettings.workingHours,
    deliveryText: row.delivery_text ?? defaultSettings.deliveryText,
  }
}

export async function updateSettings(s: StoreSettings): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({
      phone: s.phone,
      address: s.address,
      telegram: s.telegram,
      instagram: s.instagram,
      working_hours: s.workingHours,
      delivery_text: s.deliveryText,
    })
    .eq('id', 1)
  if (error) throw error
}

