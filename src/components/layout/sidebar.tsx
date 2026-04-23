'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Users, Bell, TrendingUp, Settings } from 'lucide-react'

const items = [
  { href: '/app/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/app/vehicles',    label: 'Estoque',     icon: Car },
  { href: '/app/leads',       label: 'Leads',       icon: Users },
  { href: '/app/follow-ups',  label: 'Tarefas',     icon: Bell },
  { href: '/app/financeiro',  label: 'Financeiro',  icon: TrendingUp },
  { href: '/app/settings',    label: 'Config',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-surface bg-deep h-full">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-colors',
                active
                  ? 'bg-green/10 text-green font-medium'
                  : 'text-slate hover:text-white hover:bg-surface',
              ].join(' ')}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
