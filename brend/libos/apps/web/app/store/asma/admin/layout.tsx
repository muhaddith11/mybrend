'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Image, Settings, ArrowLeft, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/asma/utils'

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Bosh sahifa' },
  { href: '/admin/products', icon: Package, label: 'Mahsulotlar' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Buyurtmalar' },
  { href: '/admin/lookbook', icon: Image, label: 'Lookbook' },
  { href: '/admin/settings', icon: Settings, label: 'Sozlamalar' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle (desktop) */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={collapsed ? 'Menyuni ochish' : 'Menyuni yopish'}
            >
              {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Do&apos;konga qaytish</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif tracking-[0.2em] text-foreground">ASMA</span>
            <span className="text-[10px] tracking-wider text-primary font-sans uppercase">Admin</span>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar (desktop) */}
        <aside
          className={cn(
            'fixed left-0 top-16 bottom-0 bg-card border-r border-border hidden lg:block transition-all duration-300',
            collapsed ? 'w-20' : 'w-64'
          )}
        >
          <nav className="p-3">
            <ul className="space-y-1">
              {adminNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors',
                      collapsed && 'justify-center',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden z-40">
          <nav className="flex items-center justify-around py-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 min-w-[56px]',
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 min-w-0 pb-24 lg:pb-0 transition-all duration-300',
            collapsed ? 'lg:ml-20' : 'lg:ml-64'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

