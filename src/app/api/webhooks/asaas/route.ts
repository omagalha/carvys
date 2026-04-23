import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const token = req.headers.get('asaas-access-token')
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const event   = body?.event as string
  const payment = body?.payment

  if (!payment?.customer) {
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  const { data: tenant } = await admin
    .from('tenants')
    .select('id, name, plan_code')
    .eq('asaas_customer_id', payment.customer)
    .single()

  if (!tenant) return NextResponse.json({ ok: true })

  const STATUS_MAP: Record<string, string> = {
    PAYMENT_CONFIRMED: 'active',
    PAYMENT_RECEIVED:  'active',
    PAYMENT_OVERDUE:   'past_due',
  }

  const EVENT_LABEL: Record<string, string> = {
    PAYMENT_CONFIRMED: 'Pagamento confirmado',
    PAYMENT_RECEIVED:  'Pagamento recebido',
    PAYMENT_OVERDUE:   'Pagamento em atraso',
    SUBSCRIPTION_DELETED: 'Assinatura cancelada',
  }

  if (event === 'SUBSCRIPTION_DELETED') {
    await admin
      .from('tenants')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', tenant.id)

    await admin.from('tenant_events').insert({
      tenant_id: tenant.id,
      type: 'status_changed',
      description: 'Assinatura cancelada pelo cliente',
    })

    return NextResponse.json({ ok: true })
  }

  const newStatus = STATUS_MAP[event]
  if (!newStatus) return NextResponse.json({ ok: true })

  await admin.from('tenants').update({ status: newStatus }).eq('id', tenant.id)

  await admin.from('tenant_events').insert({
    tenant_id: tenant.id,
    type: 'payment',
    description: `${EVENT_LABEL[event] ?? event} — R$${payment.value?.toFixed(2).replace('.', ',')}`,
  })

  return NextResponse.json({ ok: true })
}
