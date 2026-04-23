import { createAdminClient } from '@/lib/supabase/admin'

export type TenantNote = {
  id: string
  content: string
  created_by: string
  created_at: string
}

export type TenantEvent = {
  id: string
  type: string
  description: string
  created_at: string
}

export async function getTenantNotes(tenantId: string): Promise<TenantNote[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('tenant_notes')
    .select('id, content, created_by, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getTenantEvents(tenantId: string): Promise<TenantEvent[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('tenant_events')
    .select('id, type, description, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  return data ?? []
}
