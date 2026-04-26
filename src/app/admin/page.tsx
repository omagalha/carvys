import { getAllTenants } from '@/server/queries/admin'
import { Shield, Store, Car, Users, TrendingUp, Clock } from 'lucide-react'

const PLAN_BADGE: Record<string, string> = {
  trial:   'bg-surface text-slate border-surface',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pro:     'bg-green/10 text-green border-green/20',
  elite:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-green/10 text-green',
  trial:     'bg-yellow-500/10 text-yellow-400',
  cancelled: 'bg-alert/10 text-alert',
  suspended: 'bg-alert/10 text-alert',
}

const STATUS_LABEL: Record<string, string> = {
  active:    'ativo',
  trial:     'trial',
  cancelled: 'cancelado',
  suspended: 'suspenso',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
}

function fmtRelative(iso: string | null) {
  if (!iso) return 'nunca acessou'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 7)  return `${days}d atrás`
  if (days < 30) return `${Math.floor(days / 7)}sem atrás`
  return `${Math.floor(days / 30)}m atrás`
}

export default async function AdminPage() {
  const tenants = await getAllTenants()

  const totalVehicles = tenants.reduce((s, t) => s + t.vehicle_count, 0)
  const totalLeads    = tenants.reduce((s, t) => s + t.lead_count, 0)
  const byPlan        = tenants.reduce<Record<string, number>>((acc, t) => {
    acc[t.plan_code] = (acc[t.plan_code] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 border border-green/20">
          <Shield size={18} className="text-green" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-2xl leading-none">Painel Admin</h1>
          <p className="font-body text-xs text-slate mt-1">{tenants.length} loja{tenants.length !== 1 ? 's' : ''} cadastradas</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4">
          <Store size={14} className="text-slate" />
          <div>
            <p className="font-display font-black text-white text-3xl leading-none">{tenants.length}</p>
            <p className="font-body text-xs text-slate mt-1">lojas totais</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4">
          <TrendingUp size={14} className="text-green" />
          <div>
            <p className="font-display font-black text-white text-3xl leading-none">{byPlan.pro ?? 0}</p>
            <p className="font-body text-xs text-slate mt-1">plano pro · {byPlan.elite ?? 0} elite</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4">
          <Car size={14} className="text-slate" />
          <div>
            <p className="font-display font-black text-white text-3xl leading-none">{totalVehicles}</p>
            <p className="font-body text-xs text-slate mt-1">veículos</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4">
          <Users size={14} className="text-slate" />
          <div>
            <p className="font-display font-black text-white text-3xl leading-none">{totalLeads}</p>
            <p className="font-body text-xs text-slate mt-1">leads gerados</p>
          </div>
        </div>
      </div>

      {/* Lista de lojas */}
      <div className="flex flex-col gap-3">
        <h2 className="font-body font-semibold text-white text-sm">Lojas</h2>

        <div className="flex flex-col gap-2">
          {tenants.map(t => (
            <div key={t.id} className="rounded-xl bg-deep border border-surface p-4 flex flex-col gap-3 hover:border-surface/80 transition-colors">

              {/* Linha 1: nome + badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-body font-semibold text-white text-sm truncate">{t.name}</span>
                  <span className="font-body text-xs text-slate/50">/{t.slug}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`font-body text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${PLAN_BADGE[t.plan_code] ?? PLAN_BADGE.trial}`}>
                    {t.plan_code}
                  </span>
                  <span className={`font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[t.status] ?? 'bg-surface text-slate'}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </div>
              </div>

              {/* Linha 2: dono */}
              {t.owner && (
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-body text-[10px] font-bold text-slate">
                    {(t.owner.full_name ?? t.owner.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0 min-w-0 flex-1">
                    <span className="font-body text-xs text-white truncate">
                      {t.owner.full_name ?? 'Sem nome'}
                    </span>
                    <span className="font-body text-[10px] text-slate truncate">
                      {t.owner.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock size={10} className="text-slate/40" />
                    <span className="font-body text-[10px] text-slate/60">{fmtRelative(t.owner.last_sign_in_at)}</span>
                  </div>
                </div>
              )}

              {/* Linha 3: métricas */}
              <div className="flex items-center gap-4 pt-2 border-t border-surface">
                <div className="flex items-center gap-1.5">
                  <Car size={11} className="text-slate/40" />
                  <span className="font-body text-xs text-slate">{t.vehicle_count} veíc.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-slate/40" />
                  <span className="font-body text-xs text-slate">{t.lead_count} leads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-slate/40" />
                  <span className="font-body text-xs text-slate">{t.member_count} membros</span>
                </div>
                <span className="font-body text-[10px] text-slate/30 ml-auto">{fmtDate(t.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
