'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Save, Loader2, Phone, MapPin, Send, Clock, Truck, CheckCircle2, Upload, ImageIcon, X } from 'lucide-react'
import { fetchSettings, updateSettings, StoreSettings, defaultSettings } from '@/lib/asma/settings'
import { uploadImage } from '@/lib/asma/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ImageUploadField({ label, value, onChange, hint, aspect }: {
  label: string; value: string; onChange: (url: string) => void; hint: string; aspect: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr('')
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch {
      setErr('Yuklashda xatolik')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-foreground mb-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        {label}
      </label>
      <div className="flex items-start gap-4">
        <div className={`relative ${aspect} w-32 shrink-0 bg-background border border-border rounded overflow-hidden`}>
          {value ? (
            <>
              <Image src={value} alt={label} fill className="object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1 bg-background/80 rounded-full text-muted-foreground hover:text-destructive"
                aria-label="O'chirish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yuklanmoqda...</> : <><Upload className="w-4 h-4 mr-2" /> Rasm yuklash</>}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">{hint}</p>
          {err && <p className="text-xs text-destructive mt-1">{err}</p>}
        </div>
      </div>
    </div>
  )
}

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

        <div className="border-t border-border pt-5 space-y-5">
          <ImageUploadField
            label="Do'kon logosi"
            value={form.logo}
            onChange={(url) => set('logo', url)}
            hint="Navbarda ko'rinadi. Kvadrat/shaffof PNG tavsiya etiladi."
            aspect="aspect-square"
          />
          <ImageUploadField
            label="Asosiy rasm (Biz haqimizda / banner)"
            value={form.banner}
            onChange={(url) => set('banner', url)}
            hint="«Biz haqimizda» sahifasidagi katta rasm sifatida ishlatiladi."
            aspect="aspect-[4/3]"
          />
        </div>

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



