'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const schema = z.object({
  type:        z.enum(['expense', 'income']),
  category:    z.string().min(1),
  description: z.string().min(1, 'Descrição obrigatória'),
  amount:      z.coerce.number().positive('Valor deve ser maior que zero'),
  date:        z.string().min(1),
  vehicle_id:  z.string().optional(),
})

export type EntryState = { error: string; success?: boolean }

export async function addFinancialEntry(
  _state: EntryState,
  formData: FormData
): Promise<EntryState> {
  const raw = {
    type:        formData.get('type'),
    category:    formData.get('category'),
    description: formData.get('description'),
    amount:      formData.get('amount'),
    date:        formData.get('date'),
    vehicle_id:  formData.get('vehicle_id') || undefined,
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  const memberships = await getUserTenants()
  if (!memberships.length) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants

  const { error } = await supabase.from('financial_entries').insert({
    tenant_id:   tenant.id,
    vehicle_id:  parsed.data.vehicle_id ?? null,
    type:        parsed.data.type,
    category:    parsed.data.category,
    description: parsed.data.description,
    amount:      parsed.data.amount,
    date:        parsed.data.date,
  })

  if (error) {
    console.error('[addFinancialEntry]', error.message)
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  revalidatePath('/app/financeiro')
  return { error: '', success: true }
}
