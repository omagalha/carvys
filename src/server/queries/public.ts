import { createAdminClient } from '@/lib/supabase/admin'
import type { Vehicle } from './vehicles'

export type PublicTenant = {
  id: string
  name: string
  slug: string
  plan_code: string
  status: string
  whatsapp_phone: string | null
}

export async function getTenantBySlug(slug: string): Promise<PublicTenant | null> {
  const supabase = createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, slug, plan_code, status, whatsapp_phone')
    .eq('slug', slug)
    .in('status', ['active', 'trial'])
    .single()

  if (!tenant) return null

  const { data: instance } = await supabase
    .from('whatsapp_instances')
    .select('phone_number')
    .eq('tenant_id', tenant.id)
    .eq('status', 'connected')
    .limit(1)
    .single()

  return {
    ...tenant,
    whatsapp_phone: instance?.phone_number ?? tenant.whatsapp_phone ?? null,
  }
}

export async function getPublicVehicles(tenantId: string): Promise<Vehicle[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('vehicles')
    .select('id, brand, model, version, year_manufacture, year_model, mileage, color, plate, price, cost_price, status, featured, cover_image_path, gallery, fuel, body_type, transmission, doors, created_at, renavam, chassis, motor_number, purchase_date, supplier_name')
    .eq('tenant_id', tenantId)
    .eq('status', 'available')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  return (data as Vehicle[]) ?? []
}

export async function getPublicVehicle(id: string, tenantId: string): Promise<Vehicle | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .eq('status', 'available')
    .single()

  if (!data) return null
  return {
    ...data,
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
  } as Vehicle
}
