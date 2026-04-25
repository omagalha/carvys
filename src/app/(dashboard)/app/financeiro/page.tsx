import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
  Car, User, Plus, ArrowUpRight, ArrowDownRight, DollarSign,
  Wallet, Tag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getMonthlySales } from '@/server/queries/sales'
import { getMonthlyEntries, getVehicleExpenseSummaries } from '@/server/queries/financial-entries'
import { EntryModal } from './entry-modal'
import { RevenueChart, type WeekBar } from './revenue-chart'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const CATEGORY_LABELS: Record<string, string> = {
  ipva:       'IPVA',
  manutencao: 'Manutenção',
  lavagem:    'Lavagem',
  comissao:   'Comissão',
  marketing:  'Marketing',
  compra:     'Compra de veículo',
  entrada:    'Entrada',
  outros:     'Outros',
}

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
  if (!memberships[0].can_view_financials) redirect('/app/dashboard')

  const tenant = memberships[0].tenants as { id: string }

  const prevMonthNum = month === 1 ? 12 : month - 1
  const prevMonthYear = month === 1 ? year - 1 : year

  const [sales, entries, vehicleExpenses, prevSales, prevEntries] = await Promise.all([
    getMonthlySales(tenant.id, year, month),
    getMonthlyEntries(tenant.id, year, month),
    getVehicleExpenseSummaries(tenant.id),
    getMonthlySales(tenant.id, prevMonthYear, prevMonthNum),
    getMonthlyEntries(tenant.id, prevMonthYear, prevMonthNum),
  ])

  // Fetch vehicles for expense modal
  const { data: vehiclesRaw } = await supabase
    .from('vehicles')
    .select('id, brand, model, year_model')
    .eq('tenant_id', tenant.id)
    .order('brand')
  const vehicles = (vehiclesRaw ?? []) as { id: string; brand: string; model: string; year_model: number | null }[]

  // --- Calculations ---
  const salesRevenue  = sales.reduce((s, v) => s + v.sale_price, 0)
  const salesCost     = sales.reduce((s, v) => s + (v.cost_price ?? 0), 0)
  const incomeEntries = entries.filter(e => e.type === 'income')
  const expenseEntries = entries.filter(e => e.type === 'expense')

  const totalRevenue  = salesRevenue + incomeEntries.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((s, e) => s + e.amount, 0)
  const grossProfit   = salesRevenue - salesCost
  const netProfit     = grossProfit - totalExpenses + incomeEntries.reduce((s, e) => s + e.amount, 0)
  const caixa         = totalRevenue - totalExpenses

  // --- Unified extract: sales + entries sorted by date desc ---
  type ExtractItem = {
    id: string
    date: string
    label: string
    sub: string | null
    amount: number
    isPositive: boolean
  }

  const extract: ExtractItem[] = [
    ...sales.map(s => ({
      id: `sale-${s.id}`,
      date: s.sold_at,
      label: s.vehicles
        ? `${s.vehicles.brand} ${s.vehicles.model}${s.vehicles.year_model ? ` ${s.vehicles.year_model}` : ''}`
        : 'Venda de veículo',
      sub: s.leads ? s.leads.name : 'Venda direta',
      amount: s.sale_price,
      isPositive: true,
    })),
    ...entries.map(e => ({
      id: `entry-${e.id}`,
      date: e.date,
      label: e.description,
      sub: CATEGORY_LABELS[e.category] ?? e.category,
      amount: e.amount,
      isPositive: e.type === 'income',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // --- Expenses by category ---
  const byCategory = expenseEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const categorySorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const maxCategoryAmount = categorySorted[0]?.[1] ?? 1

  // --- Weekly chart aggregation ---
  function weeklyBuckets(
    salesData: typeof sales,
    entriesData: typeof entries,
    yr: number,
    mo: number,
  ) {
    const daysInMonth = new Date(yr, mo, 0).getDate()
    const ranges: [number, number, string][] = [
      [1, 7, 'S1'], [8, 14, 'S2'], [15, 21, 'S3'], [22, 28, 'S4'],
    ]
    if (daysInMonth > 28) ranges.push([29, daysInMonth, 'S5'])

    return ranges.map(([start, end, label]) => {
      const wSales = salesData.filter(s => {
        const d = new Date(s.sold_at).getDate()
        return d >= start && d <= end
      })
      const wEntries = entriesData.filter(e => {
        const d = parseInt(e.date.split('-')[2])
        return d >= start && d <= end
      })
      const income   = wSales.reduce((s, v) => s + v.sale_price, 0)
                     + wEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
      const expenses = wEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      return { label, income, expenses }
    })
  }

  const currentWeeks = weeklyBuckets(sales, entries, year, month)
  const prevWeeks    = weeklyBuckets(prevSales, prevEntries, prevMonthYear, prevMonthNum)

  const chartWeeks: WeekBar[] = currentWeeks.map((w, i) => ({
    ...w,
    prevIncome: prevWeeks[i]?.income ?? 0,
  }))

  // --- Sales by vehicle (for cross-referencing expenses) ---
  const soldVehicleIds = new Set(sales.map(s => s.vehicle_id))

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">

      {/* Header + Nav */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-white text-2xl">Financeiro</h1>
            <p className="font-body text-sm text-slate mt-0.5">{MONTH_NAMES[month - 1]} {year}</p>
          </div>
          <TrendingUp size={20} className="text-green" />
        </div>

        {/* Month nav */}
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
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4 hover:border-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-slate uppercase tracking-widest">Faturamento</span>
            <ArrowUpRight size={14} className="text-green" />
          </div>
          <span className="font-display font-bold text-white text-base md:text-xl leading-none">{fmt(totalRevenue)}</span>
          <span className="font-body text-xs text-slate">{sales.length} venda{sales.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4 hover:border-alert/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-slate uppercase tracking-widest">Despesas</span>
            <ArrowDownRight size={14} className="text-alert" />
          </div>
          <span className="font-display font-bold text-white text-base md:text-xl leading-none">{fmt(totalExpenses)}</span>
          <span className="font-body text-xs text-slate">{expenseEntries.length} lançamento{expenseEntries.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4 hover:border-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-slate uppercase tracking-widest">Lucro</span>
            <TrendingUp size={14} className={netProfit >= 0 ? 'text-green' : 'text-alert'} />
          </div>
          <span className={`font-display font-bold text-base md:text-xl leading-none ${netProfit >= 0 ? 'text-green' : 'text-alert'}`}>
            {fmt(netProfit)}
          </span>
          <span className="font-body text-xs text-slate">
            {totalRevenue > 0 ? `${Math.round((netProfit / totalRevenue) * 100)}% de margem` : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4 hover:border-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-slate uppercase tracking-widest">Caixa</span>
            <Wallet size={14} className="text-slate" />
          </div>
          <span className={`font-display font-bold text-base md:text-xl leading-none ${caixa >= 0 ? 'text-white' : 'text-alert'}`}>
            {fmt(caixa)}
          </span>
          <span className="font-body text-xs text-slate">entradas − despesas</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/vehicles"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Car size={15} />
          Registrar venda
        </Link>
        <EntryModal
          defaultType="expense"
          vehicles={vehicles}
          label="Registrar despesa"
          icon={<TrendingDown size={15} />}
          className="bg-alert/10 border border-alert/30 text-alert hover:bg-alert/20"
        />
        <EntryModal
          defaultType="income"
          vehicles={vehicles}
          label="Entrada manual"
          icon={<Plus size={15} />}
          className="bg-surface border border-surface text-white"
        />
      </div>

      {/* Chart */}
      <div className="flex flex-col gap-2">
        <h2 className="font-body font-semibold text-white text-sm">Entradas vs Saídas</h2>
        <RevenueChart weeks={chartWeeks} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

        {/* Extrato unificado */}
        <div className="flex flex-col gap-3">
          <h2 className="font-body font-semibold text-white text-sm">Movimentações</h2>

          {extract.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface py-16 text-center">
              <DollarSign size={24} className="text-slate" />
              <p className="font-body text-sm text-slate">Nenhuma movimentação neste mês</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {extract.map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-deep border border-surface px-4 py-3 hover:border-surface/80 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    item.isPositive ? 'bg-green/10' : 'bg-alert/10'
                  }`}>
                    {item.isPositive
                      ? <ArrowUpRight size={15} className="text-green" />
                      : <ArrowDownRight size={15} className="text-alert" />
                    }
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <span className="font-body font-medium text-white text-sm truncate">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {item.sub && (
                        <span className="font-body text-xs text-slate truncate">{item.sub}</span>
                      )}
                      <span className="font-body text-xs text-slate/40">·</span>
                      <span className="font-body text-xs text-slate shrink-0">
                        {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <span className={`font-body font-semibold text-sm shrink-0 ${
                    item.isPositive ? 'text-green' : 'text-alert'
                  }`}>
                    {item.isPositive ? '+' : '-'}{fmt(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: categoria + veículo */}
        <div className="flex flex-col gap-6">

          {/* Despesas por categoria */}
          <div className="flex flex-col gap-3">
            <h2 className="font-body font-semibold text-white text-sm">Por categoria</h2>

            {categorySorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface py-8 text-center">
                <Tag size={18} className="text-slate" />
                <p className="font-body text-xs text-slate">Sem despesas registradas</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
                {categorySorted.map(([cat, amount]) => {
                  const pct = Math.round((amount / maxCategoryAmount) * 100)
                  return (
                    <div key={cat} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-xs text-white">{CATEGORY_LABELS[cat] ?? cat}</span>
                        <span className="font-body text-xs text-slate">{fmt(amount)}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full bg-alert/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Despesas por veículo */}
          <div className="flex flex-col gap-3">
            <h2 className="font-body font-semibold text-white text-sm">Por veículo</h2>

            {vehicleExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface py-8 text-center">
                <Car size={18} className="text-slate" />
                <p className="font-body text-xs text-slate">Nenhuma despesa vinculada a veículo</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {vehicleExpenses.slice(0, 6).map(v => {
                  const sale = sales.find(s => s.vehicle_id === v.vehicle_id)
                  const purchaseCost = sale?.cost_price ?? 0
                  const totalInvested = purchaseCost + v.expenses
                  const salePrice = sale?.sale_price ?? 0
                  const realProfit = salePrice > 0 ? salePrice - totalInvested : null

                  return (
                    <div key={v.vehicle_id} className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4">
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                          <Car size={14} className="text-slate" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-body font-semibold text-white text-xs truncate">
                            {v.brand} {v.model}{v.year_model ? ` ${v.year_model}` : ''}
                          </span>
                          <span className="font-body text-xs text-slate">{fmt(v.expenses)} em despesas</span>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="flex flex-col gap-1 border-t border-surface pt-3">
                        {v.entries.slice(0, 3).map((entry, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="font-body text-xs text-slate">{CATEGORY_LABELS[entry.category] ?? entry.category}</span>
                            <span className="font-body text-xs text-slate">{fmt(entry.amount)}</span>
                          </div>
                        ))}
                        {v.entries.length > 3 && (
                          <span className="font-body text-xs text-slate/50">+{v.entries.length - 3} mais</span>
                        )}
                      </div>

                      {/* Se vendido: mostrar lucro real */}
                      {realProfit !== null && (
                        <div className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2">
                          <span className="font-body text-xs text-slate">Lucro real</span>
                          <span className={`font-body text-xs font-semibold ${realProfit >= 0 ? 'text-green' : 'text-alert'}`}>
                            {realProfit >= 0 ? '+' : ''}{fmt(realProfit)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
