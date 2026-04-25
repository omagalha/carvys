'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserTenants } from '@/server/queries/tenants'
import { getPlanLimits } from '@/lib/plans'
import { sendTeamInvite } from '@/lib/email'

const inviteSchema = z.object({
  email:               z.string().email('E-mail inválido'),
  role:                z.enum(['admin', 'sales']),
  can_view_financials: z.string().optional().transform(v => v === 'true'),
})

export type TeamState = { error: string; success?: boolean }

export async function inviteMember(
  _state: TeamState,
  formData: FormData
): Promise<TeamState> {
  const raw = {
    email:               formData.get('email'),
    role:                formData.get('role') ?? 'sales',
    can_view_financials: formData.get('can_view_financials') ?? 'false',
  }
  const parsed = inviteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants
  const limits = getPlanLimits(tenant.plan_code)
  const admin  = createAdminClient()

  const { count } = await admin
    .from('tenant_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)
    .eq('status', 'active')

  if ((count ?? 0) >= limits.maxMembers) {
    return {
      error: `Seu plano permite no máximo ${limits.maxMembers} usuário${limits.maxMembers > 1 ? 's' : ''}. Faça upgrade para adicionar mais funcionários.`,
    }
  }

  // Check if email already has a Carvys account
  const { data: { users } } = await admin.auth.admin.listUsers()
  const existingUser = users.find(u => u.email === parsed.data.email)

  if (existingUser) {
    const { data: alreadyMember } = await admin
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('user_id', existingUser.id)
      .maybeSingle()

    if (alreadyMember) return { error: 'Este usuário já faz parte da equipe.' }

    const { error } = await admin.from('tenant_memberships').insert({
      tenant_id:           tenant.id,
      user_id:             existingUser.id,
      role:                parsed.data.role,
      status:              'active',
      can_view_financials: parsed.data.can_view_financials,
    })
    if (error) {
      console.error('[inviteMember] direct add', error.message)
      return { error: 'Erro ao adicionar membro.' }
    }

    revalidatePath('/app/settings')
    return { error: '', success: true }
  }

  // No Carvys account yet — create invite and send email
  const { data: pending } = await admin
    .from('team_invites')
    .select('id')
    .eq('tenant_id', tenant.id)
    .eq('email', parsed.data.email)
    .is('accepted_at', null)
    .maybeSingle()

  if (pending) return { error: 'Já existe um convite pendente para este e-mail.' }

  const { data: invite, error: inviteError } = await admin
    .from('team_invites')
    .insert({
      tenant_id:           tenant.id,
      email:               parsed.data.email,
      role:                parsed.data.role,
      can_view_financials: parsed.data.can_view_financials,
    })
    .select('token')
    .single()

  if (inviteError || !invite) {
    console.error('[inviteMember] create invite', inviteError?.message)
    return { error: 'Erro ao criar convite.' }
  }

  await sendTeamInvite({ to: parsed.data.email, tenantName: tenant.name, token: invite.token })

  revalidatePath('/app/settings')
  return { error: '', success: true }
}

export async function removeMember(membershipId: string): Promise<TeamState> {
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Não autorizado.' }

  const tenantId = memberships[0].tenants.id
  const admin    = createAdminClient()

  const { data: membership } = await admin
    .from('tenant_memberships')
    .select('role')
    .eq('id', membershipId)
    .eq('tenant_id', tenantId)
    .single()

  if (!membership)              return { error: 'Membro não encontrado.' }
  if (membership.role === 'owner') return { error: 'Não é possível remover o dono da loja.' }

  const { error } = await admin
    .from('tenant_memberships')
    .update({ status: 'disabled' })
    .eq('id', membershipId)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('[removeMember]', error.message)
    return { error: 'Erro ao remover membro.' }
  }

  revalidatePath('/app/settings')
  return { error: '', success: true }
}
