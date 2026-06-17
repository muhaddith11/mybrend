'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'
import { fetchProducts } from '@/lib/onepro/products'
import { Product } from '@/lib/onepro/store'
import { ProductCard } from '@/components/onepro/product-card'
import { ONEPRO_CATEGORIES } from '@/components/onepro/navigation'

const BASE = '/store/onepro'

function Grid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

function Heading({ kicker, title, href }: { kicker: string; title: string; href?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="opb-eyebrow text-[var(--flame)]">{kicker}</p>
        <h2 className="mt-2 font-display text-4xl uppercase lg:text-6xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="opb-press hidden shrink-0 items-center gap-1 border-2 border-foreground bg-background px-4 py-2 text-sm font-bold uppercase opb-shadow sm:inline-flex">
          Hammasi <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

const HERO_MARQUEE = ['BEPUL YETKAZIB BERISH', 'ORIGINAL MAHSULOT', 'KAFOLAT', 'TEZ YETKAZISH', 'QULAY NARX']

export default function OneProHome() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}) }, [])

  const newItems = useMemo(() => products.filter((p) => p.new).slice(0, 8), [products])
  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 8), [products])
  const sale = useMemo(() => products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 8), [products])

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 border-foreground bg-foreground">
        <div className="container mx-auto px-4 lg:px-8 grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-0 lg:min-h-[80vh]">
          <div className="relative z-10 order-2 lg:order-1">
            <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="opb-eyebrow text-[var(--volt)]">
              One Pro Boutique — Erkaklar uchun
            </motion.p>
            <h1 className="mt-3 font-display uppercase text-background">
              {['STREET', 'STYLE', 'PRO'].map((word, i) => (
                <motion.span
                  key={word}
                  className="block text-6xl leading-[0.85] sm:text-7xl lg:text-8xl"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={i === 1 ? 'text-[var(--volt)]' : ''}>{word}</span>
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 max-w-md text-background/70">
              Klassikadan kundalik kiyimgacha — kuchli uslub, original sifat. Bugun buyurtma bering.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-wrap gap-3">
              <Link href={`${BASE}/collection`} className="opb-press inline-flex items-center gap-2 border-2 border-[var(--volt)] bg-[var(--volt)] px-8 py-4 font-bold uppercase tracking-wide text-foreground opb-shadow-volt">
                Xaridni boshlash <ArrowUpRight className="h-5 w-5" />
              </Link>
              <Link href={`${BASE}/collection?new=1`} className="opb-press inline-flex items-center gap-2 border-2 border-background px-8 py-4 font-bold uppercase tracking-wide text-background">
                Yangi kolleksiya
              </Link>
            </motion.div>
          </div>

          <motion.div className="relative order-1 lg:order-2 lg:h-[80vh]" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <div className="relative h-[44vh] overflow-hidden border-2 border-[var(--volt)] lg:absolute lg:inset-y-12 lg:right-0 lg:left-6 lg:h-auto">
              <img src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80" alt="One Pro" className="h-full w-full object-cover" />
            </div>
            <motion.div
              className="absolute -bottom-3 left-2 z-10 flex h-20 w-20 rotate-[-8deg] flex-col items-center justify-center border-2 border-foreground bg-[var(--flame)] text-center font-display text-white lg:bottom-6 lg:left-0 lg:h-28 lg:w-28"
              animate={{ rotate: [-8, 4, -8] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-2xl leading-none lg:text-4xl">SALE</span>
              <span className="text-[10px] lg:text-xs">-50% gacha</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee band */}
      <div className="border-b-2 border-foreground bg-[var(--volt)] py-2.5 opb-marquee-wrap">
        <div className="opb-marquee">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex">
              {HERO_MARQUEE.map((t, i) => (
                <span key={i} className="mx-5 text-sm font-bold uppercase tracking-wide text-foreground whitespace-nowrap">{t} <span className="text-[var(--flame)]">/</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 lg:px-8 py-14 lg:py-20">
        <Heading kicker="Kolleksiya" title="Kategoriyalar" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {ONEPRO_CATEGORIES.map((c) => (
            <Link key={c.id} href={`${BASE}/collection?category=${c.id}`} className="group relative block aspect-[4/5] overflow-hidden border-2 border-foreground transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:opb-shadow">
              <img src={c.image} alt={c.name} className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <span className="absolute bottom-3 left-3 font-display text-xl uppercase text-background">{c.name}</span>
              <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center bg-[var(--volt)] text-foreground opacity-0 transition-opacity group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW */}
      {newItems.length > 0 && (
        <section className="border-y-2 border-foreground bg-[var(--cream)] py-14 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <Heading kicker="Endigina keldi" title="Yangi" href={`${BASE}/collection?new=1`} />
            <Grid items={newItems} />
          </div>
        </section>
      )}

      {/* SALE */}
      {sale.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-14 lg:py-20">
          <Heading kicker="Maxsus narxlar" title="Chegirmalar" href={`${BASE}/collection?sale=1`} />
          <Grid items={sale} />
        </section>
      )}

      {/* PROMISE */}
      <section className="border-y-2 border-foreground bg-foreground py-12">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            { icon: Truck, t: 'Tez yetkazish', s: "O'zbekiston bo'ylab" },
            { icon: ShieldCheck, t: '100% original', s: 'Kafolat bilan' },
            { icon: RefreshCw, t: '3 kun qaytarish', s: 'Muammosiz' },
            { icon: Headphones, t: "Qo'llab-quvvatlash", s: '10:00 — 22:00' },
          ].map((v) => (
            <div key={v.t} className="flex items-start gap-3 text-background">
              <v.icon className="h-7 w-7 shrink-0 text-[var(--volt)]" />
              <div>
                <p className="font-bold uppercase">{v.t}</p>
                <p className="text-xs text-background/55">{v.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-14 lg:py-20">
          <Heading kicker="Eng ko'p sotilgan" title="Tanlangan" href={`${BASE}/collection`} />
          <Grid items={featured} />
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="relative overflow-hidden border-2 border-foreground bg-[var(--volt)] px-6 py-16 text-center opb-shadow-lg lg:py-24">
          <p className="opb-eyebrow text-foreground/60">One Pro Boutique</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-5xl uppercase leading-[0.9] lg:text-7xl">
            O&apos;zingga mos<br />uslubni top
          </h2>
          <Link href={`${BASE}/collection`} className="opb-press mt-8 inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-8 py-4 font-bold uppercase tracking-wide text-[var(--volt)] opb-shadow">
            Katalogni ko&apos;rish <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
