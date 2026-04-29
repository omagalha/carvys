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

export type PlatformMessage = {
  id: string
  type: string
  external_ref: string
  created_at: string
  metadata: Record<string, unknown> | null
}

const PLATFORM_MSG_LABEL: Record<string, string> = {
  welcome:         'Boas-vindas enviadas',
  trial_expiring:  'Aviso de trial expirando',
  payment_overdue: 'Aviso de pagamento em atraso',
}

export function platformMsgLabel(type: string): string {
  return PLATFORM_MSG_LABEL[type] ?? type
}

export async function getTenantPlatformMessages(tenantId: string): Promise<PlatformMessage[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('platform_messages_log')
    .select('id, type, external_ref, created_at, metadata')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  return data ?? []
}
