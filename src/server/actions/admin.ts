'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { sendOfficialPlatformWhatsApp } from '@/server/platform-whatsapp'

export type AdminActionState = { error: string; success?: boolean }

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) throw new Error('Sem permissão.')
}

export async function updateTenantStatus(
  tenantId: string,
  status: string
): Promise<AdminActionState> {
  try { await guardAdmin() } catch { return { error: 'Sem permissão.' } }

  const admin = createAdminClient()
  const update: Record<string, unknown> = { status }
  if (status === 'canceled') update.canceled_at = new Date().toISOString()
  else update.canceled_at = null

  const { error } = await admin.from('tenants').update(update).eq('id', tenantId)
  if (error) return { error: 'Erro ao atualizar status.' }

  const STATUS_LABEL: Record<string, string> = {
    trial: 'Trial', active: 'Ativo', past_due: 'Inadimplente', canceled: 'Cancelado',
  }
  await admin.from('tenant_events').insert({
    tenant_id: tenantId,
    type: 'status_changed',
    description: `Status alterado para ${STATUS_LABEL[status] ?? status}`,
  })

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${tenantId}`)
  return { error: '', success: true }
}

export async function updateTenantPlan(
  tenantId: string,
  plan_code: string
): Promise<AdminActionState> {
  try { await guardAdmin() } catch { return { error: 'Sem permissão.' } }

  const admin = createAdminClient()
  const { error } = await admin.from('tenants').update({ plan_code }).eq('id', tenantId)
  if (error) return { error: 'Erro ao atualizar plano.' }

  const PLAN_LABEL: Record<string, string> = {
    trial: 'Trial', starter: 'Starter', pro: 'Pro', elite: 'Elite',
  }
  await admin.from('tenant_events').insert({
    tenant_id: tenantId,
    type: 'plan_changed',
    description: `Plano alterado para ${PLAN_LABEL[plan_code] ?? plan_code}`,
  })

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${tenantId}`)
  return { error: '', success: true }
}

export async function extendTrial(tenantId: string): Promise<AdminActionState> {
  try { await guardAdmin() } catch { return { error: 'Sem permissão.' } }

  const admin = createAdminClient()
  const { data: tenant } = await admin
    .from('tenants').select('status, created_at').eq('id', tenantId).single()

  if (!tenant || tenant.status !== 'trial') return { error: 'Tenant não está em trial.' }

  const extended = new Date(tenant.created_at)
  extended.setDate(extended.getDate() + 7)

  await admin.from('tenants').update({ created_at: extended.toISOString() }).eq('id', tenantId)
  await admin.from('tenant_events').insert({
    tenant_id: tenantId,
    type: 'status_changed',
    description: 'Trial estendido por +7 dias pelo admin',
  })

  revalidatePath(`/admin/clientes/${tenantId}`)
  return { error: '', success: true }
}

export async function sendAdminWhatsApp(formData: FormData): Promise<AdminActionState> {
  try { await guardAdmin() } catch { return { error: 'Sem permissão.' } }

  const group    = formData.get('group') as string
  const tenantId = formData.get('tenant_id') as string | null
  const message  = (formData.get('message') as string)?.trim()

  if (!message) return { error: 'Mensagem não pode estar vazia.' }

  const admin = createAdminClient()
  const phones: string[] = []

  if (group === 'specific' && tenantId) {
    const { data: m } = await admin
      .from('tenant_memberships').select('user_id').eq('tenant_id', tenantId).eq('role', 'owner').single()
    if (m) {
      const { data: p } = await admin.from('profiles').select('phone').eq('id', m.user_id).single()
      if (p?.phone) phones.push(p.phone)
    }
  } else {
    const statusMap: Record<string, string> = { trial: 'trial', past_due: 'past_due', active: 'active' }
    const { data: tenants } = await admin
      .from('tenants').select('id').eq('status', statusMap[group] ?? 'trial')
    for (const t of tenants ?? []) {
      const { data: m } = await admin
        .from('tenant_memberships').select('user_id').eq('tenant_id', t.id).eq('role', 'owner').single()
      if (!m) continue
      const { data: p } = await admin.from('profiles').select('phone').eq('id', m.user_id).single()
      if (p?.phone) phones.push(p.phone)
    }
  }

  if (phones.length === 0) return { error: 'Nenhum destinatário encontrado.' }

  for (const phone of phones) {
    try { await sendOfficialPlatformWhatsApp(phone, message) } catch { /* continua */ }
  }

  return { error: '', success: true }
}
