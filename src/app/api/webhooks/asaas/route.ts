import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPaymentOverdueEmail } from '@/lib/email'
import { sendPlatformMessageOnce } from '@/server/platform-messages'
import { sendOfficialPlatformWhatsApp } from '@/server/platform-whatsapp'
import { makeRateLimiter, checkRateLimit } from '@/lib/rate-limit'

const limiter = makeRateLimiter(30, 60)

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!await checkRateLimit(limiter, `asaas:${ip}`)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

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

  if (event === 'SUBSCRIPTION_DELETED' || event === 'SUBSCRIPTION_INACTIVATED') {
    await admin
      .from('tenants')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', tenant.id)

    await admin.from('tenant_events').insert({
      tenant_id: tenant.id,
      type: 'status_changed',
      description: event === 'SUBSCRIPTION_DELETED' ? 'Assinatura cancelada' : 'Assinatura inativada',
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

  if (event === 'PAYMENT_OVERDUE') {
    const { data: membership } = await admin
      .from('tenant_memberships')
      .select('user_id')
      .eq('tenant_id', tenant.id)
      .eq('role', 'owner')
      .single()

    if (membership) {
      const { data: { user: owner } } = await admin.auth.admin.getUserById(membership.user_id)
      const { data: profile } = await admin
        .from('profiles')
        .select('phone')
        .eq('id', membership.user_id)
        .maybeSingle()
      if (owner?.email) {
        try {
          const externalRef = String(payment.id ?? payment.dueDate ?? '')
          await sendPlatformMessageOnce(
            admin,
            tenant.id,
            'payment_overdue',
            async () => {
              await sendPaymentOverdueEmail({
                to: owner.email!,
                tenantName: tenant.name,
                value: payment.value ?? 0,
              })
              if (profile?.phone) {
                try {
                  await sendOfficialPlatformWhatsApp(
                    profile.phone,
                    `Ola! Identificamos uma cobranca em atraso da Carvys para ${tenant.name} no valor de R$${(payment.value ?? 0).toFixed(2).replace('.', ',')}.`,
                  )
                } catch (e) {
                  console.error('[asaas webhook] overdue whatsapp error', e)
                }
              }
            },
            {
              externalRef,
              metadata: {
                asaasPaymentId: payment.id ?? null,
                dueDate: payment.dueDate ?? null,
                value: payment.value ?? null,
              },
            },
          )
        } catch {
          // não bloqueia o webhook
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
