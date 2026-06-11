'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, Phone, MapPin, Send, Clock, Truck, CheckCircle2 } from 'lucide-react'
import { fetchSettings, updateSettings, StoreSettings, defaultSettings } from '@/lib/asma/settings'
import { Button } from '@/components/asma/ui/button'
import { Input } from '@/components/asma/ui/input'

const fields: { key: keyof StoreSettings; label: string; placeholder: string; icon: typeof Phone }[] = [
  { key: 'phone', label: 'Telefon raqami', placeholder: '+998 90 123 45 67', icon: Phone },
  { key: 'address', label: 'Manzil', placeholder: "Qo'qon shahri, ... ko'chasi, ...-uy", icon: MapPin },
  { key: 'telegram', label: 'Telegram (havola)', placeholder: 'https://t.me/...', icon: Send },
  { key: 'instagram', label: 'Instagram (havola)', placeholder: 'https://instagram.com/...', icon: Send },
  { key: 'workingHours', label: 'Ish vaqti', placeholder: 'Har kuni: 09:00 - 21:00', icon: Clock },
  { key: 'deliveryText', label: 'Yetkazib berish matni', placeholder: 'Yetkazib berish haqida...', icon: Truck },
]

export default function AdminSettingsPage() {
  const [form, setForm] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
      .then(setForm)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof StoreSettings, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await updateSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
      setError("Saqlashda xatolik. 'settings' jadvali yaratilganini tekshiring.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Yuklanmoqda...</span>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">Sozlamalar</h1>
        <p className="text-muted-foreground">
          Do&apos;kon aloqa ma&apos;lumotlari va yetkazib berish matni
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded p-6 space-y-5"
      >
        {fields.map(({ key, label, placeholder, icon: Icon }) => (
          <div key={key}>
            <label className="flex items-center gap-2 text-sm text-foreground mb-2">
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </label>
            {key === 'deliveryText' ? (
              <textarea
                rows={2}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            ) : (
              <Input
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="bg-background border-border"
              />
            )}
          </div>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Saqlash
              </>
            )}
          </Button>
          {saved && (
            <span className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle2 className="w-4 h-4" /> Saqlandi
            </span>
          )}
        </div>
      </motion.div>
    </div>
  )
}



