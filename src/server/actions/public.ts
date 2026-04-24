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

  const admin = createAdminClient()
  const { error } = await admin.from('leads').insert({
    tenant_id: tenantId,
    name,
    phone,
    stage: 'new',
    source: 'site',
    ...(vehicleId ? { interest_vehicle_id: vehicleId } : {}),
  })

  if (error) return { error: 'Erro ao registrar. Tente novamente.', success: false }

  return { error: '', success: true }
}
