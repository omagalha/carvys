'use client'

import { useTransition } from 'react'
import { updateTenantStatus, updateTenantPlan } from '@/server/actions/admin'

const STATUSES = [
  { value: 'trial',    label: 'Trial' },
  { value: 'active',   label: 'Ativo' },
  { value: 'past_due', label: 'Inadimplente' },
  { value: 'canceled', label: 'Cancelado' },
]

const PLANS = [
  { value: 'trial',   label: 'Trial' },
  { value: 'starter', label: 'Starter — R$97/mês' },
  { value: 'pro',     label: 'Pro — R$147/mês' },
  { value: 'elite',   label: 'Elite — R$297/mês' },
]

interface Props {
  tenantId: string
  currentStatus: string
  currentPlan: string
}

export function TenantControls({ tenantId, currentStatus, currentPlan }: Props) {
  const [pendingStatus, startStatus] = useTransition()
  const [pendingPlan,   startPlan]   = useTransition()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-slate">Status da conta</label>
        <div className="flex items-center gap-2">
          <select
            defaultValue={currentStatus}
            disabled={pendingStatus}
            onChange={e => startStatus(async () => { await updateTenantStatus(tenantId, e.target.value) })}
            className="h-10 flex-1 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors disabled:opacity-50"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {pendingStatus && <span className="font-body text-xs text-slate">Salvando...</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-slate">Plano</label>
        <div className="flex items-center gap-2">
          <select
            defaultValue={currentPlan}
            disabled={pendingPlan}
            onChange={e => startPlan(async () => { await updateTenantPlan(tenantId, e.target.value) })}
            className="h-10 flex-1 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors disabled:opacity-50"
          >
            {PLANS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {pendingPlan && <span className="font-body text-xs text-slate">Salvando...</span>}
        </div>
      </div>
    </div>
  )
}
