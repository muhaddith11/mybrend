'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Truck, CreditCard, RefreshCw, Headphones, ArrowRight } from 'lucide-react'
import { fetchProducts } from '@/lib/onepro/products'
import { Product } from '@/lib/onepro/store'
import { ProductCard } from '@/components/onepro/product-card'

const BASE = '/store/onepro'

const BRANDS = ['Premium sifat', 'Original mahsulot', 'Zamonaviy uslub', 'Tez yetkazib berish', 'Qulay narx', 'Kafolat']

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight uppercase">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-accent inline-flex items-center gap-1">
            Hammasi <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Grid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

export default function OneProHome() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {})
  }, [])

  const newItems = useMemo(() => [...products].sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0)).slice(0, 8), [products])
  const discounted = useMemo(() => products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 8), [products])
  const shirts = useMemo(() => products.filter((p) => p.category === 'onp-koylak').slice(0, 8), [products])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <section className="relative h-[55vh] min-h-[360px] overflow-hidden bg-foreground">
        <img
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&h=900&fit=crop&q=80"
          alt="One Pro kolleksiya"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="relative container mx-auto px-4 lg:px-8 h-full flex flex-col justify-center">
          <span className="text-white/80 text-xs tracking-[0.3em] uppercase mb-3">One Pro Butik</span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-xl leading-tight">
            Erkaklar uslubi
          </h1>
          <p className="text-white/80 mt-4 max-w-md">Zamonaviy va sifatli erkaklar kiyimlari — One Pro butigida.</p>
          <Link
            href={`${BASE}/collection`}
            className="mt-8 inline-flex w-fit items-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors"
          >
            Sotib olish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Brands strip */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center gap-6 lg:gap-10 overflow-x-auto scrollbar-none">
            {BRANDS.map((b) => (
              <span key={b} className="whitespace-nowrap text-sm lg:text-base font-bold tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* New collection */}
      {newItems.length > 0 && (
        <Section title="Yangi kolleksiya" href={`${BASE}/collection`}>
          <Grid items={newItems} />
        </Section>
      )}

      {/* Discounts */}
      {discounted.length > 0 && (
        <div className="bg-secondary/40">
          <Section title="Chegirmalar" href={`${BASE}/collection`}>
            <Grid items={discounted} />
          </Section>
        </div>
      )}

      {/* Shirts */}
      {shirts.length > 0 && (
        <Section title="Ko'ylaklar" href={`${BASE}/collection?category=onp-koylak`}>
          <Grid items={shirts} />
        </Section>
      )}

      {/* Value props */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, t: 'Bepul yetkazib berish', s: "O'zbekiston bo'ylab" },
            { icon: CreditCard, t: "Qulay to'lov", s: 'Naqd, karta, online' },
            { icon: RefreshCw, t: '3 kun ichida qaytarish', s: 'Muammosiz' },
            { icon: Headphones, t: 'Yordam xizmati', s: 'Har kuni 10:00-22:00' },
          ].map((v) => (
            <div key={v.t} className="flex items-start gap-3">
              <v.icon className="w-6 h-6 text-accent shrink-0" />
              <div>
                <p className="font-semibold text-sm">{v.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{v.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
