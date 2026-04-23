import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { logout } from '@/server/actions/auth'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) redirect('/login')

  return (
    <div className="flex flex-col h-screen bg-void">
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-deep border-b border-surface">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-alert">
              <span className="font-display font-black text-white text-sm leading-none">C</span>
            </div>
            <span className="font-display font-bold text-white text-base">
              Carvys <span className="text-alert text-xs font-body font-normal">admin</span>
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className="flex items-center gap-1.5 h-8 px-3 rounded-lg font-body text-xs text-slate hover:text-white hover:bg-surface transition-colors">
              <LayoutDashboard size={14} />
              Overview
            </Link>
            <Link href="/admin/clientes" className="flex items-center gap-1.5 h-8 px-3 rounded-lg font-body text-xs text-slate hover:text-white hover:bg-surface transition-colors">
              <Users size={14} />
              Clientes
            </Link>
          </nav>
        </div>

        <form action={logout}>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg font-body text-xs text-slate hover:text-alert transition-colors">
            <LogOut size={14} />
            Sair
          </button>
        </form>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
