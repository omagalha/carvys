import type { SupabaseClient } from '@supabase/supabase-js'
import type { Json } from '@/types/database'

export type PlatformMessageType =
  | 'welcome'
  | 'trial_expiring'
  | 'payment_overdue'

type AdminClient = SupabaseClient

type PlatformMessageOptions = {
  externalRef?: string | null
  metadata?: Json
}

function externalRefValue(externalRef?: string | null): string {
  return externalRef?.trim() ?? ''
}

export async function hasPlatformMessageBeenSent(
  admin: AdminClient,
  tenantId: string,
  type: PlatformMessageType,
  options: PlatformMessageOptions = {},
): Promise<boolean> {
  const { data, error } = await admin
    .from('platform_messages_log')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('type', type)
    .eq('external_ref', externalRefValue(options.externalRef))
    .maybeSingle()

  if (error) {
    console.error('[platformMessages] lookup error', error.message)
    return false
  }

  return !!data
}

export async function markPlatformMessageSent(
  admin: AdminClient,
  tenantId: string,
  type: PlatformMessageType,
  options: PlatformMessageOptions = {},
): Promise<void> {
  const { error } = await admin
    .from('platform_messages_log')
    .upsert(
      {
        tenant_id: tenantId,
        type,
        external_ref: externalRefValue(options.externalRef),
        metadata: options.metadata ?? {},
        sent_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,type,external_ref' },
    )

  if (error) {
    console.error('[platformMessages] mark sent error', error.message)
  }
}

export async function sendPlatformMessageOnce(
  admin: AdminClient,
  tenantId: string,
  type: PlatformMessageType,
  send: () => Promise<void>,
  options: PlatformMessageOptions = {},
): Promise<boolean> {
  const alreadySent = await hasPlatformMessageBeenSent(admin, tenantId, type, options)
  if (alreadySent) return false

  await send()
  await markPlatformMessageSent(admin, tenantId, type, options)
  return true
}
