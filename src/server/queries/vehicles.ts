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
  cost_price: number | null
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived'
  featured: boolean
  cover_image_path: string | null
  gallery: string[]
  description: string | null
  created_at: string
  // document fields
  renavam: string | null
  chassis: string | null
  motor_number: string | null
  fuel: string | null
  body_type: string | null
  transmission: string | null
  doors: number | null
  purchase_date: string | null
  supplier_name: string | null
}

export async function getVehicles(
  tenantId: string,
  status?: string,
): Promise<Vehicle[]> {
  const supabase = await createClient()
  let query = supabase
    .from('vehicles')
    .select('id, brand, model, version, year_manufacture, year_model, mileage, color, plate, price, cost_price, status, featured, cover_image_path, created_at, renavam, chassis, fuel, body_type, transmission, doors')
    .eq('tenant_id', tenantId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
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
