'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendLeadNotification } from '@/lib/email'

export type PublicLeadState = { error: string; success: boolean }

export async function createPublicLead(
  _state: PublicLeadState,
  formData: FormData
): Promise<PublicLeadState> {
  const tenantId  = formData.get('tenant_id') as string
  const name      = (formData.get('name') as string)?.trim()
  const phone     = (formData.get('phone') as string)?.trim()
  const vehicleId = formData.get('vehicle_id') as string | null

  if (!tenantId) return { error: 'Dados inválidos.', success: false }
  if (!name)     return { error: 'Nome obrigatório.', success: false }
  if (!phone || phone.replace(/\D/g, '').length < 10)
    return { error: 'WhatsApp inválido.', success: false }

  const normalizedPhone = phone.replace(/\D/g, '')
  const admin = createAdminClient()

  // Busca dados do tenant para notificação
  const { data: tenant } = await admin
    .from('tenants')
    .select('name')
    .eq('id', tenantId)
    .single()

  // Busca nome do veículo se houver
  let vehicleName: string | null = null
  if (vehicleId) {
    const { data: vehicle } = await admin
      .from('vehicles')
      .select('brand, model, year_model')
      .eq('id', vehicleId)
      .single()
    if (vehicle) {
      vehicleName = `${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}`
    }
  }

  // Deduplicação por telefone
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
        description: `Novo interesse via site${vehicleName ? ': ' + vehicleName : ''}`,
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

  // Notifica donos da loja por e-mail
  if (tenant) {
    const { data: members } = await admin
      .from('tenant_memberships')
      .select('user_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .in('role', ['owner', 'admin'])

    if (members?.length) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .in('id', members.map(m => m.user_id))

      const { data: users } = await admin.auth.admin.listUsers()
      const ownerEmails = users.users
        .filter(u => profiles?.some(p => p.id === u.id) && u.email)
        .map(u => u.email!)

      await Promise.allSettled(
        ownerEmails.map(email =>
          sendLeadNotification({
            to: email,
            tenantName: tenant.name,
            leadName: name,
            leadPhone: normalizedPhone,
            vehicleName,
          })
        )
      )
    }
  }

  return { error: '', success: true }
}
