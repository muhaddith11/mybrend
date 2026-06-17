'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/onepro/product-card'
import { fetchProducts } from '@/lib/onepro/products'
import { Product, colorMap } from '@/lib/onepro/store'
import { ONEPRO_CATEGORIES } from '@/components/onepro/navigation'

type Sort = 'newest' | 'price-asc' | 'price-desc'

function SortSelect({ sort, setSort }: { sort: Sort; setSort: (s: Sort) => void }) {
  return (
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value as Sort)}
      className="border-2 border-foreground bg-background px-3 py-2 text-sm font-bold uppercase outline-none"
    >
      <option value="newest">Yangi</option>
      <option value="price-asc">Narx: arzon</option>
      <option value="price-desc">Narx: qimmat</option>
    </select>
  )
}

function CatalogInner() {
  const params = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}) }, [])

  const search = (params.get('search') || '').toLowerCase()
  const onlySale = params.get('sale') === '1'
  const onlyNew = params.get('new') === '1'

  const [category, setCategory] = useState(params.get('category') || '')
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => { setCategory(params.get('category') || '') }, [params])

  const allSizes = useMemo(() => Array.from(new Set(products.flatMap((p) => p.sizes))), [products])
  const allColors = useMemo(() => Array.from(new Set(products.flatMap((p) => p.colors))), [products])

  const filtered = useMemo(() => {
    let list = products.slice()
    if (category) list = list.filter((p) => p.category === category)
    if (onlySale) list = list.filter((p) => p.originalPrice && p.originalPrice > p.price)
    if (onlyNew) list = list.filter((p) => p.new)
    if (search) list = list.filter((p) => p.nameUz.toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search))
    if (sizes.length) list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)))
    if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c)))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else list.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0))
    return list
  }, [products, category, onlySale, onlyNew, search, sizes, colors, sort])

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])

  const title = onlySale ? 'CHEGIRMALAR' : onlyNew ? 'YANGI' : search ? `"${params.get('search')}"` : category ? (ONEPRO_CATEGORIES.find((c) => c.id === category)?.name.toUpperCase() ?? 'KATALOG') : 'BARCHA MAHSULOTLAR'

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 font-display text-lg uppercase">Kategoriya</h4>
        <div className="space-y-2 text-sm font-bold uppercase">
          <button onClick={() => setCategory('')} className={`block ${!category ? 'text-[var(--flame)]' : 'text-foreground/60 hover:text-foreground'}`}>Barchasi</button>
          {ONEPRO_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`block ${category === c.id ? 'text-[var(--flame)]' : 'text-foreground/60 hover:text-foreground'}`}>{c.name}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 font-display text-lg uppercase">O&apos;lcham</h4>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button key={s} onClick={() => toggle(sizes, setSizes, s)}
              className={`min-w-10 border-2 border-foreground px-2 py-1 text-xs font-bold ${sizes.includes(s) ? 'bg-foreground text-[var(--volt)]' : 'bg-background hover:bg-[var(--volt)]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 font-display text-lg uppercase">Rang</h4>
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => (
            <button key={c} onClick={() => toggle(colors, setColors, c)} title={c}
              className={`h-8 w-8 border-2 ${colors.includes(c) ? 'border-[var(--flame)]' : 'border-foreground'}`}
              style={{ backgroundColor: colorMap[c] ?? c }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-6 border-b-2 border-foreground pb-5">
        <h1 className="font-display text-5xl uppercase lg:text-7xl">{title}</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-wide text-foreground/50">{filtered.length} ta mahsulot</p>
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button onClick={() => setFiltersOpen(true)} className="opb-press inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 text-sm font-bold uppercase opb-shadow">
          <SlidersHorizontal className="h-4 w-4" /> Filtr
        </button>
        <SortSelect sort={sort} setSort={setSort} />
      </div>

      <div className="mt-5 flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">{FilterPanel}</aside>
        <div className="flex-1">
          <div className="mb-5 hidden justify-end lg:flex"><SortSelect sort={sort} setSort={setSort} /></div>
          {filtered.length === 0 ? (
            <div className="grid place-items-center border-2 border-dashed border-foreground py-24 text-center">
              <p className="font-bold uppercase tracking-wide text-foreground/50">Mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-xs overflow-y-auto border-l-2 border-foreground bg-background p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-2xl uppercase">Filtr</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1" aria-label="Yopish"><X className="h-6 w-6" /></button>
            </div>
            {FilterPanel}
            <button onClick={() => setFiltersOpen(false)} className="mt-8 w-full border-2 border-foreground bg-foreground py-3 text-sm font-bold uppercase text-[var(--volt)]">
              Ko&apos;rsatish ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 font-display text-3xl uppercase">Yuklanmoqda...</div>}>
      <CatalogInner />
    </Suspense>
  )
}
