import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { logout } from '@/server/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NotificationBell } from './notification-bell'
import type { AppNotification } from './notification-bell'

interface TopBarProps {
  tenantName: string
  userInitials: string
  tenantId: string
}

async function getNotifications(tenantId: string): Promise<AppNotification[]> {
  const supabase = await createClient()
  const now      = new Date()

  const [overdueRes, leadsRes] = await Promise.all([
    supabase
      .from('follow_ups')
      .select('id, title, lead_id, leads(name)')
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .lt('due_at', now.toISOString())
      .order('due_at', { ascending: true })
      .limit(10),
    supabase
      .from('leads')
      .select('id, name, stage, last_contact_at, created_at')
      .eq('tenant_id', tenantId)
      .neq('stage', 'won')
      .neq('stage', 'lost'),
  ])

  const notifications: AppNotification[] = []

  // Follow-ups vencidos
  for (const f of overdueRes.data ?? []) {
    const lead = Array.isArray(f.leads) ? f.leads[0] : f.leads
    notifications.push({
      id:       `fu-${f.id}`,
      type:     'overdue_followup',
      title:    f.title,
      subtitle: lead?.name ? `Follow-up vencido · ${lead.name}` : 'Follow-up vencido',
      href:     f.lead_id ? `/app/leads/${f.lead_id}` : '/app/follow-ups',
    })
  }

  // Leads urgentes (sem contato há mais tempo que o limite da etapa)
  const urgencyDays: Record<string, number> = { new: 1, contacted: 3, negotiating: 5 }
  for (const lead of leadsRes.data ?? []) {
    const limit = urgencyDays[lead.stage]
    if (!limit) continue
    const ref  = lead.last_contact_at ?? lead.created_at
    const days = Math.floor((now.getTime() - new Date(ref).getTime()) / 86400000)
    if (days >= limit) {
      notifications.push({
        id:       `lead-${lead.id}`,
        type:     'urgent_lead',
        title:    lead.name,
        subtitle: `Sem contato há ${days} dia${days !== 1 ? 's' : ''} · ${lead.stage === 'new' ? 'Novo' : lead.stage === 'contacted' ? 'Contatado' : 'Negociando'}`,
        href:     `/app/leads/${lead.id}`,
      })
    }
  }

  return notifications
}

export async function TopBar({ tenantName, userInitials, tenantId }: TopBarProps) {
  const notifications = await getNotifications(tenantId)

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-deep border-b border-surface">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green">
          <span className="font-display font-black text-void text-sm leading-none">C</span>
        </div>
        <span className="font-display font-bold text-white text-base leading-none">
          Car<span className="text-green">vys</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-body text-sm text-slate hidden sm:block truncate max-w-[160px]">
          {tenantName}
        </span>

        <NotificationBell notifications={notifications} />

        <Link
          href="/app/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-surface hover:border-green/50 transition-colors"
          title="Configurações"
        >
          <span className="font-display font-bold text-green text-xs">
            {userInitials}
          </span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate hover:text-white transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  )
}
