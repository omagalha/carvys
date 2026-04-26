'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const updateLeadSchema = z.object({
  name:  z.string().min(2, 'Nome muito curto').max(120),
  phone: z.string().min(8, 'Telefone inválido').max(30),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
})

const wonSaleSchema = z.object({
  salePrice: z.number().positive('Valor deve ser maior que zero'),
  costPrice: z.number().nonnegative().nullable(),
  vehicleId: z.string().uuid().nullable(),
})

const VALID_CHANNELS = ['whatsapp', 'phone', 'email', 'visit', 'outro'] as const
const logContactSchema = z.object({
  channel: z.enum(VALID_CHANNELS),
  note:    z.string().max(500),
})

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
  expected_value:      z.coerce.number().nonnegative().optional(),
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
    expected_value:      formData.get('expected_value') || undefined,
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
      expected_value:      parsed.data.expected_value ?? null,
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

export async function registerWonSale(
  leadId: string,
  data: { salePrice: number; costPrice: number | null; vehicleId: string | null },
) {
  const parsed = wonSaleSchema.safeParse(data)
  if (!parsed.success) return

  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase.from('sales').insert({
    tenant_id:  tenant.id,
    lead_id:    leadId,
    vehicle_id: data.vehicleId,
    sale_price: data.salePrice,
    cost_price: data.costPrice,
    sold_at:    new Date().toISOString(),
  })

  if (data.vehicleId) {
    await supabase
      .from('vehicles')
      .update({ status: 'sold' })
      .eq('id', data.vehicleId)
      .eq('tenant_id', tenant.id)
  }

  await supabase
    .from('leads')
    .update({ stage: 'won', last_contact_at: new Date().toISOString(), loss_reason: null })
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)

  const priceFormatted = data.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  const profit = data.costPrice !== null ? data.salePrice - data.costPrice : null
  const profitNote = profit !== null
    ? ` · Lucro ${profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}`
    : ''

  await supabase.from('lead_events').insert({
    tenant_id:   tenant.id,
    lead_id:     leadId,
    type:        'stage_change',
    description: `Negócio fechado 🎉 · ${priceFormatted}${profitNote}`,
  })

  revalidatePath(`/app/leads/${leadId}`)
  revalidatePath('/app/leads')
  revalidatePath('/app/financeiro')
  revalidatePath('/app/vehicles')
}

export async function updateLead(
  leadId: string,
  data: { name: string; phone: string; email: string | null },
) {
  const parsed = updateLeadSchema.safeParse(data)
  if (!parsed.success) return

  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase
    .from('leads')
    .update({ name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null })
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)

  revalidatePath(`/app/leads/${leadId}`)
  revalidatePath('/app/leads')
}

export async function updateLeadVehicle(leadId: string, vehicleId: string | null) {
  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase
    .from('leads')
    .update({ interest_vehicle_id: vehicleId })
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)

  await supabase.from('lead_events').insert({
    tenant_id:   tenant.id,
    lead_id:     leadId,
    type:        'note',
    description: vehicleId ? 'Veículo de interesse atualizado' : 'Veículo de interesse removido',
  })

  revalidatePath(`/app/leads/${leadId}`)
}

const CONTACT_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone:    'Ligação',
  email:    'E-mail',
  visit:    'Visita',
  outro:    'Outro',
}

export async function logContact(leadId: string, data: { channel: string; note: string }) {
  const parsed = logContactSchema.safeParse(data)
  if (!parsed.success) return

  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  const { data: lead } = await supabase
    .from('leads')
    .select('stage')
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)
    .single()

  const advanceStage = lead?.stage === 'new'

  await supabase
    .from('leads')
    .update({
      last_contact_at: new Date().toISOString(),
      ...(advanceStage ? { stage: 'contacted' } : {}),
    })
    .eq('id', leadId)
    .eq('tenant_id', tenant.id)

  const label       = CONTACT_LABEL[data.channel] ?? data.channel
  const description = data.note.trim()
    ? `${label}: ${data.note.trim()}`
    : `Contato via ${label}`

  const events = [
    { tenant_id: tenant.id, lead_id: leadId, type: 'contact',      description },
    ...(advanceStage ? [{ tenant_id: tenant.id, lead_id: leadId, type: 'stage_change', description: 'Movido para Contatado' }] : []),
  ]

  await supabase.from('lead_events').insert(events)

  revalidatePath(`/app/leads/${leadId}`)
  revalidatePath('/app/leads')
}

export async function bulkUpdateLeadStage(leadIds: string[], stage: string) {
  if (!leadIds.length) return

  const supabase    = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return

  const tenant = memberships[0].tenants as { id: string }

  await supabase
    .from('leads')
    .update({ stage, last_contact_at: new Date().toISOString() })
    .in('id', leadIds)
    .eq('tenant_id', tenant.id)

  const label = STAGE_LABEL[stage] ?? stage
  const events = leadIds.map(lead_id => ({
    tenant_id:   tenant.id,
    lead_id,
    type:        'stage_change',
    description: `Movido para ${label} (em massa)`,
  }))
  await supabase.from('lead_events').insert(events)

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
