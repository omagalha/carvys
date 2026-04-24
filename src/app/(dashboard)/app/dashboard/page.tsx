import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Car, Users, Bell, TrendingUp, ArrowUpRight, Plus, Clock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getMonthlySales, calcSummary } from '@/server/queries/sales'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function coverUrl(path: string | null) {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicle-photos/${path}`
}

const TYPE_LABEL: Record<string, string> = {
  call:      'Ligar',
  whatsapp:  'WhatsApp',
  visit:     'Visita',
  email:     'E-mail',
  follow_up: 'Follow-up',
}

const STATUS_COLOR: Record<string, string> = {
  available: 'bg-green/15 text-green',
  reserved:  'bg-yellow-500/15 text-yellow-400',
  draft:     'bg-surface text-slate',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponível',
  reserved:  'Reservado',
  draft:     'Rascunho',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant    = memberships[0].tenants as { id: string; name: string }
  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'você'

  const now       = new Date()
  const hour      = now.getHours()
  const weekday   = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const fullDate  = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  const [vehiclesRes, leadsRes, pendingRes, todayRes, sales, vehiclesList] = await Promise.all([
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
    supabase
      .from('follow_ups')
      .select('id, title, due_at, type, leads(name)')
      .eq('tenant_id', tenant.id)
      .eq('status', 'pending')
      .gte('due_at', todayStart)
      .lt('due_at', todayEnd)
      .order('due_at', { ascending: true })
      .limit(5),
    getMonthlySales(tenant.id, now.getFullYear(), now.getMonth() + 1),
    supabase
      .from('vehicles')
      .select('id, brand, model, year_model, price, status, cover_image_path')
      .eq('tenant_id', tenant.id)
      .neq('status', 'archived')
      .neq('status', 'sold')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const { revenue, profit, count: soldCount } = calcSummary(sales)
  const margin       = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const todayTasks   = todayRes.data ?? []
  const pendingCount = pendingRes.count ?? 0
  const leadsCount   = leadsRes.count ?? 0
  const vehicles     = vehiclesList.data ?? []

  const kpis = [
    { label: 'No estoque',    value: vehiclesRes.count ?? 0, icon: Car,   href: '/app/vehicles',   hint: 'disponíveis' },
    { label: 'Leads no funil', value: leadsCount,            icon: Users, href: '/app/leads',      hint: 'ativos' },
    { label: 'Tarefas',       value: pendingCount,           icon: Bell,  href: '/app/follow-ups', hint: 'pendentes' },
  ]

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
              <p className="font-body text-sm text-void/70 mt-1">
                {todayTasks.length > 0
                  ? `Você tem ${todayTasks.length} tarefa${todayTasks.length !== 1 ? 's' : ''} para hoje${leadsCount > 0 ? ` e ${leadsCount} lead${leadsCount !== 1 ? 's' : ''} no funil` : ''}.`
                  : leadsCount > 0
                    ? `${leadsCount} lead${leadsCount !== 1 ? 's' : ''} esperando atenção. Hora de fechar negócio.`
                    : 'Tudo tranquilo. Que tal prospectar novos clientes?'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/app/leads/novo"
                className="flex items-center gap-1.5 h-9 rounded-lg bg-void/15 hover:bg-void/25 px-4 font-body text-sm font-semibold text-void transition-colors"
              >
                <Plus size={14} />
                Novo lead
              </Link>
              <Link
                href="/app/vehicles/novo"
                className="flex items-center gap-1.5 h-9 rounded-lg bg-void/10 hover:bg-void/20 px-4 font-body text-sm text-void/80 transition-colors"
              >
                <Plus size={14} />
                Veículo
              </Link>
            </div>
          </div>
        </div>

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

        {/* Agenda do dia */}
        <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-green" />
              <h2 className="font-body font-semibold text-white text-sm">Agenda de hoje</h2>
            </div>
            <Link href="/app/follow-ups/novo" className="flex items-center gap-1 font-body text-xs text-slate hover:text-green transition-colors">
              <Plus size={11} />
              Agendar
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle2 size={24} className="text-green/40" />
              <p className="font-body text-sm text-slate">Nenhuma tarefa para hoje.</p>
              <Link href="/app/follow-ups/novo" className="font-body text-xs text-green hover:underline">
                Agendar um follow-up →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayTasks.map((task: {
                id: string; title: string; due_at: string; type: string; leads: { name: string }[] | null
              }) => {
                const leadName = Array.isArray(task.leads) ? task.leads[0]?.name : null
                return (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-surface bg-surface/30 px-3 py-2.5 hover:border-green/20 transition-colors">
                  <span className="font-display font-bold text-green text-xs w-10 shrink-0">{formatTime(task.due_at)}</span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="font-body text-sm text-white truncate">{task.title}</span>
                    {leadName && <span className="font-body text-[11px] text-slate truncate">{leadName}</span>}
                  </div>
                  <span className="font-body text-[10px] text-slate shrink-0 bg-surface px-2 py-0.5 rounded-full">
                    {TYPE_LABEL[task.type] ?? task.type}
                  </span>
                </div>
              )})}
              {pendingCount > todayTasks.length && (
                <Link href="/app/follow-ups" className="font-body text-xs text-slate hover:text-green transition-colors text-center pt-1">
                  +{pendingCount - todayTasks.length} pendente{pendingCount - todayTasks.length !== 1 ? 's' : ''} →
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Financeiro */}
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
              <span className="font-display font-black text-white text-lg md:text-2xl leading-none">{fmt(revenue)}</span>
              <span className="font-body text-xs text-slate">
                {soldCount === 0 ? 'Nenhuma venda ainda' : `${soldCount} venda${soldCount !== 1 ? 's' : ''} este mês`}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
              <span className="font-body text-xs text-slate uppercase tracking-widest">Lucro</span>
              <span className={`font-display font-black text-lg md:text-2xl leading-none ${profit > 0 ? 'text-green' : profit < 0 ? 'text-alert' : 'text-white'}`}>
                {fmt(profit)}
              </span>
              <span className="font-body text-xs text-slate">{revenue > 0 ? `${margin}% de margem` : 'sem vendas ainda'}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Painel lateral — Estoque */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-3 sticky top-6">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-white text-sm">Estoque</h2>
          <div className="flex items-center gap-2">
            <Link href="/app/vehicles/novo" className="flex items-center justify-center h-6 w-6 rounded-md bg-green/10 hover:bg-green/20 transition-colors">
              <Plus size={12} className="text-green" />
            </Link>
            <Link href="/app/vehicles" className="font-body text-xs text-slate hover:text-green transition-colors">
              Ver todos
            </Link>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface py-10 text-center">
            <Car size={20} className="text-slate" />
            <p className="font-body text-xs text-slate">Nenhum veículo ainda</p>
            <Link href="/app/vehicles/novo" className="font-body text-xs text-green hover:underline">
              Cadastrar →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {vehicles.map((v: {
              id: string; brand: string; model: string; year_model: number | null
              price: number; status: string; cover_image_path: string | null
            }) => {
              const photo = coverUrl(v.cover_image_path)
              return (
                <Link
                  key={v.id}
                  href={`/app/vehicles/${v.id}`}
                  className="group flex gap-3 rounded-xl bg-deep border border-surface p-3 hover:border-green/30 transition-all duration-200"
                >
                  {/* Foto */}
                  <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-surface">
                    {photo ? (
                      <Image src={photo} alt={`${v.brand} ${v.model}`} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car size={18} className="text-slate" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 min-w-0 justify-center">
                    <p className="font-body text-sm font-semibold text-white truncate group-hover:text-green transition-colors">
                      {v.brand} {v.model}
                    </p>
                    <p className="font-body text-xs text-slate">{v.year_model ?? '—'}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs font-semibold text-white">{fmt(v.price)}</span>
                      {v.status !== 'available' && (
                        <span className={`font-body text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLOR[v.status] ?? 'bg-surface text-slate'}`}>
                          {STATUS_LABEL[v.status] ?? v.status}
                        </span>
                      )}
                    </div>
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
