'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().optional(),
})

const tenantSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(80),
})

export type SettingsState = { error: string; success?: boolean }

export async function updateProfile(
  _state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const raw = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone') || undefined,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone ?? null })
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile]', error.message)
    return { error: 'Erro ao salvar perfil.' }
  }

  // Atualiza metadados do auth também (para initials no top bar)
  await supabase.auth.updateUser({ data: { full_name: parsed.data.full_name } })

  revalidatePath('/app/settings')
  revalidatePath('/app/dashboard')
  return { error: '', success: true }
}

export async function updateTenant(
  _state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const raw = { name: formData.get('name') }
  const parsed = tenantSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants as { id: string }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tenants')
    .update({ name: parsed.data.name })
    .eq('id', tenant.id)

  if (error) {
    console.error('[updateTenant]', error.message)
    return { error: 'Erro ao salvar dados da loja.' }
  }

  revalidatePath('/app/settings')
  revalidatePath('/app/dashboard')
  return { error: '', success: true }
}
