import { createClient } from '@/lib/supabase/server'
import type { LeadWithVehicle } from './leads'

export async function getContacts(
  tenantId: string,
  search?: string,
): Promise<LeadWithVehicle[]> {
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select('*, vehicles(brand, model, year_model)')
    .eq('tenant_id', tenantId)
    .order('last_contact_at', { ascending: false, nullsFirst: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data } = await query
  return (data as LeadWithVehicle[]) ?? []
}

export async function getLeadsByPhone(
  phone: string,
  tenantId: string,
  excludeId: string,
): Promise<LeadWithVehicle[]> {
  const supabase  = await createClient()
  const digits    = phone.replace(/\D/g, '')

  const { data } = await supabase
    .from('leads')
    .select('*, vehicles(brand, model, year_model)')
    .eq('tenant_id', tenantId)
    .like('phone', `%${digits.slice(-8)}%`)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })

  return (data as LeadWithVehicle[]) ?? []
}
