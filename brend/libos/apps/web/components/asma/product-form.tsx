'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, Save, ArrowLeft, ImagePlus, Loader2 } from 'lucide-react'
import { Product, categories } from '@/lib/asma/store'
import { createProduct, updateProduct } from '@/lib/asma/products'
import { uploadProductImage } from '@/lib/asma/upload'
import { Button } from '@/components/asma/ui/button'
import { Input } from '@/components/asma/ui/input'
import { cn } from '@/lib/asma/utils'
import Link from 'next/link'

type ProductFormData = Omit<Product, 'id'>

const defaultForm: ProductFormData = {
  sku: '',
  name: '',
  nameUz: '',
  price: 0,
  originalPrice: undefined,
  images: [],
  category: 'suits',
  sizes: [],
  colors: [],
  description: '',
  descriptionUz: '',
  inStock: true,
  featured: false,
  new: true,
}

const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '44', '46', '48', '50', '52', '54', '38', '39', '40', '41', '42', '43', '85', '90', '95', '100', '105']
const allColors = [
  { id: 'black', label: 'Qora', hex: '#1a1a1a' },
  { id: 'white', label: 'Oq', hex: '#f5f5f5' },
  { id: 'navy', label: 'To\'q ko\'k', hex: '#1a2744' },
  { id: 'charcoal', label: 'Kulrang-qora', hex: '#36454f' },
  { id: 'grey', label: 'Kulrang', hex: '#808080' },
  { id: 'brown', label: 'Jigarrang', hex: '#8b4513' },
  { id: 'camel', label: 'Tuyaqush', hex: '#c19a6b' },
  { id: 'lightblue', label: 'Och ko\'k', hex: '#add8e6' },
  { id: 'pink', label: 'Pushti', hex: '#ffc0cb' },
  { id: 'beige', label: 'Beige', hex: '#f5f5dc' },
  { id: 'red', label: 'Qizil', hex: '#c0392b' },
  { id: 'green', label: 'Yashil', hex: '#2e7d32' },
]

