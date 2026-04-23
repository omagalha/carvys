import { createClient } from '@/lib/supabase/server'

export type LeadStage = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'

export type Lead = {
  id: string
  name: string
  phone: string
  email: string | null
  source: string | null
  stage: LeadStage
  notes: string | null
  interest_vehicle_id: string | null
  last_contact_at: string | null
  next_follow_up_at: string | null
  created_at: string
}

export type LeadWithVehicle = Lead & {
  vehicles: { brand: string; model: string; year_model: number | null } | null
}

export async function getLeads(tenantId: string): Promise<LeadWithVehicle[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('*, vehicles(brand, model, year_model)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return (data as LeadWithVehicle[]) ?? []
}

export async function getLead(id: string, tenantId: string): Promise<LeadWithVehicle | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('*, vehicles(brand, model, year_model)')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  return (data as LeadWithVehicle) ?? null
}
