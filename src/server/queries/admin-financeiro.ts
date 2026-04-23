import { createAdminClient } from '@/lib/supabase/admin'

const PLAN_PRICE: Record<string, number> = {
  starter: 97,
  pro: 147,
  elite: 297,
  trial: 0,
}

export type AdminFinancials = {
  mrr: number
  activeCount: number
  trialCount: number
  pastDueCount: number
  canceledCount: number
  newThisMonth: number
  churnThisMonth: number
  mrrByPlan: { plan: string; count: number; revenue: number }[]
  atRiskMrr: number
}

export type AtRiskTenant = {
  id: string
  name: string
  status: string
  phone: string | null
  lastSeen: string | null
  daysSinceLogin: number
}

export async function getAdminFinancials(): Promise<AdminFinancials> {
  const admin = createAdminClient()

  const { data: tenants } = await admin
    .from('tenants')
    .select('plan_code, status, created_at, canceled_at')

  if (!tenants) {
    return {
      mrr: 0, activeCount: 0, trialCount: 0, pastDueCount: 0,
      canceledCount: 0, newThisMonth: 0, churnThisMonth: 0,
      mrrByPlan: [], atRiskMrr: 0,
    }
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const active   = tenants.filter(t => t.status === 'active')
  const trial    = tenants.filter(t => t.status === 'trial')
  const pastDue  = tenants.filter(t => t.status === 'past_due')
  const canceled = tenants.filter(t => t.status === 'canceled')

  const newThisMonth   = tenants.filter(t => t.created_at >= monthStart).length
  const churnThisMonth = canceled.filter(t => t.canceled_at && t.canceled_at >= monthStart).length

  const mrr       = active.reduce((sum, t) => sum + (PLAN_PRICE[t.plan_code] ?? 0), 0)
  const atRiskMrr = pastDue.reduce((sum, t) => sum + (PLAN_PRICE[t.plan_code] ?? 0), 0)

  const mrrByPlan = ['starter', 'pro', 'elite'].map(plan => {
    const count = active.filter(t => t.plan_code === plan).length
    return { plan, count, revenue: count * (PLAN_PRICE[plan] ?? 0) }
  })

  return {
    mrr,
    activeCount: active.length,
    trialCount: trial.length,
    pastDueCount: pastDue.length,
    canceledCount: canceled.length,
    newThisMonth,
    churnThisMonth,
    mrrByPlan,
    atRiskMrr,
  }
}

export async function getAtRiskTenants(): Promise<AtRiskTenant[]> {
  const admin = createAdminClient()

  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name, status')
    .in('status', ['active', 'trial'])

  if (!tenants || tenants.length === 0) return []

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const results = await Promise.all(
    tenants.map(async (t) => {
      const { data: ownerMember } = await admin
        .from('tenant_memberships')
        .select('user_id')
        .eq('tenant_id', t.id)
        .eq('role', 'owner')
        .single()

      if (!ownerMember) return null

      const [{ data: authUser }, { data: profile }] = await Promise.all([
        admin.auth.admin.getUserById(ownerMember.user_id),
        admin.from('profiles').select('phone').eq('id', ownerMember.user_id).single(),
      ])

      const lastSeen = authUser?.user?.last_sign_in_at ?? null
      const isAtRisk = !lastSeen || new Date(lastSeen) < sevenDaysAgo

      if (!isAtRisk) return null

      const daysSinceLogin = lastSeen
        ? Math.floor((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      return {
        id: t.id,
        name: t.name,
        status: t.status,
        phone: profile?.phone ?? null,
        lastSeen,
        daysSinceLogin,
      }
    })
  )

  return results
    .filter((r): r is AtRiskTenant => r !== null)
    .sort((a, b) => b.daysSinceLogin - a.daysSinceLogin)
}
