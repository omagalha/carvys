import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Car, Users, Bell, TrendingUp, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getMonthlySales, calcSummary } from '@/server/queries/sales'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string; name: string }

  const now = new Date()

  const [vehiclesRes, leadsRes, followUpsRes, sales] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('status', 'available'),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .neq('stage', 'won')
      .neq('stage', 'lost'),
    supabase
      .from('follow_ups')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('status', 'pending'),
    getMonthlySales(tenant.id, now.getFullYear(), now.getMonth() + 1),
  ])

  const { revenue, profit, count: soldCount } = calcSummary(sales)
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

  const kpis = [
    { label: 'Veículos Disponíveis', value: vehiclesRes.count ?? 0,  icon: Car,       hint: 'em estoque',  href: '/app/vehicles' },
    { label: 'Leads Ativos',         value: leadsRes.count ?? 0,     icon: Users,     hint: 'no funil',    href: '/app/leads' },
    { label: 'Tarefas Pendentes',    value: followUpsRes.count ?? 0, icon: Bell,      hint: 'follow-ups',  href: '/app/follow-ups' },
  ]

  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Dashboard</h1>
        <p className="font-body text-sm text-slate mt-0.5">{tenant.name}</p>
      </div>

      {/* KPIs operacionais */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon, hint, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5 hover:border-slate/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-slate uppercase tracking-widest">{label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green/10">
                <Icon size={16} className="text-green" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display font-bold text-white text-4xl leading-none">{value}</span>
              <span className="font-body text-xs text-slate mb-1">{hint}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bloco financeiro do mês */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-white text-sm capitalize">
            Financeiro — {monthName}
          </h2>
          <Link
            href="/app/financeiro"
            className="flex items-center gap-1 font-body text-xs text-green hover:underline"
          >
            Ver detalhes
            <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Faturamento */}
          <div className="col-span-3 sm:col-span-1 flex flex-col gap-2 rounded-xl bg-deep border border-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-slate uppercase tracking-widest">Faturamento</span>
              <TrendingUp size={14} className="text-green" />
            </div>
            <span className="font-display font-bold text-white text-2xl leading-none">{fmt(revenue)}</span>
            <span className="font-body text-xs text-slate">{soldCount} venda{soldCount !== 1 ? 's' : ''} no mês</span>
          </div>

          {/* Lucro */}
          <div className="col-span-3 sm:col-span-1 flex flex-col gap-2 rounded-xl bg-deep border border-surface p-5">
            <span className="font-body text-xs text-slate uppercase tracking-widest">Lucro</span>
            <span className={`font-display font-bold text-2xl leading-none ${profit >= 0 ? 'text-green' : 'text-alert'}`}>
              {fmt(profit)}
            </span>
            <span className="font-body text-xs text-slate">
              {revenue > 0 ? `${margin}% de margem` : 'sem vendas ainda'}
            </span>
          </div>

          {/* Vendas do mês — lista rápida */}
          <div className="col-span-3 sm:col-span-1 flex flex-col gap-2 rounded-xl bg-deep border border-surface p-5">
            <span className="font-body text-xs text-slate uppercase tracking-widest">Últimas vendas</span>
            {sales.length === 0 ? (
              <span className="font-body text-xs text-slate mt-1">Nenhuma este mês</span>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                {sales.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="font-body text-xs text-white truncate">
                      {s.vehicles ? `${s.vehicles.brand} ${s.vehicles.model}` : 'Veículo'}
                    </span>
                    <span className="font-body text-xs text-slate shrink-0 ml-2">{fmt(s.sale_price)}</span>
                  </div>
                ))}
                {sales.length > 3 && (
                  <span className="font-body text-[10px] text-slate">+{sales.length - 3} mais</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
