'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Truck, CreditCard, RefreshCw, Headphones, ChevronRight } from 'lucide-react'
import { fetchProducts } from '@/lib/boosner/products'
import { Product } from '@/lib/boosner/store'
import { ProductCard } from '@/components/boosner/product-card'

const BASE = '/store/boosner'

const BRANDS = ['Moncrief', 'On', 'Adidas', 'Calvin Klein', 'Columbia', 'New Balance', 'Tommy Hilfiger', 'Hugo Boss']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
      <h2 className="text-3xl lg:text-4xl font-light text-center mb-10 tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function Grid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

export default function BoosnerHome() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}) }, [])

  const newItems = useMemo(() => [...products].sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0)).slice(0, 8), [products])
  const discounted = useMemo(() => products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 8), [products])
  const sneakers = useMemo(() => products.filter((p) => p.category === 'bsn-krossovka').slice(0, 8), [products])
  const accessories = useMemo(() => products.filter((p) => p.category === 'bsn-aksessuar').slice(0, 8), [products])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner — light image, dark text left */}
      <section className="relative h-[58vh] min-h-[380px] overflow-hidden bg-secondary">
        <img
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&h=900&fit=crop&q=80"
          alt="Yangi kolleksiya"
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        <div className="relative container mx-auto px-4 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light text-foreground max-w-md leading-snug">
            Yangi qish kolleksiyalarimizni hoziroq xarid qiling!
          </h1>
          <Link
            href={`${BASE}/collection`}
            className="mt-8 inline-flex w-fit items-center gap-2 bg-foreground text-background font-semibold px-8 py-3.5 hover:bg-accent transition-colors"
          >
            Sotib olish <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Brands — bordered cards */}
      <Section title="Brendlar">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-border rounded-lg overflow-hidden">
          {BRANDS.slice(0, 4).map((b, i) => (
            <div key={b} className={`aspect-[4/3] grid place-items-center bg-card ${i > 0 ? 'border-l border-border' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''}`}>
              <span className="text-lg lg:text-xl font-bold tracking-wide text-foreground">{b}</span>
            </div>
          ))}
        </div>
      </Section>

      {newItems.length > 0 && <Section title="Yangi kolleksiya"><Grid items={newItems} /></Section>}

      {discounted.length > 0 && (
        <div className="bg-secondary/40"><Section title="Chegirmalar"><Grid items={discounted} /></Section></div>
      )}

      {sneakers.length > 0 && <Section title="Oyoq kiyimlar"><Grid items={sneakers} /></Section>}

      {accessories.length > 0 && (
        <div className="bg-secondary/40"><Section title="Aksessuarlar"><Grid items={accessories} /></Section></div>
      )}

      {/* Value props — bordered cards */}
      <section className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Truck, t: 'Bepul yetkazib berish', s: "Ortiqcha xarajatlarsiz buyurtmalarni rasmiylashtiring." },
            { icon: CreditCard, t: "Qulay to'lov usullari", s: 'Naqd, karta va xavfsiz online to\'lovlar.' },
            { icon: RefreshCw, t: '3 kun ichida qaytarish', s: 'Mos kelmasa, 3 kun ichida qaytarib bering.' },
            { icon: Headphones, t: 'Yordam xizmati', s: 'Har doim yordam berishga tayyormiz.' },
          ].map((v) => (
            <div key={v.t} className="border border-border rounded-lg p-6 text-center">
              <v.icon className="w-7 h-7 mx-auto mb-4 text-foreground" />
              <h3 className="font-semibold text-foreground mb-2">{v.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.s}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
