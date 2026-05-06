import Link from 'next/link'
import { Package, AlertTriangle, Users, TrendingUp, ArrowUpRight, Plus, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getExpiryStatus } from '@/server/queries/products'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

interface Props {
  tenantId: string
  firstName: string
}

type ProductRow = {
  id: string
  name: string
  quantity: number
  min_quantity: number
  expiry_date: string | null
}

type SaleRow = {
  id: string
  contact_name: string
  quantity: number
  unit_price: number
  sold_at: string
  products: { name: string } | null
}

export async function MakeupDashboard({ tenantId, firstName }: Props) {
  const supabase = await createClient()
  const now = new Date()
  const hour = now.getHours()
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const fullDate = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const [productsRes, monthlySalesRes, recentSalesRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, quantity, min_quantity, expiry_date')
      .eq('tenant_id', tenantId)
      .order('name'),
    supabase
      .from('product_sales')
      .select('quantity, unit_price')
      .eq('tenant_id', tenantId)
      .gte('sold_at', monthStart)
      .lt('sold_at', monthEnd),
    supabase
      .from('product_sales')
      .select('id, contact_name, quantity, unit_price, sold_at, products(name)')
      .eq('tenant_id', tenantId)
      .order('sold_at', { ascending: false })
      .limit(5),
  ])

  const products = (productsRes.data ?? []) as ProductRow[]
  const monthlySales = monthlySalesRes.data ?? []
  const recentSales = (recentSalesRes.data ?? []) as SaleRow[]

  const expiredProducts  = products.filter(p => getExpiryStatus(p.expiry_date) === 'expired')
  const expiringProducts = products.filter(p => getExpiryStatus(p.expiry_date) === 'expiring')
  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity)

  const monthlyRevenue = monthlySales.reduce((s, r) => s + r.quantity * r.unit_price, 0)
  const monthlyCount   = monthlySales.length

  let heroMessage: string
  if (expiredProducts.length > 0) {
    heroMessage = `${expiredProducts.length} produto${expiredProducts.length !== 1 ? 's' : ''} vencido${expiredProducts.length !== 1 ? 's' : ''} para revisar.`
  } else if (expiringProducts.length > 0) {
    heroMessage = `${expiringProducts.length} produto${expiringProducts.length !== 1 ? 's' : ''} vencendo em até 30 dias.`
  } else if (lowStockProducts.length > 0) {
    heroMessage = `${lowStockProducts.length} produto${lowStockProducts.length !== 1 ? 's' : ''} com estoque baixo.`
  } else {
    heroMessage = 'Tudo em ordem. Bom dia de vendas!'
  }

  const kpis = [
    { label: 'Produtos',      value: products.length,          icon: Package,       href: '/app/produtos', hint: 'cadastrados' },
    { label: 'Vencendo',      value: expiringProducts.length,  icon: Clock,         href: '/app/produtos', hint: '≤ 30 dias' },
    { label: 'Estoque baixo', value: lowStockProducts.length,  icon: AlertTriangle, href: '/app/estoque',  hint: 'abaixo do mínimo' },
  ]

  const alertProducts = [
    ...expiredProducts,
    ...expiringProducts,
    ...lowStockProducts.filter(p => !expiredProducts.includes(p) && !expiringProducts.includes(p)),
  ].slice(0, 6)

  return (
    <div className="flex gap-5 p-4 md:p-6 items-start">

      {/* Coluna principal */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-green p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-void/10" />
          <div className="pointer-events-none absolute -bottom-6 right-10 h-24 w-24 rounded-full bg-void/10" />
          <div className="relative flex flex-col gap-4">
            <div>
              <p className="font-body text-sm text-void/60 capitalize">{weekday}, {fullDate}</p>
              <h1 className="font-display font-black text-void text-2xl md:text-3xl mt-0.5">
                {greeting(hour)}, {firstName}!
              </h1>
              <p className="font-body text-sm text-void/70 mt-1">{heroMessage}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/app/produtos/novo"
                className="flex items-center gap-1.5 h-9 rounded-lg bg-void/15 hover:bg-void/25 px-4 font-body text-sm font-semibold text-void transition-colors"
              >
                <Plus size={14} />
                Novo produto
              </Link>
              <Link
                href="/app/estoque"
                className="flex items-center gap-1.5 h-9 rounded-lg bg-void/10 hover:bg-void/20 px-4 font-body text-sm text-void/80 transition-colors"
              >
                <Package size={14} />
                Estoque
              </Link>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {(expiredProducts.length > 0 || expiringProducts.length > 0 || lowStockProducts.length > 0) && (
          <div className="flex flex-col gap-2">
            {expiredProducts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-alert/30 bg-alert/10 px-4 py-3">
                <AlertTriangle size={14} className="text-alert shrink-0" />
                <p className="font-body text-sm text-alert">
                  <span className="font-semibold">{expiredProducts.length} produto{expiredProducts.length !== 1 ? 's' : ''} vencido{expiredProducts.length !== 1 ? 's' : ''}</span>
                  {' '}— verifique o estoque.
                </p>
                <Link href="/app/produtos" className="ml-auto font-body text-xs text-alert/80 hover:text-alert transition-colors shrink-0">Ver →</Link>
              </div>
            )}
            {expiringProducts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <Clock size={14} className="text-yellow-400 shrink-0" />
                <p className="font-body text-sm text-yellow-300">
                  <span className="font-semibold">{expiringProducts.length} produto{expiringProducts.length !== 1 ? 's' : ''} vencendo</span>
                  {' '}em até 30 dias.
                </p>
                <Link href="/app/produtos" className="ml-auto font-body text-xs text-yellow-400/80 hover:text-yellow-400 transition-colors shrink-0">Ver →</Link>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <Package size={14} className="text-yellow-400 shrink-0" />
                <p className="font-body text-sm text-yellow-300">
                  <span className="font-semibold">{lowStockProducts.length} produto{lowStockProducts.length !== 1 ? 's' : ''} com estoque baixo</span>.
                </p>
                <Link href="/app/estoque" className="ml-auto font-body text-xs text-yellow-400/80 hover:text-yellow-400 transition-colors shrink-0">Ver →</Link>
              </div>
            )}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {kpis.map(({ label, value, icon: Icon, href, hint }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4 hover:border-green/30 hover:bg-green/5 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <Icon size={15} className="text-slate group-hover:text-green transition-colors" />
                <ArrowUpRight size={12} className="text-surface group-hover:text-green transition-colors" />
              </div>
              <div>
                <span className="font-display font-black text-white text-3xl leading-none">{value}</span>
                <p className="font-body text-[11px] text-slate mt-1">{hint}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Vendas recentes */}
        <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-green" />
              <h2 className="font-body font-semibold text-white text-sm">Vendas recentes</h2>
            </div>
            <Link href="/app/clientes" className="font-body text-xs text-slate hover:text-green transition-colors">
              Ver clientes →
            </Link>
          </div>
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Package size={24} className="text-green/40" />
              <p className="font-body text-sm text-slate">Nenhuma venda ainda.</p>
              <Link href="/app/produtos" className="font-body text-xs text-green hover:underline">
                Ver produtos →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-3 rounded-lg border border-surface bg-surface/30 px-3 py-2.5">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="font-body text-sm text-white truncate">{sale.contact_name}</span>
                    <span className="font-body text-[11px] text-slate truncate">{sale.products?.name ?? '—'}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-body text-sm font-semibold text-white">{fmt(sale.quantity * sale.unit_price)}</span>
                    <span className="font-body text-[11px] text-slate">{new Date(sale.sold_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Financeiro do mês */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green" />
              <h2 className="font-body font-semibold text-white text-sm capitalize">{monthName} — resultado</h2>
            </div>
            <Link href="/app/financeiro" className="flex items-center gap-1 font-body text-xs text-slate hover:text-green transition-colors">
              Ver tudo <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
              <span className="font-body text-xs text-slate uppercase tracking-widest">Faturamento</span>
              <span className="font-display font-black text-white text-lg md:text-2xl leading-none">{fmt(monthlyRevenue)}</span>
              <span className="font-body text-xs text-slate">
                {monthlyCount === 0 ? 'Nenhuma venda ainda' : `${monthlyCount} venda${monthlyCount !== 1 ? 's' : ''} este mês`}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
              <span className="font-body text-xs text-slate uppercase tracking-widest">Produtos</span>
              <span className="font-display font-black text-white text-lg md:text-2xl leading-none">{products.length}</span>
              <span className="font-body text-xs text-slate">cadastrados</span>
            </div>
          </div>
        </section>
      </div>

      {/* Painel lateral — Alertas */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-3 sticky top-6">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-white text-sm">Atenção</h2>
          <Link href="/app/produtos" className="font-body text-xs text-slate hover:text-green transition-colors">
            Ver todos
          </Link>
        </div>

        {alertProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface py-10 text-center">
            <Package size={20} className="text-slate" />
            <p className="font-body text-xs text-slate">Nenhum alerta no momento</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alertProducts.map(p => {
              const status     = getExpiryStatus(p.expiry_date)
              const isLowStock = p.quantity <= p.min_quantity
              return (
                <Link
                  key={p.id}
                  href={`/app/produtos/${p.id}`}
                  className="group flex flex-col gap-1.5 rounded-xl bg-deep border border-surface p-3 hover:border-green/30 transition-all duration-200"
                >
                  <p className="font-body text-sm font-semibold text-white truncate group-hover:text-green transition-colors">{p.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {status === 'expired' && (
                      <span className="font-body text-[10px] px-1.5 py-0.5 rounded-full bg-alert/15 text-alert">Vencido</span>
                    )}
                    {status === 'expiring' && (
                      <span className="font-body text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Vencendo</span>
                    )}
                    {isLowStock && (
                      <span className="font-body text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Estoque baixo</span>
                    )}
                    <span className="font-body text-[10px] text-slate">{p.quantity} un.</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </aside>
    </div>
  )
}
