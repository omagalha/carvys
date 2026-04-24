import { createClient } from '@/lib/supabase/server'

export type LeadEvent = {
  id: string
  type: 'created' | 'stage_change' | 'note'
  description: string
  created_at: string
}

export async function getLeadEvents(leadId: string, tenantId: string): Promise<LeadEvent[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lead_events')
    .select('id, type, description, created_at')
    .eq('lead_id', leadId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return (data as LeadEvent[]) ?? []
}
