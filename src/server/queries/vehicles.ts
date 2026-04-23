import { createClient } from '@/lib/supabase/server'

export type Vehicle = {
  id: string
  brand: string
  model: string
  version: string | null
  year_manufacture: number | null
  year_model: number | null
  mileage: number | null
  color: string | null
  plate: string | null
  price: number
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived'
  featured: boolean
  cover_image_path: string | null
  gallery: string[]
  created_at: string
}

export async function getVehicles(tenantId: string): Promise<Vehicle[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('id, brand, model, version, year_manufacture, year_model, mileage, color, plate, price, status, featured, cover_image_path, created_at')
    .eq('tenant_id', tenantId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  return (data as Vehicle[]) ?? []
}

export async function getVehicle(id: string, tenantId: string): Promise<Vehicle | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!data) return null
  return {
    ...data,
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
  } as Vehicle
}
