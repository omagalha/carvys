import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getLeads } from '@/server/queries/leads'
import { PipelineClient } from './pipeline-client'
import { ContactsButton } from './contacts-button'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const leads  = await getLeads(tenant.id)

  return (
    <div className="flex flex-col h-full">
      <PipelineClient leads={leads} />
      <ContactsButton />
    </div>
  )
}
