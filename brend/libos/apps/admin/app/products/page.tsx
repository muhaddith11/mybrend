'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

function authFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('admin_token')
  return fetch(`${API}/admin${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
  })
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', inStock: true, variants: '' })

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) { router.push('/login'); return }
    authFetch('/products').then(r => r.json()).then(setProducts)
    authFetch('/categories').then(r => r.json()).then(setCategories)
  }, [])

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', price: '', categoryId: categories[0]?.id ?? '', inStock: true, variants: '' }); setShowForm(true) }
  const openEdit = (p: any) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), categoryId: p.categoryId, inStock: p.inStock, variants: p.variants.map((v: any) => `${v.size ?? ''} ${v.color ?? ''} ${v.quantity}`).join('\n') })
    setShowForm(true)
  }

  const handleSave = async () => {
    const variants = form.variants.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.trim().split(/\s+/)
      return { size: parts[0] || undefined, color: parts[1] || undefined, quantity: Number(parts[2] ?? 0) }
    })
    const body = JSON.stringify({ name: form.name, description: form.description, price: Number(form.price), categoryId: form.categoryId, inStock: form.inStock, variants })
    const res = editing
      ? await authFetch(`/products/${editing.id}`, { method: 'PUT', body })
      : await authFetch('/products', { method: 'POST', body })
    if (res.ok) { setShowForm(false); authFetch('/products').then(r => r.json()).then(setProducts) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    await authFetch(`/products/${id}`, { method: 'DELETE' })
    setProducts(ps => ps.filter(p => p.id !== id))
  }

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}><div style={s.logoMark}>L</div><span style={{ color: '#fff', fontWeight: 600 }}>Libos Admin</span></div>
        <nav style={s.nav}>
          <Link href="/dashboard" style={s.navItem}>📊 Dashboard</Link>
          <Link href="/products" style={{ ...s.navItem, background: '#534AB7', color: '#fff' }}>👔 Mahsulotlar</Link>
          <Link href="/orders" style={s.navItem}>📦 Buyurtmalar</Link>
        </nav>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <h1 style={s.title}>Mahsulotlar ({products.length})</h1>
          <button style={s.addBtn} onClick={openNew}>+ Qo'shish</button>
        </div>

        {/* Modal */}
        {showForm && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <h2 style={s.modalTitle}>{editing ? 'Tahrirlash' : 'Yangi mahsulot'}</h2>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Nomi</label><input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div style={s.field}><label style={s.label}>Narxi (so'm)</label><input style={s.input} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}><label style={s.label}>Tavsif</label><textarea style={{ ...s.input, minHeight: 60 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div style={s.field}>
                  <label style={s.label}>Kategoriya</label>
                  <select style={s.input} value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.gender})</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Mavjud</label>
                  <select style={s.input} value={String(form.inStock)} onChange={e => setForm(f => ({ ...f, inStock: e.target.value === 'true' }))}>
                    <option value="true">Ha</option>
                    <option value="false">Yo'q</option>
                  </select>
                </div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                  <label style={s.label}>Variantlar (har qatorda: o'lcham rang miqdor)</label>
                  <textarea style={{ ...s.input, minHeight: 80, fontFamily: 'monospace' }} placeholder={'S Qora 10\nM Ko\'k 5\nL Bej 3'} value={form.variants} onChange={e => setForm(f => ({ ...f, variants: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Bekor</button>
                <button style={s.saveBtn} onClick={handleSave}>Saqlash</button>
              </div>
            </div>
          </div>
        )}

        {/* Jadval */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>{['Nomi', 'Narx', 'Kategoriya', 'Variantlar', 'Holat', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>{p.name}</td>
                  <td style={s.td}>{p.price.toLocaleString()} so'm</td>
                  <td style={s.td}>{p.category?.name}</td>
                  <td style={s.td}>{p.variants.length} ta</td>
                  <td style={s.td}><span style={{ color: p.inStock ? '#22c55e' : '#ef4444' }}>{p.inStock ? 'Mavjud' : 'Tugagan'}</span></td>
                  <td style={s.td}>
                    <button style={s.editBtn} onClick={() => openEdit(p)}>Tahrir</button>
                    <button style={s.deleteBtn} onClick={() => handleDelete(p.id)}>O'chir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && <p style={s.empty}>Mahsulot yo'q</p>}
        </div>
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '24px 0' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 24px' },
  logoMark: { width: 34, height: 34, background: '#534AB7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', color: '#a0a0c0', textDecoration: 'none', fontSize: 14, borderRadius: 8, margin: '0 8px' },
  main: { flex: 1, padding: 28 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, margin: 0, color: '#1a1a1a' },
  addBtn: { padding: '10px 20px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 },
  tableWrap: { background: '#fff', borderRadius: 16, border: '0.5px solid #eee', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left' as const, fontSize: 12, color: '#888', fontWeight: 500, borderBottom: '1px solid #f0f0f0', background: '#fafafa' },
  tr: { borderBottom: '1px solid #f8f8f8' },
  td: { padding: '13px 16px', fontSize: 13, color: '#333' },
  editBtn: { padding: '5px 12px', background: '#eef', color: '#534AB7', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 6, fontSize: 12 },
  deleteBtn: { padding: '5px 12px', background: '#fee', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  empty: { textAlign: 'center' as const, color: '#aaa', padding: 40 },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 20, padding: 28, width: 560, maxHeight: '90vh', overflowY: 'auto' as const },
  modalTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1a1a1a' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column' as const, gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: '#666' },
  input: { padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1a1a1a', resize: 'vertical' as const },
  cancelBtn: { padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  saveBtn: { padding: '10px 24px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
