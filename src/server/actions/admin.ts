'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

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
  try {
    await guardAdmin()
  } catch {
    return { error: 'Sem permissão.' }
  }

  const admin = createAdminClient()
  const update: Record<string, unknown> = { status }
  if (status === 'canceled') update.canceled_at = new Date().toISOString()
  else update.canceled_at = null

  const { error } = await admin
    .from('tenants')
    .update(update)
    .eq('id', tenantId)

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
  try {
    await guardAdmin()
  } catch {
    return { error: 'Sem permissão.' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('tenants')
    .update({ plan_code })
    .eq('id', tenantId)

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
