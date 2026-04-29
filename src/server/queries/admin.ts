import { createAdminClient } from '@/lib/supabase/admin'
import { whatsappInstanceName } from '@/server/whatsapp-instance'

export type AdminTenant = {
  id: string
  name: string
  slug: string
  plan_code: string
  status: string
  created_at: string
  asaas_customer_id: string | null
  owner: { full_name: string | null; phone: string | null; email: string | null; last_sign_in_at: string | null } | null
  member_count: number
  vehicle_count: number
  lead_count: number
  whatsapp_connected: boolean
}

export type Alerts = {
  trialsExpiringSoon: AdminTenant[]
  noWhatsApp: AdminTenant[]
  noVehicles: AdminTenant[]
  pastDue: AdminTenant[]
  activeInactive: AdminTenant[]
}

export type GlobalEvent = {
  id: string
  tenant_id: string
  tenant_name: string
  type: string
  description: string
  created_at: string
}

export type ActivationTenant = {
  id: string
  name: string
  slug: string
  created_at: string
  days_left: number
  owner_phone: string | null
  has_vehicle: boolean
  has_lead: boolean
  whatsapp_connected: boolean
}

export async function getAllTenants(): Promise<AdminTenant[]> {
  const admin = createAdminClient()

  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name, slug, plan_code, status, created_at, asaas_customer_id')
    .order('created_at', { ascending: false })

  if (!tenants) return []

  const enriched = await Promise.all(
    tenants.map(async (t) => {
      const instanceName = whatsappInstanceName(t.id)
      const [membersRes, vehiclesRes, leadsRes, waRes] = await Promise.all([
        admin.from('tenant_memberships').select('user_id, role').eq('tenant_id', t.id).eq('status', 'active'),
        admin.from('vehicles').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        admin.from('leads').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        admin.from('whatsapp_sessions').select('status, instance_name').eq('tenant_id', t.id).maybeSingle(),
      ])

      const ownerMember = membersRes.data?.find(m => m.role === 'owner')
      let owner = null

      if (ownerMember) {
        const [{ data: authUser }, { data: profile }] = await Promise.all([
          admin.auth.admin.getUserById(ownerMember.user_id),
          admin.from('profiles').select('full_name, phone').eq('id', ownerMember.user_id).single(),
        ])
        owner = {
          full_name: profile?.full_name ?? null,
          phone: profile?.phone ?? null,
          email: authUser?.user?.email ?? null,
          last_sign_in_at: authUser?.user?.last_sign_in_at ?? null,
        }
      }

      const whatsapp_connected =
        waRes.data?.status === 'connected' && waRes.data?.instance_name === instanceName

      return {
        ...t,
        asaas_customer_id: (t as { asaas_customer_id?: string | null }).asaas_customer_id ?? null,
        owner,
        member_count: membersRes.data?.length ?? 0,
        vehicle_count: vehiclesRes.count ?? 0,
        lead_count: leadsRes.count ?? 0,
        whatsapp_connected,
      }
    })
  )

  return enriched
}

export async function getTenantById(id: string): Promise<AdminTenant | null> {
  const all = await getAllTenants()
  return all.find(t => t.id === id) ?? null
}

export async function getRecentGlobalEvents(limit = 30): Promise<GlobalEvent[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('tenant_events')
    .select('id, tenant_id, type, description, created_at, tenants(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((e: {
    id: string; tenant_id: string; type: string; description: string; created_at: string
    tenants: { name: string } | { name: string }[] | null
  }) => ({
    id: e.id,
    tenant_id: e.tenant_id,
    tenant_name: Array.isArray(e.tenants) ? (e.tenants[0]?.name ?? '—') : (e.tenants?.name ?? '—'),
    type: e.type,
    description: e.description,
    created_at: e.created_at,
  }))
}

export async function getActivationRadar(): Promise<ActivationTenant[]> {
  const admin = createAdminClient()
  const now = Date.now()

  const { data: trials } = await admin
    .from('tenants')
    .select('id, name, slug, created_at')
    .eq('status', 'trial')
    .order('created_at', { ascending: true })

  if (!trials) return []

  const result = await Promise.all(
    trials.map(async (t) => {
      const instanceName = whatsappInstanceName(t.id)
      const expiresAt = new Date(t.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
      const days_left = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))

      const [vehiclesRes, leadsRes, waRes, memberRes] = await Promise.all([
        admin.from('vehicles').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        admin.from('leads').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        admin.from('whatsapp_sessions').select('status, instance_name').eq('tenant_id', t.id).maybeSingle(),
        admin.from('tenant_memberships').select('user_id').eq('tenant_id', t.id).eq('role', 'owner').single(),
      ])

      let owner_phone: string | null = null
      if (memberRes.data) {
        const { data: profile } = await admin
          .from('profiles').select('phone').eq('id', memberRes.data.user_id).single()
        owner_phone = profile?.phone ?? null
      }

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        created_at: t.created_at,
        days_left,
        owner_phone,
        has_vehicle: (vehiclesRes.count ?? 0) > 0,
        has_lead: (leadsRes.count ?? 0) > 0,
        whatsapp_connected:
          waRes.data?.status === 'connected' && waRes.data?.instance_name === instanceName,
      }
    })
  )

  return result
}

export async function getAlerts(): Promise<Alerts> {
  const all = await getAllTenants()
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  return {
    trialsExpiringSoon: all.filter(t => {
      if (t.status !== 'trial') return false
      const expiresAt = new Date(t.created_at).getTime() + 7 * dayMs
      return expiresAt - now <= dayMs
    }),
    noWhatsApp: all.filter(t =>
      ['trial', 'active'].includes(t.status) && !t.whatsapp_connected
    ),
    noVehicles: all.filter(t =>
      t.status === 'trial' && t.vehicle_count === 0
    ),
    pastDue: all.filter(t => t.status === 'past_due'),
    activeInactive: all.filter(t => {
      if (t.status !== 'active') return false
      const lastLogin = t.owner?.last_sign_in_at
      if (!lastLogin) return true
      return now - new Date(lastLogin).getTime() > 7 * dayMs
    }),
  }
}
