import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/shared/logo'
import { logout } from '@/server/actions/auth'

const ADMIN_EMAIL = 'usecarvys@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/login')

  return (
    <div className="min-h-screen bg-void text-white">
      <header className="sticky top-0 z-10 border-b border-surface bg-void/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-body text-xs text-green bg-green/10 px-2 py-0.5 rounded-full font-semibold">
              Admin
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="font-body text-xs text-slate hover:text-white transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
