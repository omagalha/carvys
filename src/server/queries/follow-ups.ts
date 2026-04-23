import { createClient } from '@/lib/supabase/server'

export type FollowUpStatus = 'pending' | 'done' | 'canceled' | 'overdue'

export type FollowUp = {
  id: string
  lead_id: string
  title: string
  notes: string | null
  channel: string
  due_at: string
  completed_at: string | null
  status: FollowUpStatus
  created_at: string
}

export type FollowUpWithLead = FollowUp & {
  leads: { id: string; name: string; phone: string } | null
}

export async function getFollowUps(tenantId: string): Promise<FollowUpWithLead[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follow_ups')
    .select('*, leads(id, name, phone)')
    .eq('tenant_id', tenantId)
    .order('due_at', { ascending: true })

  return (data as FollowUpWithLead[]) ?? []
}

export async function getLeadFollowUps(leadId: string, tenantId: string): Promise<FollowUp[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('lead_id', leadId)
    .eq('tenant_id', tenantId)
    .order('due_at', { ascending: true })

  return (data as FollowUp[]) ?? []
}

export async function getFollowUp(id: string, tenantId: string): Promise<FollowUpWithLead | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follow_ups')
    .select('*, leads(id, name, phone)')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  return (data as FollowUpWithLead) ?? null
}
