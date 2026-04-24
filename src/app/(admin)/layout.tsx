import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { logout } from '@/server/actions/auth'
import { LogOut } from 'lucide-react'
import { AdminNav } from './admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) redirect('/login')

  return (
    <div className="flex flex-col h-screen bg-void">
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-deep border-b border-surface">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 pr-2 border-r border-surface">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-alert/20 border border-alert/30">
              <span className="font-display font-black text-alert text-sm leading-none">C</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-white text-sm">Carvys</span>
              <span className="font-body text-[10px] text-alert">admin</span>
            </div>
          </div>

          <AdminNav />
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block font-body text-xs text-slate">{user.email}</span>
          <form action={logout}>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg font-body text-xs text-slate hover:text-alert hover:bg-alert/5 transition-colors border border-transparent hover:border-alert/20">
              <LogOut size={13} />
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
