import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWeeklyReportEmail } from '@/lib/email'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: tenants } = await admin
    .from('tenants')
    .select('id, name')
    .in('status', ['active', 'trial'])

  let sent = 0

  for (const tenant of tenants ?? []) {
    try {
      const [{ count: newLeads }, { count: whatsappSent }, { count: vehiclesAdded }] =
        await Promise.all([
          admin.from('leads').select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id).gte('created_at', since),
          admin.from('lead_events').select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id).eq('type', 'whatsapp_out').gte('created_at', since),
          admin.from('vehicles').select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id).gte('created_at', since),
        ])

      if (!newLeads && !whatsappSent && !vehiclesAdded) continue

      const { data: membership } = await admin
        .from('tenant_memberships')
        .select('user_id')
        .eq('tenant_id', tenant.id)
        .eq('role', 'owner')
        .single()

      if (!membership) continue

      const { data: { user: owner } } = await admin.auth.admin.getUserById(membership.user_id)
      if (!owner?.email) continue

      await sendWeeklyReportEmail({
        to: owner.email,
        tenantName: tenant.name,
        newLeads: newLeads ?? 0,
        whatsappSent: whatsappSent ?? 0,
        vehiclesAdded: vehiclesAdded ?? 0,
      })

      sent++
    } catch {
      // continua para o próximo tenant
    }
  }

  return NextResponse.json({ sent })
}
