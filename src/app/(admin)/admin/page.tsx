import Link from 'next/link'
import { getAllTenants, getRecentGlobalEvents } from '@/server/queries/admin'
import { Users, Store, TrendingUp, AlertCircle } from 'lucide-react'

const EVENT_ICON: Record<string, string> = {
  created:        '🟢',
  status_changed: '🔄',
  plan_changed:   '💳',
  payment:        '💰',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminOverviewPage() {
  const [tenants, events] = await Promise.all([getAllTenants(), getRecentGlobalEvents()])

  const total    = tenants.length
  const trial    = tenants.filter(t => t.status === 'trial').length
  const active   = tenants.filter(t => t.status === 'active').length
  const pastDue  = tenants.filter(t => t.status === 'past_due').length
  const canceled = tenants.filter(t => t.status === 'canceled').length

  const kpis = [
    { label: 'Total de lojas',   value: total,    icon: Store,       color: 'text-white' },
    { label: 'Ativas',           value: active,   icon: TrendingUp,  color: 'text-green' },
    { label: 'Em trial',         value: trial,    icon: Users,       color: 'text-blue-400' },
    { label: 'Inadimplentes',    value: pastDue,  icon: AlertCircle, color: 'text-alert' },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Overview</h1>
        <p className="font-body text-sm text-slate mt-0.5">Visão geral da plataforma Carvys</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-slate uppercase tracking-widest">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <span className={`font-display font-bold text-4xl leading-none ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recentes */}
        <div className="flex flex-col gap-3">
          <h2 className="font-body font-semibold text-white text-sm">Últimas lojas cadastradas</h2>
          <div className="flex flex-col gap-2">
            {tenants.slice(0, 5).map(t => (
              <Link key={t.id} href={`/admin/clientes/${t.id}`} className="flex items-center gap-4 rounded-xl bg-deep border border-surface p-4 hover:border-slate/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-white text-sm truncate">{t.name}</p>
                  <p className="font-body text-xs text-slate">{t.owner?.email ?? '—'}</p>
                </div>
                <span className={`font-body text-xs px-2 py-0.5 rounded-full ${
                  t.status === 'active'   ? 'bg-green/15 text-green' :
                  t.status === 'trial'    ? 'bg-blue-500/15 text-blue-400' :
                  t.status === 'past_due' ? 'bg-alert/15 text-alert' :
                  'bg-surface text-slate'
                }`}>
                  {t.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Feed de atividade global */}
        <div className="flex flex-col gap-3">
          <h2 className="font-body font-semibold text-white text-sm">Atividade recente</h2>
          {events.length === 0 ? (
            <p className="font-body text-xs text-slate">Nenhum evento ainda.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {events.slice(0, 15).map((ev, i) => (
                <div key={ev.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-sm leading-none mt-0.5">{EVENT_ICON[ev.type] ?? '📌'}</span>
                    {i < Math.min(events.length, 15) - 1 && (
                      <div className="w-px flex-1 bg-surface mt-1 mb-1" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-3">
                    <p className="font-body text-sm text-white leading-snug">{ev.description}</p>
                    <p className="font-body text-[10px] text-slate">
                      <Link href={`/admin/clientes/${ev.tenant_id}`} className="text-green hover:underline">{ev.tenant_name}</Link>
                      {' · '}{formatDateTime(ev.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
