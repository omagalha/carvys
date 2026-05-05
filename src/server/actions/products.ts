'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const productSchema = z.object({
  name:             z.string().min(1, 'Nome obrigatório'),
  sku:              z.string().optional(),
  category:         z.string().optional(),
  brand:            z.string().optional(),
  supplier:         z.string().optional(),
  cost_price:       z.coerce.number().min(0).optional(),
  sale_price:       z.coerce.number().min(0).optional(),
  manufacture_date: z.string().optional(),
  expiry_date:      z.string().optional(),
  quantity:         z.coerce.number().int().min(0).default(0),
  min_quantity:     z.coerce.number().int().min(0).default(0),
})

export type ProductState = { error: string }

export async function createProduct(
  _state: ProductState,
  formData: FormData
): Promise<ProductState> {
  const raw = {
    name:             formData.get('name'),
    sku:              formData.get('sku') || undefined,
    category:         formData.get('category') || undefined,
    brand:            formData.get('brand') || undefined,
    supplier:         formData.get('supplier') || undefined,
    cost_price:       formData.get('cost_price') || undefined,
    sale_price:       formData.get('sale_price') || undefined,
    manufacture_date: formData.get('manufacture_date') || undefined,
    expiry_date:      formData.get('expiry_date') || undefined,
    quantity:         formData.get('quantity') || 0,
    min_quantity:     formData.get('min_quantity') || 0,
  }

  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase
    .from('products')
    .insert({
      ...parsed.data,
      tenant_id:        tenant.id,
      manufacture_date: parsed.data.manufacture_date || null,
      expiry_date:      parsed.data.expiry_date || null,
    })

  if (error) {
    console.error('[createProduct]', error.code, error.message)
    return { error: 'Erro ao salvar produto. Tente novamente.' }
  }

  redirect('/app/produtos')
}

export async function updateProduct(
  _state: ProductState,
  formData: FormData
): Promise<ProductState> {
  const productId = formData.get('id') as string
  if (!productId) return { error: 'ID inválido.' }

  const raw = {
    name:             formData.get('name'),
    sku:              formData.get('sku') || undefined,
    category:         formData.get('category') || undefined,
    brand:            formData.get('brand') || undefined,
    supplier:         formData.get('supplier') || undefined,
    cost_price:       formData.get('cost_price') || undefined,
    sale_price:       formData.get('sale_price') || undefined,
    manufacture_date: formData.get('manufacture_date') || undefined,
    expiry_date:      formData.get('expiry_date') || undefined,
    quantity:         formData.get('quantity') || 0,
    min_quantity:     formData.get('min_quantity') || 0,
  }

  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase
    .from('products')
    .update({
      ...parsed.data,
      manufacture_date: parsed.data.manufacture_date || null,
      expiry_date:      parsed.data.expiry_date || null,
    })
    .eq('id', productId)
    .eq('tenant_id', tenant.id)

  if (error) {
    console.error('[updateProduct]', error.code, error.message)
    return { error: 'Erro ao atualizar produto.' }
  }

  revalidatePath(`/app/produtos/${productId}`)
  revalidatePath('/app/produtos')
  return { error: '' }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('tenant_id', tenant.id)

  if (error) return { error: 'Erro ao excluir produto.' }

  revalidatePath('/app/produtos')
  return { error: '' }
}

const saleSchema = z.object({
  product_id:    z.string().uuid('Produto inválido'),
  contact_name:  z.string().min(1, 'Nome do cliente obrigatório'),
  contact_phone: z.string().optional(),
  quantity:      z.coerce.number().int().min(1, 'Quantidade mínima: 1'),
  unit_price:    z.coerce.number().min(0, 'Preço inválido'),
  notes:         z.string().optional(),
  sold_at:       z.string().optional(),
})

export type SaleState = { error: string }

