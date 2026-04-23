import Link from 'next/link'
import { getAdminFinancials, getAtRiskTenants } from '@/server/queries/admin-financeiro'
import { TrendingUp, Users, AlertCircle, CalendarPlus, TrendingDown, MessageCircle } from 'lucide-react'

const PLAN_LABEL: Record<string, string> = { starter: 'Starter', pro: 'Pro', elite: 'Elite' }

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatLastSeen(days: number) {
  if (days >= 999) return 'nunca fez login'
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  return `há ${days} dias`
}

const WELCOME_TEMPLATE = (name: string) =>
  `Olá ${name}! Seja muito bem-vindo(a) ao Carvys 🚗\nSeu trial de 7 dias já começou. Estou aqui para te ajudar a configurar tudo.\nQualquer dúvida é só chamar!`

export default async function AdminFinanceiroPage() {
  const [f, atRisk] = await Promise.all([
    getAdminFinancials(),
    getAtRiskTenants(),
  ])

  const kpis = [
    {
      label: 'MRR',
      value: formatBRL(f.mrr),
      sub: 'receita mensal recorrente',
      icon: TrendingUp,
      color: 'text-green',
    },
    {
      label: 'Clientes ativos',
      value: f.activeCount,
      sub: 'pagando agora',
      icon: Users,
      color: 'text-white',
    },
    {
      label: 'Em risco',
      value: formatBRL(f.atRiskMrr),
      sub: `${f.pastDueCount} inadimplente${f.pastDueCount !== 1 ? 's' : ''}`,
      icon: AlertCircle,
      color: 'text-alert',
    },
    {
      label: 'Novos este mês',
      value: f.newThisMonth,
      sub: 'contas criadas',
      icon: CalendarPlus,
      color: 'text-blue-400',
    },
    {
      label: 'Churn este mês',
      value: f.churnThisMonth,
      sub: 'cancelamentos',
      icon: TrendingDown,
      color: f.churnThisMonth > 0 ? 'text-alert' : 'text-slate',
    },
  ]

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Financeiro</h1>
        <p className="font-body text-sm text-slate mt-0.5">Saúde financeira do SaaS</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpis.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-slate uppercase tracking-widest">{label}</span>
              <Icon size={15} className={color} />
            </div>
            <span className={`font-display font-black text-3xl leading-none ${color}`}>{value}</span>
            <span className="font-body text-xs text-slate">{sub}</span>
          </div>
        ))}
      </div>

      {/* MRR por plano */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Receita por plano</h2>
        <div className="flex flex-col gap-3">
          {f.mrrByPlan.map(({ plan, count, revenue }) => {
            const pct = f.mrr > 0 ? Math.round((revenue / f.mrr) * 100) : 0
            return (
              <div key={plan} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-white">{PLAN_LABEL[plan]}</span>
                    <span className="font-body text-xs text-slate">{count} cliente{count !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="font-body text-sm font-semibold text-white">{formatBRL(revenue)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full bg-green transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {f.mrr === 0 && (
            <p className="font-body text-xs text-slate">Nenhum cliente ativo ainda.</p>
          )}
        </div>
      </section>

      {/* Distribuição */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Distribuição de contas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Trial',        value: f.trialCount,    color: 'text-blue-400' },
            { label: 'Ativo',        value: f.activeCount,   color: 'text-green' },
            { label: 'Inadimplente', value: f.pastDueCount,  color: 'text-alert' },
            { label: 'Cancelado',    value: f.canceledCount, color: 'text-slate' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-1 rounded-lg bg-surface/50 p-3">
              <span className={`font-display font-black text-2xl leading-none ${color}`}>{value}</span>
              <span className="font-body text-xs text-slate">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Alertas de risco */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-white text-sm">Alertas de risco</h2>
          {atRisk.length > 0 && (
            <span className="font-body text-xs bg-alert/15 text-alert px-2 py-0.5 rounded-full">
              {atRisk.length} sem atividade
            </span>
          )}
        </div>

        {atRisk.length === 0 ? (
          <p className="font-body text-xs text-slate">
            Nenhum cliente inativo há mais de 7 dias. Boa sinal!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {atRisk.map(t => {
              const waText = encodeURIComponent(WELCOME_TEMPLATE(t.name))
              const waPhone = t.phone?.replace(/\D/g, '')
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-alert/20 bg-alert/5 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <Link
                      href={`/admin/clientes/${t.id}`}
                      className="font-body text-sm font-semibold text-white hover:text-green transition-colors truncate"
                    >
                      {t.name}
                    </Link>
                    <span className="font-body text-xs text-slate">
                      {formatLastSeen(t.daysSinceLogin)}
                    </span>
                  </div>
                  {waPhone && (
                    <a
                      href={`https://wa.me/55${waPhone}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-green/30 bg-green/10 px-3 py-1.5 font-body text-xs text-green hover:bg-green/20 transition-colors"
                    >
                      <MessageCircle size={12} />
                      Chamar
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
