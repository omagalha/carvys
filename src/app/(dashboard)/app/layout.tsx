import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { TopBar } from '@/components/layout/top-bar'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = (memberships[0].tenants as { id: string; name: string; slug: string; status: string })
  const profile = user.user_metadata

  const initials = (profile?.full_name as string | undefined)
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? user.email?.[0].toUpperCase() ?? 'U'

  return (
    <div className="flex flex-col h-screen bg-void">
      <TopBar tenantName={tenant.name} userInitials={initials} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
