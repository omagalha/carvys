import { createClient } from '@/lib/supabase/server'
import type { TenantRole, MembershipStatus, TenantStatus, BusinessType } from '@/types/database'

export type MembershipWithTenant = {
  role:               TenantRole
  status:             MembershipStatus
  can_view_financials: boolean
  tenants: {
    id: string
    name: string
    slug: string
    plan_code: string
    status: TenantStatus
    business_type: BusinessType
    whatsapp_phone: string | null
    contact_email:  string | null
    contact_phone:  string | null
    address:        string | null
    business_hours: string | null
  }
}

export async function getUserTenants(): Promise<MembershipWithTenant[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: memberships, error: membershipsError } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, role, status, can_view_financials')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipsError) {
    console.error(
      '[getUserTenants] membershipsError',
      membershipsError.code,
      membershipsError.message
    )
    return []
  }

  if (!memberships || memberships.length === 0) return []

  const tenantIds = memberships.map((membership) => membership.tenant_id)

  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, name, slug, plan_code, status, business_type, whatsapp_phone, contact_email, contact_phone, address, business_hours')
    .in('id', tenantIds)

  if (tenantsError) {
    console.error(
      '[getUserTenants] tenantsError',
      tenantsError.code,
      tenantsError.message
    )
    return []
  }

  return memberships
    .map((membership) => {
      const tenant = tenants?.find((item) => item.id === membership.tenant_id)
      if (!tenant) return null

      return {
        role:                membership.role,
        status:              membership.status,
        can_view_financials: membership.can_view_financials ?? false,
        tenants:             tenant,
      }
    })
    .filter((membership): membership is MembershipWithTenant => Boolean(membership))
}

export async function getActiveTenant(tenantId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()
  return data
}
