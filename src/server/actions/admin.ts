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
  const { error } = await admin
    .from('tenants')
    .update({ status })
    .eq('id', tenantId)

  if (error) return { error: 'Erro ao atualizar status.' }

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

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${tenantId}`)
  return { error: '', success: true }
}
