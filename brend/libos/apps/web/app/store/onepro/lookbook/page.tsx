'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/onepro/ui/button'
import { fetchProducts } from '@/lib/onepro/products'
import { Product, formatPrice, useStore } from '@/lib/onepro/store'

const lookbookItems = [
  {
    id: '1',
    title: 'Jentlmen uslubi',
    season: 'Kuz/Qish 2026',
    description: 'Klassik elegantlik zamonaviy uslub bilan uyg\'unlashgan. Qora kostyum va oq ko\'ylak — abadiy klassika.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1067&fit=crop&q=80',
    categories: ['suits', 'shirts'],
  },
  {
    id: '2',
    title: 'Shahar elegantligi',
    season: 'Kuz/Qish 2026',
    description: 'Shahar hayoti uchun mo\'ljallangan zamonaviy kostyumlar. Ofisdan restoranga — bir kiyim.',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=1067&fit=crop&q=80',
    categories: ['suits', 'accessories'],
  },
  {
    id: '3',
    title: 'Kechki nafosatlilik',
    season: 'Kuz/Qish 2026',
    description: 'Maxsus tadbirlar uchun premium kiyimlar. To\'y va bayramlar uchun mukammal tanlim.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1067&fit=crop&q=80',
    categories: ['suits', 'shoes'],
  },
  {
    id: '4',
    title: 'Qulay hashamat',
    season: 'Kuz/Qish 2026',
    description: 'Kundalik qulaylik va yuqori uslub. Paltolar va trikotaj — kuz mavsumi uchun.',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&h=1067&fit=crop&q=80',
    categories: ['coats', 'knitwear'],
  },
  {
    id: '5',
    title: 'Biznes elita',
    season: 'Kuz/Qish 2026',
    description: 'Ofis uchun professional va zamonaviy ko\'rinish. Ishbilarmon erkak tasviri.',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1067&fit=crop&q=80',
    categories: ['suits', 'shirts', 'shoes'],
  },
  {
    id: '6',
    title: 'Dam olish kuni',
    season: 'Kuz/Qish 2026',
    description: 'Dam olish kunlari uchun qulay va elegant. Smart-casual uslubda erkin harakat.',
    image: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&h=1067&fit=crop&q=80',
    categories: ['knitwear', 'coats', 'accessories'],
  },
]

type LookItem = typeof lookbookItems[0]

function ProductMiniCard({ product }: { product: Product }) {
  const { addToCart } = useStore()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ product, quantity: 1, size: product.sizes[0] ?? '', color: product.colors[0] ?? '' })
    toast.success('Savatga qo\'shildi', { description: product.nameUz })
  }

  return (
    <Link
      href={`/store/onepro/product/${product.id}`}
      className="group flex items-center gap-3 p-3 rounded bg-background/50 hover:bg-background/80 transition-colors border border-border/50"
    >
      <div className="relative w-14 h-14 rounded overflow-hidden shrink-0 bg-muted">
        <Image
          src={product.images[0] || '/asma/placeholder.jpg'}
          alt={product.nameUz}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-serif text-foreground group-hover:text-primary transition-colors truncate">
          {product.nameUz}
        </p>
        <p className="text-xs text-primary mt-0.5">{formatPrice(product.price)}</p>
      </div>
      <button
        onClick={handleAdd}
        className="p-2 text-muted-foreground hover:text-primary transition-colors shrink-0"
        aria-label="Savatga qo'shish"
      >
        <ShoppingBag className="w-4 h-4" />
      </button>
    </Link>
  )
}

