import { createAdminClient } from '@/lib/supabase/admin'

export type AdminTenant = {
  id: string
  name: string
  slug: string
  plan_code: string
  status: string
  created_at: string
  owner: { full_name: string | null; phone: string | null; email: string | null } | null
  member_count: number
  vehicle_count: number
  lead_count: number
}

export async function getAllTenants(): Promise<AdminTenant[]> {
  const admin = createAdminClient()

  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name, slug, plan_code, status, created_at')
    .order('created_at', { ascending: false })

  if (!tenants) return []

  const enriched = await Promise.all(
    tenants.map(async (t) => {
      const [membersRes, vehiclesRes, leadsRes] = await Promise.all([
        admin
          .from('tenant_memberships')
          .select('user_id, role')
          .eq('tenant_id', t.id)
          .eq('status', 'active'),
        admin
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', t.id),
        admin
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', t.id),
      ])

      const ownerMember = membersRes.data?.find(m => m.role === 'owner')
      let owner = null

      if (ownerMember) {
        const { data: authUser } = await admin.auth.admin.getUserById(ownerMember.user_id)
        const { data: profile } = await admin
          .from('profiles')
          .select('full_name, phone')
          .eq('id', ownerMember.user_id)
          .single()

        owner = {
          full_name: profile?.full_name ?? null,
          phone: profile?.phone ?? null,
          email: authUser?.user?.email ?? null,
        }
      }

      return {
        ...t,
        owner,
        member_count: membersRes.data?.length ?? 0,
        vehicle_count: vehiclesRes.count ?? 0,
        lead_count: leadsRes.count ?? 0,
      }
    })
  )

  return enriched
}

export async function getTenantById(id: string): Promise<AdminTenant | null> {
  const all = await getAllTenants()
  return all.find(t => t.id === id) ?? null
}
