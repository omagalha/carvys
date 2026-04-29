import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTextMessage } from '@/lib/evolution'
import { makeRateLimiter, checkRateLimit } from '@/lib/rate-limit'

const limiter = makeRateLimiter(120, 60)

type EvolutionPayload = {
  event:    string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe:    boolean
      id:        string
    }
    message?: {
      conversation?:         string
      extendedTextMessage?:  { text?: string }
    }
  }
}

function normalizePhone(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace(/\D/g, '').slice(-11)
}

function buildAutoReply(
  name: string,
  vehicle: { brand: string; model: string; year_model?: number | null } | null,
): string {
  const first = name.split(' ')[0]
  if (vehicle) {
    const vName = `${vehicle.brand} ${vehicle.model}${vehicle.year_model ? ' ' + vehicle.year_model : ''}`
    return `Olá ${first}! Vi que você se interessou pelo ${vName}. Ele ainda está disponível! Posso te enviar mais detalhes ou fazer uma simulação de financiamento? 😊`
  }
  return `Olá ${first}! Obrigado pelo contato. Como posso te ajudar hoje? 😊`
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!await checkRateLimit(limiter, `whatsapp:${ip}`)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.WHATSAPP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: EvolutionPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  if (body.event !== 'messages.upsert' || !body.data?.key) {
    return NextResponse.json({ ok: true })
  }

  const { remoteJid, fromMe } = body.data.key

  if (remoteJid.endsWith('@g.us')) return NextResponse.json({ ok: true })

  const text =
    body.data.message?.conversation ??
    body.data.message?.extendedTextMessage?.text

  if (!text) return NextResponse.json({ ok: true })

  const admin = createAdminClient()
  const phone = normalizePhone(remoteJid)

  const { data: session } = await admin
    .from('whatsapp_sessions')
    .select('tenant_id')
    .eq('instance_name', body.instance)
    .single()

  if (!session) return NextResponse.json({ ok: true })

  const { tenant_id } = session

  const { data: leads } = await admin
    .from('leads')
    .select('id, phone, stage')
    .eq('tenant_id', tenant_id)

  const lead = (leads ?? []).find(l => {
    const lp = l.phone?.replace(/\D/g, '').slice(-11)
    return lp === phone
  })

  if (!lead) return NextResponse.json({ ok: true })

  // Check if first inbound before logging
  let isFirstInbound = false
  if (!fromMe) {
    const { count } = await admin
      .from('lead_events')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id', lead.id)
      .eq('type', 'whatsapp_in')
    isFirstInbound = count === 0
  }

  await admin.from('lead_events').insert({
    tenant_id,
    lead_id:     lead.id,
    type:        fromMe ? 'whatsapp_out' : 'whatsapp_in',
    description: text,
  })

  if (fromMe) {
    const advanceStage = lead.stage === 'new'
    await admin
      .from('leads')
      .update({
        last_contact_at: new Date().toISOString(),
        ...(advanceStage ? { stage: 'contacted' } : {}),
      })
      .eq('id', lead.id)
      .eq('tenant_id', tenant_id)

    if (advanceStage) {
      await admin.from('lead_events').insert({
        tenant_id,
        lead_id:     lead.id,
        type:        'stage_change',
        description: 'Movido para Contatado',
      })
    }
  }

  if (isFirstInbound) {
    try {
      const { data: detail } = await admin
        .from('leads')
        .select('name, vehicles(brand, model, year_model)')
        .eq('id', lead.id)
        .single()

      if (detail) {
        const raw = detail.vehicles
        const vehicle = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)
        const reply = buildAutoReply(detail.name, vehicle)

        await sendTextMessage(body.instance, phone, reply)
        await admin.from('lead_events').insert({
          tenant_id,
          lead_id:     lead.id,
          type:        'whatsapp_out',
          description: `[Auto] ${reply}`,
        })
      }
    } catch (e) {
      console.error('[webhook] auto-reply error:', e)
    }
  }

  return NextResponse.json({ ok: true })
}