export default function LookbookPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedLook, setSelectedLook] = useState<LookItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {})
  }, [])

  // Look'lar uchun haqiqiy mahsulotlarni indeks bo'yicha taqsimlaymiz.
  // (DB kategoriya slug'lari look'larning qattiq kodlangan nomlariga mos
  // kelmagani uchun avval hech narsa ko'rsatilmas edi.)
  const getLookProducts = (lookIndex: number): Product[] => {
    if (products.length === 0) return []
    const count = Math.min(3, products.length)
    const start = (lookIndex * 2) % products.length
    const out: Product[] = []
    const seen = new Set<string>()
    for (let i = 0; i < products.length && out.length < count; i++) {
      const p = products[(start + i) % products.length]
      if (!seen.has(p.id)) { seen.add(p.id); out.push(p) }
    }
    return out
  }

  const openLightbox = (item: LookItem, index: number) => {
    setSelectedLook(item)
    setCurrentIndex(index)
  }

  const closeLightbox = () => setSelectedLook(null)

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? lookbookItems.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setSelectedLook(lookbookItems[newIndex])
  }

  const goToNext = () => {
    const newIndex = currentIndex === lookbookItems.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    setSelectedLook(lookbookItems[newIndex])
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Page Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
            Kuz/Qish 2026
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-wider text-foreground mt-4 mb-6">
            Lookbook
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Yangi mavsumning eng yaxshi obrazlarini kashf eting. Har bir look'ni bosib unga mos mahsulotlarni ko'ring.
          </p>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {lookbookItems.map((item, index) => {
            const lookProds = getLookProducts(index)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div
                  onClick={() => openLightbox(item, index)}
                  className="group relative aspect-[3/4] bg-muted cursor-pointer overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content on hover */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs tracking-wider text-primary uppercase mb-1">
                      {item.season}
                    </span>
                    <h3 className="text-lg font-serif text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                    {lookProds.length > 0 && (
                      <div className="flex items-center gap-2">
                        {lookProds.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="relative w-8 h-8 rounded-full overflow-hidden border border-border bg-muted"
                          >
                            <Image
                              src={p.images[0] || '/asma/placeholder.jpg'}
                              alt={p.nameUz}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {lookProds.length} ta mahsulot
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Number Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-sm font-serif text-primary">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-6">
            Lookbook dagi barcha mahsulotlarni do&apos;konimizda toping
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/store/onepro/collection" className="inline-flex items-center gap-2">
              Kolleksiyani ko&apos;rish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedLook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="fixed top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Yopish"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={goToPrevious}
              className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 bg-card/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors z-10"
              aria-label="Oldingi obraz"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 bg-card/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors z-10"
              aria-label="Keyingi obraz"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="min-h-screen flex items-start justify-center py-12 px-4 lg:px-16">
              <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Image */}
                <motion.div
                  key={selectedLook.id + '-img'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative aspect-[3/4] bg-muted sticky top-8"
                >
                  <Image
                    src={selectedLook.image}
                    alt={selectedLook.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Info + Products */}
                <motion.div
                  key={selectedLook.id + '-info'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="pt-4 lg:pt-0"
                >
                  <span className="text-xs tracking-[0.4em] text-primary font-sans uppercase">
                    {selectedLook.season}
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-serif font-light text-foreground mt-4 mb-4">
                    {selectedLook.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {selectedLook.description}
                  </p>

                  {/* Products in this look */}
                  {(() => {
                    const lookProds = getLookProducts(currentIndex)
                    return lookProds.length > 0 ? (
                      <div>
                        <h3 className="text-xs tracking-[0.3em] uppercase text-foreground mb-4">
                          Bu look'dagi mahsulotlar
                        </h3>
                        <div className="space-y-2">
                          {lookProds.map((product) => (
                            <ProductMiniCard key={product.id} product={product} />
                          ))}
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {currentIndex + 1} / {lookbookItems.length}
                          </span>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link href="/store/onepro/collection" onClick={closeLightbox}>
                              Barcha mahsulotlar →
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                          Mahsulotlar yuklanmoqda...
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/store/onepro/collection" onClick={closeLightbox}>
                            Kolleksiyani ko&apos;rish
                          </Link>
                        </Button>
                      </div>
                    )
                  })()}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



