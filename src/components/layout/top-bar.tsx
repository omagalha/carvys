import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { logout } from '@/server/actions/auth'

interface TopBarProps {
  tenantName: string
  userInitials: string
}

export function TopBar({ tenantName, userInitials }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-deep border-b border-surface">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green">
          <span className="font-display font-black text-void text-sm leading-none">C</span>
        </div>
        <span className="font-display font-bold text-white text-base leading-none">
          Car<span className="text-green">vys</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-body text-sm text-slate hidden sm:block truncate max-w-[160px]">
          {tenantName}
        </span>

        <Link
          href="/app/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-surface hover:border-green/50 transition-colors"
          title="Configurações"
        >
          <span className="font-display font-bold text-green text-xs">
            {userInitials}
          </span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate hover:text-white transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  )
}
