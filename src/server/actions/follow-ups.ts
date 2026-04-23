'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const createFollowUpSchema = z.object({
  lead_id: z.string().uuid('Lead inválido'),
  title: z.string().min(2, 'Título muito curto'),
  channel: z.string().min(1, 'Canal obrigatório'),
  due_at: z.string().min(1, 'Data obrigatória'),
  notes: z.string().optional(),
})

export type FollowUpState = { error: string }

export async function createFollowUp(
  _state: FollowUpState,
  formData: FormData
): Promise<FollowUpState> {
  const raw = {
    lead_id: formData.get('lead_id'),
    title: formData.get('title'),
    channel: formData.get('channel'),
    due_at: formData.get('due_at'),
    notes: formData.get('notes') || undefined,
  }

  const parsed = createFollowUpSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase.from('follow_ups').insert({
    tenant_id: tenant.id,
    lead_id: parsed.data.lead_id,
    title: parsed.data.title,
    channel: parsed.data.channel,
    due_at: new Date(parsed.data.due_at).toISOString(),
    notes: parsed.data.notes || null,
  })

  if (error) {
    console.error('[createFollowUp]', error.code, error.message)
    return { error: 'Erro ao salvar follow-up. Tente novamente.' }
  }

  redirect('/app/follow-ups')
}

export async function completeFollowUp(followUpId: string) {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase
    .from('follow_ups')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', followUpId)
    .eq('tenant_id', tenant.id)

  revalidatePath('/app/follow-ups')
}

export async function cancelFollowUp(followUpId: string) {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase
    .from('follow_ups')
    .update({ status: 'canceled' })
    .eq('id', followUpId)
    .eq('tenant_id', tenant.id)

  revalidatePath('/app/follow-ups')
}
