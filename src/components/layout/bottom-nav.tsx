'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Users, Bell, TrendingUp } from 'lucide-react'

const items = [
  { href: '/app/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/app/vehicles',    label: 'Estoque',     icon: Car },
  { href: '/app/leads',       label: 'Leads',       icon: Users },
  { href: '/app/follow-ups',  label: 'Tarefas',     icon: Bell },
  { href: '/app/financeiro',  label: 'Financeiro',  icon: TrendingUp },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-deep border-t border-surface md:hidden">
      <div className="flex items-stretch h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <Icon
                size={20}
                className={active ? 'text-green' : 'text-slate'}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span
                className={[
                  'font-body text-[10px] leading-none',
                  active ? 'text-green font-medium' : 'text-slate',
                ].join(' ')}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