interface ProductFormProps {
  initialData?: Product
  mode: 'new' | 'edit'
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormData>(
    initialData ? { ...initialData } : defaultForm
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [customColor, setCustomColor] = useState('#7a5230')

  // Tanlangan, lekin tayyor ro'yxatda yo'q ranglar (qo'lda qo'shilgan hex ranglar)
  const customColors = form.colors.filter(
    (c) => !allColors.some((ac) => ac.id === c)
  )

  const addCustomColor = () => {
    const hex = customColor.toLowerCase()
    if (!form.colors.includes(hex)) {
      setForm((prev) => ({ ...prev, colors: [...prev.colors, hex] }))
    }
  }

  const set = (key: keyof ProductFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleSize = (size: string) => {
    set('sizes', form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size]
    )
  }

  const toggleColor = (colorId: string) => {
    set('colors', form.colors.includes(colorId)
      ? form.colors.filter((c) => c !== colorId)
      : [...form.colors, colorId]
    )
  }

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((f) => uploadProductImage(f)))
      setForm((prev) => ({ ...prev, images: [...prev.images.filter(Boolean), ...urls] }))
    } catch (err) {
      console.error(err)
      alert("Rasm yuklashda xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const cleanedImages = form.images.filter((img) => img.trim() !== '')
      const data = { ...form, images: cleanedImages.length ? cleanedImages : ['/asma/placeholder.jpg'] }

      if (mode === 'new') {
        await createProduct(data)
      } else if (initialData) {
        await updateProduct(initialData.id, data)
      }
      router.push('/store/asma/admin/products')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 lg:p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/store/asma/admin/products"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </Link>
        <h1 className="text-2xl lg:text-3xl font-serif text-foreground">
          {mode === 'new' ? 'Yangi mahsulot' : 'Mahsulotni tahrirlash'}
        </h1>
      </div>

      <div className="space-y-8">
        {/* Asosiy ma'lumotlar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded p-6 space-y-4"
        >
          <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-4">
            Asosiy ma&apos;lumotlar
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-foreground mb-2">
              Mahsulot kodi (SKU) <span className="text-destructive">*</span>
              <span className="ml-2 text-xs text-muted-foreground font-normal">— mijozga ko&apos;rinmaydi</span>
            </label>
            <Input
              required
              value={form.sku || ''}
              onChange={(e) => set('sku', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              placeholder="ASM-001"
              className="bg-background border-border font-mono tracking-wider"
            />
            <p className="text-xs text-muted-foreground mt-1">Faqat harflar, raqamlar va chiziqcha. Masalan: ASM-001, PALTO-05</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-2">
                Nomi (O&apos;zbekcha) <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={form.nameUz}
                onChange={(e) => set('nameUz', e.target.value)}
                placeholder="Klassik Jun Palto"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">
                Nomi (Inglizcha)
              </label>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Classic Wool Overcoat"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-2">
              Kategoriya <span className="text-destructive">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground focus:outline-none focus:border-primary"
            >
              {categories.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameUz}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-2">
                Narxi (so&apos;m) <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="number"
                min="0"
                value={form.price || ''}
                onChange={(e) => set('price', Number(e.target.value))}
                placeholder="2500000"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">
                Eski narxi (chegirma uchun, ixtiyoriy)
              </label>
              <Input
                type="number"
                min="0"
                value={form.originalPrice || ''}
                onChange={(e) =>
                  set('originalPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="3200000"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-2">
                Tavsif (O&apos;zbekcha)
              </label>
              <textarea
                rows={3}
                value={form.descriptionUz}
                onChange={(e) => set('descriptionUz', e.target.value)}
                placeholder="Mahsulot haqida..."
                className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">
                Tavsif (Inglizcha)
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Product description..."
                className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Rasmlar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded p-6"
        >
          <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-4">
            Rasmlar
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {form.images.filter(Boolean).map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded overflow-hidden border border-border group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-background/90 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Rasmni o'chirish"
                >
                  <X className="w-4 h-4" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] uppercase tracking-wider rounded">
                    Asosiy
                  </span>
                )}
              </div>
            ))}

            <label
              className={cn(
                'aspect-square rounded border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-muted-foreground',
                uploading
                  ? 'border-border opacity-60 cursor-wait'
                  : 'border-border hover:border-primary hover:text-primary'
              )}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-[11px] text-center px-1">Rasm qo&apos;shish</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Telefon yoki kompyuter galereyangizdan rasm tanlang. Birinchi rasm asosiy bo&apos;ladi.
          </p>
        </motion.div>

        {/* O'lchamlar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded p-6"
        >
          <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-4">
            O&apos;lchamlar
          </h2>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={cn(
                  'px-4 py-2 text-sm border rounded transition-colors',
                  form.sizes.includes(size)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary'
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {form.sizes.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Hech bo&apos;lmaganda bitta o&apos;lcham tanlang</p>
          )}
        </motion.div>

        {/* Ranglar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded p-6"
        >
          <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-4">
            Ranglar
          </h2>
          <div className="flex flex-wrap gap-3">
            {allColors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => toggleColor(color.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm border rounded transition-colors',
                  form.colors.includes(color.id)
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary'
                )}
              >
                <span
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: color.hex }}
                />
                {color.label}
              </button>
            ))}

            {/* Qo'lda qo'shilgan ranglar */}
            {customColors.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => toggleColor(hex)}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded transition-colors bg-primary/10 text-primary border-primary"
              >
                <span
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: hex }}
                />
                {hex}
                <X className="w-3.5 h-3.5 ml-1 opacity-60" />
              </button>
            ))}
          </div>

          {/* Yangi rang qo'shish */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            <label className="relative w-10 h-10 rounded-full overflow-hidden border border-border cursor-pointer shrink-0">
              <span
                className="absolute inset-0"
                style={{ backgroundColor: customColor }}
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Rang tanlash"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={addCustomColor}
              className="border-border"
            >
              Shu rangni qo&apos;shish
            </Button>
            <span className="text-xs text-muted-foreground">
              Ro&apos;yxatda yo&apos;q rang uchun shu yerdan tanlang
            </span>
          </div>
        </motion.div>

        {/* Sozlamalar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded p-6"
        >
          <h2 className="text-sm tracking-wider uppercase text-muted-foreground mb-4">
            Sozlamalar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'inStock', label: 'Mavjud (stokda bor)' },
              { key: 'featured', label: 'Tavsiya etilgan' },
              { key: 'new', label: 'Yangi mahsulot' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded hover:border-primary transition-colors"
              >
                <input
                  type="checkbox"
                  checked={form[key as keyof ProductFormData] as boolean}
                  onChange={(e) => set(key as keyof ProductFormData, e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Saqlash */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
          <Link
            href="/store/asma/admin/products"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Bekor qilish
          </Link>
        </div>
      </div>
    </form>
  )
}




