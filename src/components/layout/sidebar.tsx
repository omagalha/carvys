'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Users, Bell, TrendingUp, Settings, ExternalLink } from 'lucide-react'

const BASE_NAV = [
  { href: '/app/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/vehicles',   label: 'Estoque',   icon: Car },
  { href: '/app/leads',      label: 'Leads',     icon: Users },
  { href: '/app/follow-ups', label: 'Tarefas',   icon: Bell },
]

const FINANCIAL_NAV = { href: '/app/financeiro', label: 'Financeiro', icon: TrendingUp }

const PLANS_WITH_SITE = ['trial', 'pro', 'elite']

interface Props {
  slug:               string
  plan:               string
  canViewFinancials:  boolean
}

export function Sidebar({ slug, plan, canViewFinancials }: Props) {
  const pathname = usePathname()
  const hasSite  = PLANS_WITH_SITE.includes(plan)
  const navItems = canViewFinancials ? [...BASE_NAV, FINANCIAL_NAV] : BASE_NAV

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-surface bg-deep h-full">

      {/* Nav principal */}
      <nav className="flex flex-col gap-1 p-3 pt-4 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
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

      {/* Fundo: link do site + config */}
      <div className="flex flex-col gap-1 p-3 border-t border-surface">
        {hasSite && (
          <a
            href={`/loja/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm text-slate hover:text-green hover:bg-green/5 transition-colors group"
          >
            <ExternalLink size={18} strokeWidth={1.75} className="group-hover:text-green" />
            Ir para o site
          </a>
        )}
        <Link
          href="/app/settings"
          className={[
            'flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-colors',
            pathname === '/app/settings'
              ? 'bg-green/10 text-green font-medium'
              : 'text-slate hover:text-white hover:bg-surface',
          ].join(' ')}
        >
          <Settings size={18} strokeWidth={pathname === '/app/settings' ? 2.5 : 1.75} />
          Config
        </Link>
      </div>
    </aside>
  )
}
