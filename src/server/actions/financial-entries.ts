'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const schema = z.object({
  type:         z.enum(['expense', 'income']),
  category:     z.string().min(1),
  description:  z.string().min(1, 'Descrição obrigatória'),
  amount:       z.coerce.number().positive('Valor deve ser maior que zero'),
  date:         z.string().min(1),
  vehicle_id:   z.string().optional(),
  installments: z.coerce.number().int().min(1).max(60).default(1),
})

export type EntryState = { error: string; success?: boolean }

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export async function addFinancialEntry(
  _state: EntryState,
  formData: FormData
): Promise<EntryState> {
  const raw = {
    type:         formData.get('type'),
    category:     formData.get('category'),
    description:  formData.get('description'),
    amount:       formData.get('amount'),
    date:         formData.get('date'),
    vehicle_id:   formData.get('vehicle_id') || undefined,
    installments: formData.get('installments') || 1,
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  const memberships = await getUserTenants()
  if (!memberships.length) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants
  const { type, category, description, amount, date, vehicle_id, installments } = parsed.data

  const entries = Array.from({ length: installments }, (_, i) => ({
    tenant_id:   tenant.id,
    vehicle_id:  vehicle_id ?? null,
    type,
    category,
    description: installments > 1 ? `${description} (${i + 1}/${installments})` : description,
    amount,
    date:        addMonths(date, i),
  }))

  const { error } = await supabase.from('financial_entries').insert(entries)

  if (error) {
    console.error('[addFinancialEntry]', error.message)
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  revalidatePath('/app/financeiro')
  return { error: '', success: true }
}
