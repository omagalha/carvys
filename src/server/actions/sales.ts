'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

export type SaleState = { error: string }

export async function registerSale(
  _state: SaleState,
  formData: FormData
): Promise<SaleState> {
  const vehicle_id = formData.get('vehicle_id') as string
  const sale_price = parseFloat(formData.get('sale_price') as string)
  const lead_id    = (formData.get('lead_id') as string) || null
  const sold_at    = formData.get('sold_at') as string
  const notes      = (formData.get('notes') as string) || null

  if (!vehicle_id) return { error: 'Veículo inválido.' }
  if (!sale_price || sale_price <= 0) return { error: 'Informe o preço de venda.' }
  if (!sold_at) return { error: 'Informe a data da venda.' }

  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('cost_price')
    .eq('id', vehicle_id)
    .eq('tenant_id', tenant.id)
    .single()

  const { error: saleError } = await supabase.from('sales').insert({
    tenant_id: tenant.id,
    vehicle_id,
    lead_id,
    sale_price,
    cost_price: vehicle?.cost_price ?? null,
    notes,
    sold_at: new Date(sold_at).toISOString(),
  })

  if (saleError) {
    console.error('[registerSale]', saleError.code, saleError.message)
    return { error: 'Erro ao registrar venda. Tente novamente.' }
  }

  await supabase
    .from('vehicles')
    .update({ status: 'sold' })
    .eq('id', vehicle_id)
    .eq('tenant_id', tenant.id)

  revalidatePath(`/app/vehicles/${vehicle_id}`)
  revalidatePath('/app/vehicles')
  revalidatePath('/app/financeiro')
  revalidatePath('/app/dashboard')

  redirect(`/app/vehicles/${vehicle_id}`)
}
