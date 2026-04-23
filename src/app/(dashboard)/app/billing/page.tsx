import { getUserTenants } from '@/server/queries/tenants'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Check, Zap } from 'lucide-react'
import { SubscribeForm } from './subscribe-form'

const PLANS = [
  {
    code: 'starter',
    name: 'Starter',
    price: 97,
    features: ['Até 30 veículos', 'CRM ilimitado', '2 usuários', 'Suporte por e-mail'],
  },
  {
    code: 'pro',
    name: 'Pro',
    price: 147,
    highlight: true,
    features: ['Até 100 veículos', 'CRM ilimitado', '5 usuários', 'Fotos ilimitadas', 'Suporte prioritário'],
  },
  {
    code: 'elite',
    name: 'Elite',
    price: 297,
    features: ['Veículos ilimitados', 'CRM ilimitado', 'Usuários ilimitados', 'Fotos ilimitadas', 'Suporte VIP WhatsApp'],
  },
]

function trialDaysLeft(createdAt: string) {
  const expires = new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)))
}

export default async function BillingPage() {
  const memberships = await getUserTenants()
  if (!memberships.length) redirect('/onboarding')

  const tenant = memberships[0].tenants
  const admin  = createAdminClient()

  const { data: tenantData } = await admin
    .from('tenants')
    .select('status, plan_code, created_at, asaas_subscription_id')
    .eq('id', tenant.id)
    .single()

  const status   = tenantData?.status ?? 'trial'
  const planCode = tenantData?.plan_code ?? 'trial'
  const daysLeft = status === 'trial' ? trialDaysLeft(tenantData?.created_at ?? '') : null
  const isActive = status === 'active'

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Plano e cobrança</h1>
        <p className="font-body text-sm text-slate mt-0.5">Gerencie sua assinatura do Carvys</p>
      </div>

      {/* Status atual */}
      {status === 'trial' && (
        <div className="flex items-center gap-3 rounded-xl border border-green/20 bg-green/5 px-5 py-4">
          <Zap size={16} className="text-green shrink-0" />
          <p className="font-body text-sm text-white">
            Você está no período de trial.{' '}
            <span className="font-semibold text-green">
              {daysLeft === 0 ? 'Expira hoje' : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
            </span>
            {' '}— assine agora para não perder o acesso.
          </p>
        </div>
      )}

      {status === 'past_due' && (
        <div className="flex items-center gap-3 rounded-xl border border-alert/20 bg-alert/5 px-5 py-4">
          <p className="font-body text-sm text-white">
            Seu acesso está suspenso por falta de pagamento. Regularize sua assinatura abaixo.
          </p>
        </div>
      )}

      {isActive && (
        <div className="flex items-center gap-3 rounded-xl border border-surface bg-deep px-5 py-4">
          <p className="font-body text-sm text-slate">
            Plano atual:{' '}
            <span className="font-semibold text-white capitalize">{planCode}</span>
            {' '}— assinatura ativa.
          </p>
        </div>
      )}

      {/* Planos */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map(plan => {
          const isCurrent = isActive && planCode === plan.code
          return (
            <div
              key={plan.code}
              className={`relative flex flex-col gap-5 rounded-xl p-5 ${
                plan.highlight
                  ? 'border-2 border-green bg-green/5'
                  : 'border border-surface bg-deep'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-green px-3 py-1 font-body text-xs font-bold text-void">
                    Mais popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="rounded-full bg-surface border border-surface px-3 py-1 font-body text-xs text-slate">
                    Plano atual
                  </span>
                </div>
              )}

              <div>
                <p className="font-display font-bold text-white text-base">{plan.name}</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="font-body text-xs text-slate">R$</span>
                  <span className="font-display font-black text-3xl text-white leading-none">{plan.price}</span>
                  <span className="font-body text-xs text-slate mb-1">/mês</span>
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={12} className="shrink-0 text-green" />
                    <span className="font-body text-xs text-slate">{f}</span>
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <SubscribeForm planCode={plan.code} planName={plan.name} highlight={!!plan.highlight} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