export async function registerSale(
  _state: SaleState,
  formData: FormData
): Promise<SaleState> {
  const raw = {
    product_id:    formData.get('product_id'),
    contact_name:  formData.get('contact_name'),
    contact_phone: formData.get('contact_phone') || undefined,
    quantity:      formData.get('quantity'),
    unit_price:    formData.get('unit_price'),
    notes:         formData.get('notes') || undefined,
    sold_at:       formData.get('sold_at') || undefined,
  }

  const parsed = saleSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { data: product } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', parsed.data.product_id)
    .eq('tenant_id', tenant.id)
    .single()

  if (!product) return { error: 'Produto não encontrado.' }

  const newQty = product.quantity - parsed.data.quantity
  if (newQty < 0) return { error: 'Estoque insuficiente para essa venda.' }

  const { error: saleError } = await supabase
    .from('product_sales')
    .insert({
      tenant_id:     tenant.id,
      product_id:    parsed.data.product_id,
      contact_name:  parsed.data.contact_name,
      contact_phone: parsed.data.contact_phone || null,
      quantity:      parsed.data.quantity,
      unit_price:    parsed.data.unit_price,
      notes:         parsed.data.notes || null,
      sold_at:       parsed.data.sold_at || new Date().toISOString().split('T')[0],
    })

  if (saleError) {
    console.error('[registerSale]', saleError.code, saleError.message)
    return { error: 'Erro ao registrar venda.' }
  }

  await supabase
    .from('inventory_movements')
    .insert({
      tenant_id:    tenant.id,
      product_id:   parsed.data.product_id,
      type:         'out',
      quantity:     parsed.data.quantity,
      notes:        `Venda para ${parsed.data.contact_name}`,
      performed_by: user?.id ?? null,
    })

  await supabase
    .from('products')
    .update({ quantity: newQty })
    .eq('id', parsed.data.product_id)
    .eq('tenant_id', tenant.id)

  revalidatePath('/app/produtos')
  revalidatePath(`/app/produtos/${parsed.data.product_id}`)
  revalidatePath('/app/estoque')
  revalidatePath('/app/clientes')
  return { error: '' }
}

const movementSchema = z.object({
  product_id: z.string().uuid('Produto inválido'),
  type:       z.enum(['in', 'out', 'return', 'discard']),
  quantity:   z.coerce.number().int().min(1, 'Quantidade mínima: 1'),
  notes:      z.string().optional(),
})

export type MovementState = { error: string }

export async function registerMovement(
  _state: MovementState,
  formData: FormData
): Promise<MovementState> {
  const raw = {
    product_id: formData.get('product_id'),
    type:       formData.get('type'),
    quantity:   formData.get('quantity'),
    notes:      formData.get('notes') || undefined,
  }

  const parsed = movementSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { data: product } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', parsed.data.product_id)
    .eq('tenant_id', tenant.id)
    .single()

  if (!product) return { error: 'Produto não encontrado.' }

  const delta = ['in', 'return'].includes(parsed.data.type)
    ? parsed.data.quantity
    : -parsed.data.quantity

  const newQty = product.quantity + delta
  if (newQty < 0) return { error: 'Estoque insuficiente para essa saída.' }

  const { error: mvError } = await supabase
    .from('inventory_movements')
    .insert({
      tenant_id:    tenant.id,
      product_id:   parsed.data.product_id,
      type:         parsed.data.type,
      quantity:     parsed.data.quantity,
      notes:        parsed.data.notes || null,
      performed_by: user?.id ?? null,
    })

  if (mvError) {
    console.error('[registerMovement]', mvError.code, mvError.message)
    return { error: 'Erro ao registrar movimentação.' }
  }

  await supabase
    .from('products')
    .update({ quantity: newQty })
    .eq('id', parsed.data.product_id)
    .eq('tenant_id', tenant.id)

  revalidatePath('/app/produtos')
  revalidatePath(`/app/produtos/${parsed.data.product_id}`)
  revalidatePath('/app/estoque')
  return { error: '' }
}
