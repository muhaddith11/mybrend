'use client'

import { useState, use, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Minus, Plus, Share2, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, X, View, Loader2, Send, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useStore, formatPrice, Product, colorMap } from '@/lib/asma/store'
import { fetchProducts } from '@/lib/asma/products'
import { fetchSettings } from '@/lib/asma/settings'
import { Button } from '@/components/asma/ui/button'
import { cn } from '@/lib/asma/utils'
import { ProductCard } from '@/components/asma/product-card'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showImageModal, setShowImageModal] = useState(false)
  const [show3DViewer, setShow3DViewer] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buyName, setBuyName] = useState('')
  const [buyPhone, setBuyPhone] = useState('+998 ')
  const [tg, setTg] = useState('')

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const inWishlist = isInWishlist(product?.id ?? '')

  useEffect(() => {
    setLoading(true)
    fetchProducts().then((all) => {
      const found = all.find((p) => p.id === id) ?? null
      setProduct(found)
      setRelatedProducts(
        found ? all.filter((p) => p.category === found.category && p.id !== id).slice(0, 4) : []
      )
      setLoading(false)
    })
    fetchSettings().then((s) => setTg(s.telegram || '')).catch(() => {})
  }, [id])

  const tgHref = tg ? (tg.startsWith('http') ? tg : `https://t.me/${tg.replace(/^@/, '')}`) : 'https://t.me/asmadesign'

  const submitBuy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyName.trim() || buyPhone.replace(/\D/g, '').length < 12) {
      toast.error('Ism va telefon raqamni to\'liq kiriting')
      return
    }
    setShowBuyModal(false)
    toast.success('Arizangiz qabul qilindi!', { description: 'Tez orada operator siz bilan bog\'lanadi.' })
    setBuyName(''); setBuyPhone('+998 ')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Yuklanmoqda...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <h1 className="text-2xl font-serif">Mahsulot topilmadi</h1>
        <Link href="/store/asma/collection" className="text-primary hover:underline mt-4 inline-block">
          Kolleksiyaga qaytish
        </Link>
      </div>
    )
  }

  // Razmer/rang faqat mavjud bo'lsa majburiy. Bo'lmasa ham qo'shsa bo'ladi.
  const needsSize = product.sizes.length > 0
  const needsColor = product.colors.length > 0
  const canAdd = product.inStock && (!needsSize || !!selectedSize) && (!needsColor || !!selectedColor)

  const handleAddToCart = () => {
    if (!canAdd) return
    addToCart({ product, quantity, size: selectedSize ?? '', color: selectedColor ?? '' })
    // Savatni ochmaymiz — faqat bildirishnoma
    toast.success('Savatga qo\'shildi', { description: `${product.nameUz} · ${quantity} dona` })
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/store/asma" className="hover:text-foreground transition-colors">Bosh sahifa</Link></li>
            <li>/</li>
            <li><Link href="/store/asma/collection" className="hover:text-foreground transition-colors">Kolleksiya</Link></li>
            <li>/</li>
            <li className="text-foreground">{product.nameUz}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              className="relative aspect-[3/4] bg-muted cursor-zoom-in overflow-hidden"
              onClick={() => setShowImageModal(true)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={product.images[selectedImage] || '/asma/placeholder.jpg'}
                alt={product.nameUz}
                fill
                className="object-cover"
                priority
              />

              {product.model3d && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShow3DViewer(true) }}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm text-foreground text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <View className="w-4 h-4" />
                  360° ko&apos;rish
                </button>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1)) }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Oldingi rasm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1)) }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Keyingi rasm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-24 shrink-0 overflow-hidden transition-all',
                      selectedImage === index ? 'ring-2 ring-primary' : 'ring-1 ring-border hover:ring-primary/50'
                    )}
                  >
                    <Image src={image} alt={`${product.nameUz} - ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6">
                {product.new && (
                  <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase mb-3">
                    Yangi
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-serif font-light text-foreground mb-2">{product.nameUz}</h1>
                <p className="text-muted-foreground mb-4">{product.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-primary font-medium">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">{product.descriptionUz}</p>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm tracking-wider uppercase">Rang</span>
                    {selectedColor && <span className="text-sm text-muted-foreground capitalize">{selectedColor}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all',
                          selectedColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: colorMap[color] || color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm tracking-wider uppercase">O&apos;lcham</span>
                    <button className="text-xs text-primary hover:underline">O&apos;lcham jadvali</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          'min-w-[48px] h-12 px-4 border text-sm tracking-wider transition-colors',
                          selectedSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <span className="text-sm tracking-wider uppercase block mb-3">Miqdor</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Miqdorni kamaytirish">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="p-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Miqdorni ko'paytirish">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {product.inStock ? (
                    <span className="text-sm text-green-500">Mavjud</span>
                  ) : (
                    <span className="text-sm text-destructive">Tugagan</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canAdd}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-sm tracking-wider uppercase"
                  >
                    Savatga qo&apos;shish
                  </Button>
                  <button
                    onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                    className={cn(
                      'w-14 h-14 border flex items-center justify-center transition-colors',
                      inWishlist ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    )}
                    aria-label="Istaklar ro'yxati"
                  >
                    <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
                  </button>
                </div>
                <button
                  onClick={() => setShowBuyModal(true)}
                  disabled={!product.inStock}
                  className="w-full bg-foreground text-background hover:opacity-90 transition-opacity h-14 text-sm tracking-wider uppercase disabled:opacity-50"
                >
                  Xarid qilish
                </button>
                <a
                  href={tgHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#229ED9] text-white hover:bg-[#1c8dc2] transition-colors h-14 text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Adminga yozish
                </a>
                <div className="flex items-center gap-6 pt-1">
                  <a href={tgHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" /> Savol bering
                  </a>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Ulashish">
                    <Share2 className="w-4 h-4" /> Ulashish
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="border-t border-border pt-8 space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium">Bepul yetkazib berish</span>
                    <p className="text-muted-foreground">Qo&apos;qon bo&apos;ylab 2 soatda</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium">14 kunlik qaytarish</span>
                    <p className="text-muted-foreground">Shartlar mavjud</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium">Sifat kafolati</span>
                    <p className="text-muted-foreground">100% asl mahsulot</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 lg:mt-32">
            <h2 className="text-2xl lg:text-3xl font-serif font-light text-center mb-12">
              O&apos;xshash mahsulotlar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <button onClick={() => setShowImageModal(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Yopish">
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-4xl aspect-[3/4] mx-4">
              <Image src={product.images[selectedImage] || '/asma/placeholder.jpg'} alt={product.nameUz} fill className="object-contain" />
            </div>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1)) }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-card/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1)) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-card/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Viewer Modal */}
      <AnimatePresence>
        {show3DViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <button onClick={() => setShow3DViewer(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Yopish">
              <X className="w-6 h-6" />
            </button>
            <div className="w-full max-w-4xl aspect-square mx-4 bg-card rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <View className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-serif mb-2">360° Ko&apos;rish</h3>
                <p className="text-muted-foreground text-sm">3D model viewer bu yerda ko&apos;rsatiladi.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy-now (Xarid qilish) modal */}
      <AnimatePresence>
        {showBuyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border rounded-lg p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Yopish">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-serif mb-5">Xarid qilish</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-16 h-16 bg-muted rounded overflow-hidden shrink-0">
                  <Image src={product.images[0] || '/asma/placeholder.jpg'} alt={product.nameUz} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{product.nameUz}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(product.price)} dan boshlab</p>
                  {(selectedColor || selectedSize) && (
                    <p className="text-xs text-muted-foreground mt-0.5">Variant: {[selectedColor, selectedSize].filter(Boolean).join(' / ')}</p>
                  )}
                </div>
              </div>
              <form onSubmit={submitBuy} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Ismingiz</label>
                  <input value={buyName} onChange={(e) => setBuyName(e.target.value)} placeholder="Ismingizni kiriting"
                    className="w-full h-12 px-4 bg-background border border-border rounded text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Telefon raqamingiz</label>
                  <input value={buyPhone} onChange={(e) => setBuyPhone(e.target.value)} type="tel" placeholder="+998"
                    className="w-full h-12 px-4 bg-background border border-border rounded text-foreground outline-none focus:border-primary" />
                </div>
                <button type="submit" className="w-full h-12 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors uppercase tracking-wider text-sm">
                  Ariza yuborish
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}




