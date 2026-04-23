'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

const createVehicleSchema = z.object({
  brand: z.string().min(1, 'Marca obrigatória'),
  model: z.string().min(1, 'Modelo obrigatório'),
  version: z.string().optional(),
  year_manufacture: z.coerce.number().int().min(1900).max(2030),
  year_model: z.coerce.number().int().min(1900).max(2031),
  price: z.coerce.number().min(0, 'Preço inválido'),
  mileage: z.coerce.number().int().min(0).optional(),
  color: z.string().optional(),
  plate: z.string().optional(),
  status: z.enum(['draft', 'available']),
})

export type VehicleState = { error: string }

export async function createVehicle(
  _state: VehicleState,
  formData: FormData
): Promise<VehicleState> {
  const raw = {
    brand: formData.get('brand'),
    model: formData.get('model'),
    version: formData.get('version') || undefined,
    year_manufacture: formData.get('year_manufacture'),
    year_model: formData.get('year_model'),
    price: formData.get('price'),
    mileage: formData.get('mileage') || undefined,
    color: formData.get('color') || undefined,
    plate: formData.get('plate') || undefined,
    status: formData.get('status'),
  }

  const parsed = createVehicleSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Nenhuma loja encontrada.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase
    .from('vehicles')
    .insert({ ...parsed.data, tenant_id: tenant.id })

  if (error) {
    console.error('[createVehicle]', error.code, error.message)
    return { error: 'Erro ao salvar veículo. Tente novamente.' }
  }

  redirect('/app/vehicles')
}

export async function updateVehiclePhotos(
  vehicleId: string,
  coverPath: string | null,
  galleryPaths: string[]
) {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase
    .from('vehicles')
    .update({ cover_image_path: coverPath, gallery: galleryPaths })
    .eq('id', vehicleId)
    .eq('tenant_id', tenant.id)

  if (error) {
    console.error('[updateVehiclePhotos]', error.code, error.message)
    return { error: 'Erro ao salvar fotos.' }
  }

  revalidatePath(`/app/vehicles/${vehicleId}`)
  return { error: '' }
}

export async function updateVehicleStatus(vehicleId: string, status: string) {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return { error: 'Sem acesso.' }

  const tenant = memberships[0].tenants as { id: string }

  const { error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', vehicleId)
    .eq('tenant_id', tenant.id)

  if (error) return { error: 'Erro ao atualizar status.' }

  revalidatePath(`/app/vehicles/${vehicleId}`)
  revalidatePath('/app/vehicles')
  return { error: '' }
}
