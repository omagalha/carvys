import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTrialExpiringEmail } from '@/lib/email'
import { sendPlatformMessageOnce } from '@/server/platform-messages'
import { sendOfficialPlatformWhatsApp } from '@/server/platform-whatsapp'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()

  // Tenants no trial com expiração nas próximas 24h
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const { data: expiringSoon } = await admin
    .from('tenants')
    .select('id, name, created_at')
    .eq('status', 'trial')
    .lte('created_at', new Date(in24h.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())

  let notified = 0

  for (const tenant of expiringSoon ?? []) {
    const expiresAt = new Date(tenant.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
    const daysLeft = Math.max(0, Math.ceil((expiresAt - now.getTime()) / (1000 * 60 * 60 * 24)))

    const { data: membership } = await admin
      .from('tenant_memberships')
      .select('user_id')
      .eq('tenant_id', tenant.id)
      .eq('role', 'owner')
      .single()

    if (!membership) continue

    const { data: { user: owner } } = await admin.auth.admin.getUserById(membership.user_id)
    if (!owner?.email) continue

    const { data: profile } = await admin
      .from('profiles')
      .select('phone')
      .eq('id', membership.user_id)
      .maybeSingle()

    try {
      const sent = await sendPlatformMessageOnce(admin, tenant.id, 'trial_expiring', async () => {
        await sendTrialExpiringEmail({ to: owner.email!, tenantName: tenant.name, daysLeft })
        if (profile?.phone) {
          try {
            await sendOfficialPlatformWhatsApp(
              profile.phone,
              `Ola! Seu trial da Carvys para ${tenant.name} termina em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}.`,
            )
          } catch (e) {
            console.error('[notify-trials] whatsapp error', e)
          }
        }
      })
      if (sent) notified += 1
    } catch {
      // continua para o próximo
    }
  }

  return NextResponse.json({ notified })
}
