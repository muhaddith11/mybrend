'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Upload, Edit2, Trash2, GripVertical, Eye, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/boosner/utils'

const lookbookItems = [
  {
    id: '1',
    title: 'Jentlmen uslubi',
    season: 'Kuz/Qish 2026',
    image: '/lookbook/look-1.jpg',
    published: true,
  },
  {
    id: '2',
    title: 'Shahar elegantligi',
    season: 'Kuz/Qish 2026',
    image: '/lookbook/look-2.jpg',
    published: true,
  },
  {
    id: '3',
    title: 'Kechki nafosatlilik',
    season: 'Kuz/Qish 2026',
    image: '/lookbook/look-3.jpg',
    published: true,
  },
  {
    id: '4',
    title: 'Qulay hashamat',
    season: 'Kuz/Qish 2026',
    image: '/lookbook/look-4.jpg',
    published: false,
  },
]

export default function AdminLookbookPage() {
  const [items, setItems] = useState(lookbookItems)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const togglePublished = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, published: !item.published } : item
      )
    )
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-foreground mb-2">
            Lookbook
          </h1>
          <p className="text-muted-foreground">
            Tayyor obrazlar galeriyasini boshqaring
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi obraz
        </Button>
      </div>

      {/* Lookbook Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative bg-card border border-border rounded overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  className="p-2 bg-card rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 bg-card rounded-full text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => togglePublished(item.id)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-colors',
                    item.published
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Eye className="w-3 h-3" />
                  {item.published ? 'Faol' : 'Nofaol'}
                </button>
              </div>

              {/* Drag Handle */}
              <div className="absolute top-2 left-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5 text-foreground/50" />
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-serif text-foreground mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.season}</p>
            </div>
          </motion.div>
        ))}

        {/* Add New Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: items.length * 0.05 }}
          onClick={() => setIsAddModalOpen(true)}
          className="aspect-[3/4] border-2 border-dashed border-border rounded flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Upload className="w-8 h-8" />
          <span className="text-sm">Yangi obraz qo&apos;shish</span>
        </motion.button>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-serif text-foreground">Yangi obraz qo&apos;shish</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-foreground mb-2">
                  Rasm
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Rasmni shu yerga tashlang yoki tanlang
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG (max. 5MB)
                  </p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-foreground mb-2">
                  Sarlavha
                </label>
                <Input
                  placeholder="Masalan: Jentlmen uslubi"
                  className="bg-card border-border"
                />
              </div>

              {/* Season */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-foreground mb-2">
                  Mavsum
                </label>
                <Input
                  placeholder="Masalan: Kuz/Qish 2026"
                  className="bg-card border-border"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-foreground mb-2">
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  placeholder="Obraz haqida qisqacha..."
                  rows={3}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Saqlash
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}


