import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getLeads } from '@/server/queries/leads'
import { FollowUpForm } from './follow-up-form'

export default async function NovoFollowUpPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_id?: string }>
}) {
  const { lead_id } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const leads = await getLeads(tenant.id)

  return <FollowUpForm leads={leads} defaultLeadId={lead_id} />
}
