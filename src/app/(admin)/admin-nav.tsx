'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BarChart3, Lightbulb, MessageCircle } from 'lucide-react'

const items = [
  { href: '/admin',              label: 'Overview',    icon: LayoutDashboard, exact: true },
  { href: '/admin/clientes',     label: 'Clientes',    icon: Users },
  { href: '/admin/financeiro',   label: 'Financeiro',  icon: BarChart3 },
  { href: '/admin/whatsapp',     label: 'WhatsApp',    icon: MessageCircle },
  { href: '/admin/sugestoes',    label: 'Sugestões',   icon: Lightbulb },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-1.5 h-8 px-3 rounded-lg font-body text-xs transition-colors',
              active
                ? 'bg-alert/15 text-alert font-semibold'
                : 'text-slate hover:text-white hover:bg-surface',
            ].join(' ')}
          >
            <Icon size={14} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
