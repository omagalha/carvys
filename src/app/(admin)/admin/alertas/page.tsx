import Link from 'next/link'
import { getAlerts } from '@/server/queries/admin'
import type { AdminTenant } from '@/server/queries/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function daysLeft(createdAt: string) {
  const expiresAt = new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
}

function TenantList({ tenants, extra }: { tenants: AdminTenant[]; extra?: (t: AdminTenant) => string }) {
  if (tenants.length === 0) {
    return <p className="font-body text-xs text-slate">Nenhum cliente nesta categoria.</p>
  }
  return (
    <div className="flex flex-col gap-1 mt-2">
      {tenants.map(t => (
        <Link
          key={t.id}
          href={`/admin/clientes/${t.id}`}
          className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2 hover:bg-surface transition-colors"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-sm text-white">{t.name}</span>
            <span className="font-body text-[10px] text-slate">{t.owner?.email ?? '—'}</span>
          </div>
          {extra && (
            <span className="font-body text-xs text-slate shrink-0 ml-3">{extra(t)}</span>
          )}
        </Link>
      ))}
    </div>
  )
}

export default async function AlertasPage() {
  const alerts = await getAlerts()

  const sections = [
    {
      key: 'trials',
      emoji: '⏰',
      label: 'Trials vencendo hoje',
      description: 'Expiram em menos de 24h',
      color: 'border-alert/30 bg-alert/5',
      count: alerts.trialsExpiringSoon.length,
      items: alerts.trialsExpiringSoon,
      extra: (t: AdminTenant) => `${daysLeft(t.created_at)}d restante`,
    },
    {
      key: 'pastDue',
      emoji: '🔴',
      label: 'Inadimplentes',
      description: 'Pagamento em atraso',
      color: 'border-alert/30 bg-alert/5',
      count: alerts.pastDue.length,
      items: alerts.pastDue,
      extra: (t: AdminTenant) => `desde ${formatDate(t.created_at)}`,
    },
    {
      key: 'noWhatsApp',
      emoji: '📵',
      label: 'Sem WhatsApp conectado',
      description: 'Trial ou ativos sem integração',
      color: 'border-yellow-500/20 bg-yellow-500/5',
      count: alerts.noWhatsApp.length,
      items: alerts.noWhatsApp,
      extra: (t: AdminTenant) => t.status,
    },
    {
      key: 'noVehicles',
      emoji: '📦',
      label: 'Sem veículos cadastrados',
      description: 'Trials que ainda não popularam o estoque',
      color: 'border-surface',
      count: alerts.noVehicles.length,
      items: alerts.noVehicles,
      extra: undefined,
    },
    {
      key: 'inactive',
      emoji: '😴',
      label: 'Ativos sem uso recente',
      description: 'Último acesso há mais de 7 dias',
      color: 'border-surface',
      count: alerts.activeInactive.length,
      items: alerts.activeInactive,
      extra: (t: AdminTenant) => t.owner?.last_sign_in_at
        ? `acesso ${formatDate(t.owner.last_sign_in_at)}`
        : 'nunca acessou',
    },
  ]

  const totalAlerts = alerts.trialsExpiringSoon.length + alerts.pastDue.length

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Alertas operacionais</h1>
        <p className="font-body text-sm text-slate mt-0.5">
          {totalAlerts > 0
            ? `${totalAlerts} iten${totalAlerts !== 1 ? 's' : ''} requer${totalAlerts === 1 ? '' : 'em'} atenção imediata`
            : 'Tudo em ordem por enquanto'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map(section => (
          <div key={section.key} className={`rounded-xl border p-5 ${section.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{section.emoji}</span>
                <div>
                  <p className="font-body font-semibold text-white text-sm">{section.label}</p>
                  <p className="font-body text-[10px] text-slate">{section.description}</p>
                </div>
              </div>
              <span className={`font-display font-bold text-2xl leading-none ${
                section.count > 0 && (section.key === 'trials' || section.key === 'pastDue')
                  ? 'text-alert'
                  : section.count > 0
                  ? 'text-white'
                  : 'text-slate'
              }`}>
                {section.count}
              </span>
            </div>
            {section.count > 0 && (
              <TenantList tenants={section.items} extra={section.extra} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
