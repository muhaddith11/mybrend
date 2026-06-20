// Public katalog route'larini (products, stores) DB'siz test qilish uchun
// minimal ilovalar va in-memory soxta prisma.
import Fastify from 'fastify'
import { errorHandler } from '../../src/errorHandler.js'
import productsRoutes from '../../src/routes/products.js'
import storesRoutes from '../../src/routes/stores.js'

type SeedProduct = {
  id: string
  name: string
  nameUz?: string
  description?: string
  price: number
  originalPrice?: number
  inStock?: boolean
  featured?: boolean
  storeId?: string
  categoryId?: string
}

// where.OR ichidan qidiruv matnini ajratib oladi (route name.contains yuboradi).
function extractSearch(where: any): string | undefined {
  const clause = where?.OR?.find((c: any) => c?.name?.contains !== undefined)
  return clause?.name?.contains
}

export function createProductsFakePrisma(seed: { products: SeedProduct[] }) {
  const products = seed.products.map((p) => ({ inStock: true, featured: false, ...p }))
  const enrich = (p: any) => ({ ...p, store: null, category: null })

  const prisma: any = {
    product: {
      async findMany({ where = {}, take }: any) {
        let list = products.slice()
        if (where.inStock !== undefined) list = list.filter((p) => p.inStock === where.inStock)
        if (where.storeId) list = list.filter((p) => p.storeId === where.storeId)
        if (where.categoryId) list = list.filter((p) => p.categoryId === where.categoryId)
        if (where.originalPrice?.gt !== undefined)
          list = list.filter((p) => (p.originalPrice ?? 0) > where.originalPrice.gt)
        const q = extractSearch(where)
        if (q) {
          const needle = q.toLowerCase()
          list = list.filter((p) =>
            [p.name, p.nameUz, p.description].some((v) => (v ?? '').toLowerCase().includes(needle))
          )
        }
        // featured-larni oldinga (route orderBy: featured desc)
        list.sort((a, b) => Number(b.featured) - Number(a.featured))
        if (take) list = list.slice(0, take)
        return list.map(enrich)
      },
      async findUnique({ where }: any) {
        const p = products.find((x) => x.id === where.id)
        return p ? enrich(p) : null
      },
    },
  }

  return { prisma, products }
}

export async function buildProductsTestApp(seed: { products: SeedProduct[] }) {
  const app = Fastify()
  const fake = createProductsFakePrisma(seed)
  app.decorate('prisma', fake.prisma)
  app.decorate('authenticate', async () => {})
  app.setErrorHandler(errorHandler)
  app.register(productsRoutes, { prefix: '/api/products' })
  await app.ready()
  return { app, fake }
}

type SeedStore = {
  id: string
  slug: string
  name: string
  city?: string
  genders?: string[]
  rating?: number
}

export function createStoresFakePrisma(seed: { stores: SeedStore[] }) {
  const stores = seed.stores.map((s) => ({ genders: [], rating: 0, city: null, ...s }))

  const filtered = (where: any = {}) => {
    let list = stores.slice()
    if (where.genders?.has) list = list.filter((s) => (s.genders ?? []).includes(where.genders.has))
    if (where.city?.equals) list = list.filter((s) => (s.city ?? '').toLowerCase() === where.city.equals.toLowerCase())
    if (where.name?.contains)
      list = list.filter((s) => s.name.toLowerCase().includes(where.name.contains.toLowerCase()))
    return list
  }

  const prisma: any = {
    store: {
      async findMany({ where, skip = 0, take }: any) {
        let list = filtered(where)
        if (take !== undefined) list = list.slice(skip, skip + take)
        return list.map((s) => ({ ...s, _count: { products: 0 } }))
      },
      async count({ where }: any) {
        return filtered(where).length
      },
      async findUnique({ where }: any) {
        const s = stores.find((x) => x.slug === where.slug)
        return s ? { ...s, products: [] } : null
      },
    },
    favoriteStore: {
      _items: [] as any[],
      async findUnique({ where }: any) {
        const { userId, storeId } = where.userId_storeId
        return this._items.find((f) => f.userId === userId && f.storeId === storeId) ?? null
      },
      async create({ data }: any) {
        this._items.push(data)
        return data
      },
      async delete({ where }: any) {
        const { userId, storeId } = where.userId_storeId
        this._items = this._items.filter((f) => !(f.userId === userId && f.storeId === storeId))
        return {}
      },
    },
  }

  return { prisma, stores }
}

export async function buildStoresTestApp(seed: { stores: SeedStore[] }) {
  const app = Fastify()
  const fake = createStoresFakePrisma(seed)
  app.decorate('prisma', fake.prisma)
  // favorite route auth talab qiladi — testda req.user'ni qo'lda to'ldiramiz
  app.decorate('authenticate', async (req: any) => {
    req.user = { userId: 'u1' }
  })
  app.setErrorHandler(errorHandler)
  app.register(storesRoutes, { prefix: '/api/stores' })
  await app.ready()
  return { app, fake }
}
