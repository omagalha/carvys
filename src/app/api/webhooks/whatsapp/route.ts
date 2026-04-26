import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

export async function POST(req: NextRequest) {
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

  // Skip group messages
  if (remoteJid.endsWith('@g.us')) return NextResponse.json({ ok: true })

  const text =
    body.data.message?.conversation ??
    body.data.message?.extendedTextMessage?.text

  if (!text) return NextResponse.json({ ok: true })

  const admin  = createAdminClient()
  const phone  = normalizePhone(remoteJid)

  const { data: session } = await admin
    .from('whatsapp_sessions')
    .select('tenant_id')
    .eq('instance_name', body.instance)
    .single()

  if (!session) return NextResponse.json({ ok: true })

  const { tenant_id } = session

  const { data: leads } = await admin
    .from('leads')
    .select('id, phone')
    .eq('tenant_id', tenant_id)

  const lead = (leads ?? []).find(l => {
    const lp = l.phone?.replace(/\D/g, '').slice(-11)
    return lp === phone
  })

  if (!lead) return NextResponse.json({ ok: true })

  await admin.from('lead_events').insert({
    tenant_id,
    lead_id:     lead.id,
    type:        fromMe ? 'whatsapp_out' : 'whatsapp_in',
    description: text,
  })

  return NextResponse.json({ ok: true })
}
