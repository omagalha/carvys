'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { sendPlatformMessageOnce } from '@/server/platform-messages'
import { sendOfficialPlatformWhatsApp } from '@/server/platform-whatsapp'

const createTenantSchema = z.object({
  name:          z.string().min(2, 'Nome muito curto').max(80),
  phone:         z.string().min(10, 'Telefone inválido').max(20),
  business_type: z.enum(['car_dealer', 'makeup_store', 'garage']).default('car_dealer'),
})

export type CreateTenantState = { error: string }

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export async function createTenant(
  _state: CreateTenantState,
  formData: FormData
): Promise<CreateTenantState> {
  const raw = {
    name:          formData.get('name') as string,
    phone:         formData.get('phone') as string,
    business_type: formData.get('business_type') as string || 'car_dealer',
  }
  const parsed = createTenantSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sessao expirada. Faca login novamente.' }
  }

  const { data: existingMemberships, error: membershipsError } = await supabase
    .from('tenant_memberships')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)

  if (membershipsError) {
    console.error(
      '[createTenant] membershipsError',
      membershipsError.code,
      membershipsError.message
    )
  }

  if (existingMemberships && existingMemberships.length > 0) {
    redirect('/app/dashboard')
  }

  const slug = toSlug(parsed.data.name)

  const { error } = await supabase.rpc('create_tenant_with_owner', {
    p_name: parsed.data.name,
    p_slug: slug,
  })

  if (!error) {
    await supabase
      .from('profiles')
      .update({ phone: parsed.data.phone })
      .eq('id', user.id)

    const { data: newMembership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (newMembership) {
      await supabase
        .from('tenants')
        .update({
          whatsapp_phone: parsed.data.phone,
          business_type:  parsed.data.business_type,
        })
        .eq('id', newMembership.tenant_id)
    }

    if (newMembership) {
      const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'voce'
      try {
        const admin = createAdminClient()
        await sendPlatformMessageOnce(admin, newMembership.tenant_id, 'welcome', async () => {
          await sendWelcomeEmail({
            to: user.email!,
            firstName,
            tenantName: parsed.data.name,
          })
          try {
            await sendOfficialPlatformWhatsApp(
              parsed.data.phone,
              `Ola ${firstName}! Bem-vindo a Carvys. Sua loja ${parsed.data.name} foi criada com sucesso.`,
            )
          } catch (e) {
            console.error('[createTenant] welcome whatsapp error', e)
          }
        })
      } catch {
        // nao bloqueia o onboarding
      }
    }
  }

  if (error) {
    console.error('[createTenant] error', error.code, error.message)

    if (error.code === '23505') {
      const { data: membershipsAfterConflict } = await supabase
        .from('tenant_memberships')
        .select('tenant_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)

      if (membershipsAfterConflict && membershipsAfterConflict.length > 0) {
        redirect('/app/dashboard')
      }

      return { error: 'Ja existe uma loja com esse nome. Tente um nome diferente.' }
    }

    return { error: 'Erro ao criar loja. Tente novamente.' }
  }

  redirect('/app/dashboard')
}
