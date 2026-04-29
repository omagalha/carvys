import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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

  const pathname = (await headers()).get('x-pathname') ?? ''
  const tenantStatus = memberships[0].tenants.status
  if (
    (tenantStatus === 'past_due' || tenantStatus === 'canceled') &&
    pathname !== '/app/billing'
  ) {
    redirect('/app/billing')
  }

  const tenant = memberships[0].tenants
  const profile = user.user_metadata

  const initials = (profile?.full_name as string | undefined)
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? user.email?.[0].toUpperCase() ?? 'U'

  return (
    <div className="flex flex-col h-screen bg-void">
      <TopBar tenantName={tenant.name} userInitials={initials} tenantId={tenant.id} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar slug={tenant.slug} plan={tenant.plan_code} canViewFinancials={memberships[0].can_view_financials} />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      <BottomNav canViewFinancials={memberships[0].can_view_financials} />
    </div>
  )
}
