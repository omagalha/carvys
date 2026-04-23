import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TrendingUp, ChevronLeft, ChevronRight, Car, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getMonthlySales, calcSummary } from '@/server/queries/sales'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>
}) {
  const { m } = await searchParams
  const now = new Date()

  const year  = m ? parseInt(m.split('-')[0]) : now.getFullYear()
  const month = m ? parseInt(m.split('-')[1]) : now.getMonth() + 1

  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  const prevParam = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const nextParam = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const sales = await getMonthlySales(tenant.id, year, month)
  const summary = calcSummary(sales)

  const kpis = [
    { label: 'Faturamento',  value: fmt(summary.revenue),  sub: `${summary.count} venda${summary.count !== 1 ? 's' : ''}` },
    { label: 'Lucro',        value: fmt(summary.profit),   sub: summary.revenue > 0 ? `${Math.round((summary.profit / summary.revenue) * 100)}% de margem` : '—' },
    { label: 'Ticket médio', value: fmt(summary.avgTicket), sub: 'por veículo' },
  ]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Financeiro</h1>
          <p className="font-body text-sm text-slate mt-0.5">{MONTH_NAMES[month - 1]} {year}</p>
        </div>
        <TrendingUp size={20} className="text-green" />
      </div>

      {/* Navegação de mês */}
      <div className="flex items-center justify-between rounded-xl bg-deep border border-surface px-4 py-3">
        <Link
          href={`/app/financeiro?m=${prevParam}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <ChevronLeft size={16} className="text-slate" />
        </Link>
        <span className="font-body font-medium text-white text-sm">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Link
          href={isCurrentMonth ? '#' : `/app/financeiro?m=${nextParam}`}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface'}`}
          aria-disabled={isCurrentMonth}
        >
          <ChevronRight size={16} className="text-slate" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map(({ label, value, sub }) => (
          <div key={label} className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-5">
            <span className="font-body text-xs text-slate uppercase tracking-widest">{label}</span>
            <span className="font-display font-bold text-white text-2xl leading-none">{value}</span>
            <span className="font-body text-xs text-slate">{sub}</span>
          </div>
        ))}
      </div>

      {/* Lista de vendas */}
      <div className="flex flex-col gap-3">
        <h2 className="font-body font-semibold text-white text-sm">Vendas do mês</h2>

        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface py-12 text-center">
            <TrendingUp size={24} className="text-slate" />
            <p className="font-body text-sm text-slate">Nenhuma venda registrada neste mês</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sales.map(sale => {
              const profit = sale.sale_price - (sale.cost_price ?? 0)
              const hasMargin = sale.cost_price != null
              return (
                <div key={sale.id} className="flex items-center gap-4 rounded-xl bg-deep border border-surface p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green/10">
                    <Car size={16} className="text-green" />
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <span className="font-body font-semibold text-white text-sm truncate">
                      {sale.vehicles
                        ? `${sale.vehicles.brand} ${sale.vehicles.model}${sale.vehicles.year_model ? ` ${sale.vehicles.year_model}` : ''}`
                        : 'Veículo'}
                    </span>
                    <div className="flex items-center gap-2">
                      {sale.leads ? (
                        <span className="font-body text-xs text-slate flex items-center gap-1 truncate">
                          <User size={10} />
                          {sale.leads.name}
                        </span>
                      ) : (
                        <span className="font-body text-xs text-slate">Venda direta</span>
                      )}
                      <span className="font-body text-xs text-slate">·</span>
                      <span className="font-body text-xs text-slate shrink-0">
                        {new Date(sale.sold_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-body font-semibold text-white text-sm">{fmt(sale.sale_price)}</span>
                    {hasMargin && (
                      <span className={`font-body text-xs ${profit >= 0 ? 'text-green' : 'text-alert'}`}>
                        {profit >= 0 ? '+' : ''}{fmt(profit)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
