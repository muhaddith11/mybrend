'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

function useAdminApi(path: string) {
  const [data, setData] = useState<any>(null)
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/login'); return }
    fetch(`${API}/admin${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => { localStorage.removeItem('admin_token'); router.push('/login') })
  }, [path])
  return data
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Kutilmoqda', CONFIRMED: 'Tasdiqlandi', PREPARING: 'Tayyorlanmoqda',
  DELIVERING: "Yo'lda", DELIVERED: 'Yetkazildi', CANCELLED: 'Bekor',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PREPARING: '#8b5cf6',
  DELIVERING: '#10b981', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
}

export default function DashboardPage() {
  const router = useRouter()
  const stats = useAdminApi('/stats')
  const store = useAdminApi('/store')
  const orders = useAdminApi('/orders')

  const handleStatusChange = async (orderId: string, status: string) => {
    const token = localStorage.getItem('admin_token')
    await fetch(`${API}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    window.location.reload()
  }

  const logout = () => { localStorage.removeItem('admin_token'); router.push('/login') }

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>L</div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Libos Admin</span>
        </div>
        <nav style={s.nav}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/products', label: 'Mahsulotlar', icon: '👔' },
            { href: '/orders', label: 'Buyurtmalar', icon: '📦' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={s.navItem}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <button style={s.logoutBtn} onClick={logout}>Chiqish</button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>{store?.name ?? '...'}</h1>
            <p style={s.pageSubtitle}>{store?.address}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ ...s.openBadge, background: store?.isOpen ? '#dcfce7' : '#fee2e2', color: store?.isOpen ? '#166534' : '#991b1b' }}>
              {store?.isOpen ? '● Ochiq' : '● Yopiq'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: 'Jami buyurtma', value: stats?.totalOrders ?? '—', color: '#534AB7' },
            { label: 'Kutilmoqda', value: stats?.pendingOrders ?? '—', color: '#f59e0b' },
            { label: 'Yetkazildi', value: stats?.deliveredOrders ?? '—', color: '#22c55e' },
            { label: 'Daromad', value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} so'm` : '—', color: '#10b981' },
            { label: 'Mahsulotlar', value: stats?.productCount ?? '—', color: '#8b5cf6' },
          ].map(card => (
            <div key={card.label} style={s.statCard}>
              <p style={s.statLabel}>{card.label}</p>
              <p style={{ ...s.statValue, color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* So'nggi buyurtmalar */}
        <div style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>So'nggi buyurtmalar</h2>
            <Link href="/orders" style={s.seeAll}>Barchasi →</Link>
          </div>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Mijoz</th>
                <th style={s.th}>Mahsulotlar</th>
                <th style={s.th}>Summa</th>
                <th style={s.th}>Holat</th>
                <th style={s.th}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).slice(0, 8).map((order: any) => (
                <tr key={order.id} style={s.tr}>
                  <td style={s.td}>{order.user?.phone}</td>
                  <td style={s.td}>{order.items.map((i: any) => i.product.name).join(', ').slice(0, 40)}...</td>
                  <td style={s.td}>{order.totalPrice.toLocaleString()} so'm</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td style={s.td}>
                    <select
                      style={s.select}
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders?.length && <p style={s.empty}>Hali buyurtma yo'q</p>}
        </div>
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '24px 0' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 24px', color: '#fff' },
  logoMark: { width: 34, height: 34, background: '#534AB7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', color: '#a0a0c0', textDecoration: 'none', fontSize: 14, borderRadius: 8, margin: '0 8px' },
  logoutBtn: { margin: '0 12px', padding: '10px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, padding: 28, overflow: 'auto' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 },
  pageSubtitle: { fontSize: 13, color: '#888', margin: '4px 0 0' },
  openBadge: { padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: '18px 16px', border: '0.5px solid #eee' },
  statLabel: { fontSize: 12, color: '#888', margin: '0 0 8px', fontWeight: 500 },
  statValue: { fontSize: 22, fontWeight: 700, margin: 0 },
  section: { background: '#fff', borderRadius: 16, padding: 20, border: '0.5px solid #eee' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 },
  seeAll: { fontSize: 13, color: '#534AB7', textDecoration: 'none' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#fafafa' },
  th: { padding: '10px 12px', textAlign: 'left' as const, fontSize: 12, color: '#888', fontWeight: 500, borderBottom: '1px solid #f0f0f0' },
  tr: { borderBottom: '1px solid #f8f8f8' },
  td: { padding: '12px', fontSize: 13, color: '#333', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  select: { padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, cursor: 'pointer', outline: 'none' },
  empty: { textAlign: 'center' as const, color: '#aaa', padding: 32, fontSize: 14 },
}
