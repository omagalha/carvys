'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const STAGE_LABEL: Record<string, string> = {
  new:         'Novo',
  contacted:   'Contatado',
  negotiating: 'Negociando',
  won:         'Ganho',
  lost:        'Perdido',
}

const LOSS_LABEL: Record<string, string> = {
  price:       'Preço alto',
  competitor:  'Comprou na concorrência',
  no_response: 'Não respondeu mais',
  gave_up:     'Desistiu da compra',
  other:       'Outro motivo',
}

const createLeadSchema = z.object({
  name:                z.string().min(2, 'Nome muito curto'),
  phone:               z.string().min(8, 'Telefone inválido'),
  email:               z.string().email('E-mail inválido').optional().or(z.literal('')),
  source:              z.string().optional(),
  notes:               z.string().optional(),
  interest_vehicle_id: z.string().uuid().optional().or(z.literal('')),
})

export type LeadState = { error: string }

export async function createLead(
  _state: LeadState,
  formData: FormData
): Promise<LeadState> {
  const raw = {
    name:                formData.get('name'),
    phone:               formData.get('phone'),
    email:               formData.get('email') || '',
    source:              formData.get('source') || undefined,
    notes:               formData.get('notes') || undefined,
    interest_vehicle_id: formData.get('interest_vehicle_id') || '',
  }

  const parsed = createLeadSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants as { id: string }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      tenant_id:           tenant.id,
      name:                parsed.data.name,
      phone:               parsed.data.phone,
      email:               parsed.data.email || null,
      source:              parsed.data.source || null,
      notes:               parsed.data.notes || null,
      interest_vehicle_id: parsed.data.interest_vehicle_id || null,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('[createLead]', error?.code, error?.message)
    return { error: 'Erro ao salvar lead. Tente novamente.' }
  }

  await supabase.from('lead_events').insert({
    tenant_id:   tenant.id,
    lead_id:     lead.id,
    type:        'created',
    description: 'Lead criado',
  })

  redirect('/app/leads')
}

export async function updateLeadStage(leadId: string, stage: string) {
  return updateLeadStageWithReason(leadId, stage, null)
}

export async function updateLeadStageWithReason(
  leadId: string,
  stage: string,
  lossReason: string | null,
) {
  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  const patch: Record<string, unknown> = {
    stage,
    last_contact_at: new Date().toISOString(),
    loss_reason: stage === 'lost' ? lossReason : null,
  }

  await supabase
    .from('leads')
    .update(patch)
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)

  const stageLabel = STAGE_LABEL[stage] ?? stage
  const lossLabel  = lossReason ? ` · ${LOSS_LABEL[lossReason] ?? lossReason}` : ''
  const description = stage === 'lost'
    ? `Marcado como Perdido${lossLabel}`
    : stage === 'won'
    ? 'Negócio fechado 🎉'
    : `Movido para ${stageLabel}`

  await supabase.from('lead_events').insert({
    tenant_id:   tenant.id,
    lead_id:     leadId,
    type:        'stage_change',
    description,
  })

  revalidatePath(`/app/leads/${leadId}`)
  revalidatePath('/app/leads')
}

export async function updateLeadNotes(leadId: string, notes: string, hadNotesBefore: boolean) {
  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase
    .from('leads')
    .update({ notes })
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)

  await supabase.from('lead_events').insert({
    tenant_id:   tenant.id,
    lead_id:     leadId,
    type:        'note',
    description: hadNotesBefore ? 'Nota atualizada' : 'Nota adicionada',
  })

  revalidatePath(`/app/leads/${leadId}`)
}
