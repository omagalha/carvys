'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type PublicLeadState = { error: string; success: boolean }

export async function createPublicLead(
  _state: PublicLeadState,
  formData: FormData
): Promise<PublicLeadState> {
  const tenantId = formData.get('tenant_id') as string
  const name     = (formData.get('name') as string)?.trim()
  const phone    = (formData.get('phone') as string)?.trim()
  const vehicleId = formData.get('vehicle_id') as string | null

  if (!tenantId) return { error: 'Dados inválidos.', success: false }
  if (!name)     return { error: 'Nome obrigatório.', success: false }
  if (!phone || phone.replace(/\D/g, '').length < 10)
    return { error: 'WhatsApp inválido.', success: false }

  const normalizedPhone = phone.replace(/\D/g, '')
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('leads')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('phone', normalizedPhone)
    .limit(1)
    .maybeSingle()

  if (existing) {
    if (vehicleId) {
      await admin.from('lead_events').insert({
        tenant_id:   tenantId,
        lead_id:     existing.id,
        type:        'note',
        description: 'Novo interesse via site',
      })
      await admin.from('leads')
        .update({ interest_vehicle_id: vehicleId, stage: 'new', updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    }
    return { error: '', success: true }
  }

  const { error } = await admin.from('leads').insert({
    tenant_id:           tenantId,
    name,
    phone:               normalizedPhone,
    stage:               'new',
    source:              'site',
    ...(vehicleId ? { interest_vehicle_id: vehicleId } : {}),
  })

  if (error) return { error: 'Erro ao registrar. Tente novamente.', success: false }

  return { error: '', success: true }
}
