import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { ReportsClient } from './reports-client'

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }

  const [leadsRes, salesRes, followUpsRes] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, phone, email, stage, source, expected_value, created_at, last_contact_at')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('sales')
      .select('id, sale_price, cost_price, sold_at, vehicles(brand, model, year_model), leads(name, phone)')
      .eq('tenant_id', tenant.id)
      .order('sold_at', { ascending: false }),
    supabase
      .from('follow_ups')
      .select('id, title, type, status, due_at, leads(name)')
      .eq('tenant_id', tenant.id)
      .order('due_at', { ascending: false }),
  ])

  return (
    <ReportsClient
      leads={leadsRes.data ?? []}
      sales={salesRes.data ?? []}
      followUps={followUpsRes.data ?? []}
    />
  )
}
