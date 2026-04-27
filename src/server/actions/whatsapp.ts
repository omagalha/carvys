'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserTenants } from '@/server/queries/tenants'
import * as evo from '@/lib/evolution'

function instanceName(tenantId: string): string {
  return `carvys-${tenantId.replace(/-/g, '').slice(0, 12)}`
}

function webhookUrl(): string {
  const base   = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? ''
  return `${base}/api/webhooks/whatsapp?secret=${encodeURIComponent(secret)}`
}

async function getTenantId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const memberships = await getUserTenants()
  if (!memberships.length) throw new Error('No tenant')
  return (memberships[0].tenants as { id: string }).id
}

export async function connectWhatsApp(): Promise<{ qr: string | null; error?: string }> {
  try {
    const tenantId = await getTenantId()
    const admin    = createAdminClient()
    const name     = instanceName(tenantId)

    await admin.from('whatsapp_sessions').upsert(
      { tenant_id: tenantId, instance_name: name, status: 'connecting' },
      { onConflict: 'tenant_id' },
    )

    try {
      await evo.createInstance(name, webhookUrl())
    } catch (e) {
      console.error('[whatsapp] createInstance error:', e)
      // Instance may already exist — continue
    }

    // Small delay for Evolution API to generate QR
    await new Promise(r => setTimeout(r, 1000))

    const qr = await evo.getQRCode(name)
    return { qr }
  } catch (e) {
    return { qr: null, error: String(e) }
  }
}

export async function checkWhatsAppStatus(): Promise<{
  status: 'connected' | 'connecting' | 'disconnected'
  phone?: string
  qr?: string | null
}> {
  try {
    const tenantId = await getTenantId()
    const name     = instanceName(tenantId)
    const state    = await evo.getConnectionState(name)

    if (state === 'open') {
      const phone = await evo.getOwnerPhone(name)
      const admin = createAdminClient()
      await admin.from('whatsapp_sessions').upsert(
        {
          tenant_id:    tenantId,
          instance_name: name,
          status:       'connected',
          phone_number: phone ?? null,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id' },
      )
      revalidatePath('/app/settings')
      return { status: 'connected', phone: phone ?? undefined }
    }

    if (state === 'connecting') {
      const qr = await evo.getQRCode(name)
      return { status: 'connecting', qr }
    }

    return { status: 'disconnected' }
  } catch {
    return { status: 'disconnected' }
  }
}

export async function disconnectWhatsApp(): Promise<void> {
  const tenantId = await getTenantId()
  const admin    = createAdminClient()
  const name     = instanceName(tenantId)

  try { await evo.deleteInstance(name) } catch { /* ignore */ }

  await admin.from('whatsapp_sessions').delete().eq('tenant_id', tenantId)
  revalidatePath('/app/settings')
}

export async function sendWhatsAppMessage(
  leadId: string,
  phone: string,
  text: string,
): Promise<{ error?: string }> {
  try {
    const tenantId = await getTenantId()
    const name     = instanceName(tenantId)

    await evo.sendTextMessage(name, phone, text)

    const admin = createAdminClient()
    await admin.from('lead_events').insert({
      tenant_id:   tenantId,
      lead_id:     leadId,
      type:        'whatsapp_out',
      description: text,
    })

    revalidatePath(`/app/leads/${leadId}`)
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}
