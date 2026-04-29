'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'
import * as evo from '@/lib/evolution'
import {
  CARVYS_OFFICIAL_WHATSAPP_PHONE,
  PLATFORM_WHATSAPP_INSTANCE,
} from '@/server/platform-whatsapp'

type PlatformWhatsAppStatus = {
  status: 'connected' | 'connecting' | 'disconnected'
  phone?: string
  qr?: string | null
}

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) throw new Error('Sem permissao.')
}

async function upsertPlatformSession(status: string, phone?: string | null) {
  const admin = createAdminClient()
  await admin.from('platform_whatsapp_sessions').upsert(
    {
      instance_name: PLATFORM_WHATSAPP_INSTANCE,
      status,
      phone_number: phone ?? null,
      connected_at: status === 'connected' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'instance_name' },
  )
}

export async function connectPlatformWhatsApp(): Promise<{ qr: string | null; error?: string }> {
  try {
    await guardAdmin()
    await upsertPlatformSession('connecting')

    let qr: string | null = null
    let createError: string | null = null

    try {
      qr = await evo.createInstance(PLATFORM_WHATSAPP_INSTANCE)
    } catch (e) {
      console.error('[platform-whatsapp] createInstance error:', e)
      createError = e instanceof Error ? e.message : String(e)
    }

    qr = qr ?? await evo.waitForQRCode(PLATFORM_WHATSAPP_INSTANCE)
    if (qr) return { qr }

    const state = await evo.getConnectionState(PLATFORM_WHATSAPP_INSTANCE)
    if (state === 'open') return { qr: null }

    return {
      qr: null,
      error: createError
        ? `Nao foi possivel gerar o QR Code. Evolution: ${createError}`
        : 'Nao foi possivel gerar o QR Code. Tente novamente em alguns segundos.',
    }
  } catch (e) {
    return { qr: null, error: String(e) }
  }
}

export async function checkPlatformWhatsAppStatus(): Promise<PlatformWhatsAppStatus> {
  try {
    await guardAdmin()
    const state = await evo.getConnectionState(PLATFORM_WHATSAPP_INSTANCE)

    if (state === 'open') {
      const phone = await evo.getOwnerPhone(PLATFORM_WHATSAPP_INSTANCE)
      await upsertPlatformSession('connected', phone)
      revalidatePath('/admin/whatsapp')
      return { status: 'connected', phone: phone ?? undefined }
    }

    const qr = await evo.waitForQRCode(PLATFORM_WHATSAPP_INSTANCE, 2, 1000)
    if (qr) return { status: 'connecting', qr }

    await upsertPlatformSession(state === 'connecting' ? 'connecting' : 'disconnected')
    return { status: state === 'connecting' ? 'connecting' : 'disconnected' }
  } catch {
    return { status: 'disconnected' }
  }
}

export async function disconnectPlatformWhatsApp(): Promise<void> {
  await guardAdmin()

  try {
    await evo.deleteInstance(PLATFORM_WHATSAPP_INSTANCE)
  } catch {
    // ignore
  }

  await upsertPlatformSession('disconnected')
  revalidatePath('/admin/whatsapp')
}

export async function sendPlatformWhatsAppTest(phone = CARVYS_OFFICIAL_WHATSAPP_PHONE): Promise<{ error?: string }> {
  try {
    await guardAdmin()
    await evo.sendTextMessage(
      PLATFORM_WHATSAPP_INSTANCE,
      phone,
      'Teste da instancia oficial da Carvys. Se chegou aqui, esta tudo conectado.',
    )
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}
