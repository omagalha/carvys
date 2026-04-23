import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Users, Phone, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getLeads } from '@/server/queries/leads'
import type { LeadStage, LeadWithVehicle } from '@/server/queries/leads'

const STAGES: { value: LeadStage | 'all'; label: string }[] = [
  { value: 'all',         label: 'Todos' },
  { value: 'new',         label: 'Novo' },
  { value: 'contacted',   label: 'Contatado' },
  { value: 'negotiating', label: 'Negociando' },
  { value: 'won',         label: 'Ganho' },
  { value: 'lost',        label: 'Perdido' },
]

const STAGE_COLOR: Record<LeadStage, string> = {
  new:         'bg-slate/20 text-slate',
  contacted:   'bg-blue-500/15 text-blue-400',
  negotiating: 'bg-yellow-500/15 text-yellow-400',
  won:         'bg-green/15 text-green',
  lost:        'bg-alert/15 text-alert',
}

const STAGE_LABEL: Record<LeadStage, string> = {
  new:         'Novo',
  contacted:   'Contatado',
  negotiating: 'Negociando',
  won:         'Ganho',
  lost:        'Perdido',
}

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  site: 'Site',
  indicacao: 'Indicação',
  organico: 'Orgânico',
  outro: 'Outro',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function LeadCard({ lead }: { lead: LeadWithVehicle }) {
  return (
    <Link
      href={`/app/leads/${lead.id}`}
      className="flex items-center gap-4 rounded-xl bg-deep border border-surface p-4 hover:border-slate/40 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
        <span className="font-body font-semibold text-sm text-slate">
          {lead.name.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="font-body font-semibold text-white text-sm truncate">{lead.name}</span>
        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-slate flex items-center gap-1">
            <Phone size={10} />
            {lead.phone}
          </span>
          {lead.vehicles && (
            <span className="font-body text-xs text-slate flex items-center gap-1 truncate hidden sm:flex">
              <Car size={10} />
              {lead.vehicles.brand} {lead.vehicles.model}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${STAGE_COLOR[lead.stage]}`}>
          {STAGE_LABEL[lead.stage]}
        </span>
        <span className="font-body text-[10px] text-slate">{formatDate(lead.created_at)}</span>
      </div>
    </Link>
  )
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const { stage } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const allLeads = await getLeads(tenant.id)

  const filtered = stage && stage !== 'all'
    ? allLeads.filter(l => l.stage === stage)
    : allLeads

  const counts = STAGES.reduce((acc, s) => {
    acc[s.value] = s.value === 'all'
      ? allLeads.length
      : allLeads.filter(l => l.stage === s.value).length
    return acc
  }, {} as Record<string, number>)

  const activeStage = stage ?? 'all'

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Leads</h1>
          <p className="font-body text-sm text-slate mt-0.5">{allLeads.length} no funil</p>
        </div>
        <Link
          href="/app/leads/novo"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 transition-colors"
        >
          <Plus size={16} />
          Novo
        </Link>
      </div>

      {/* Filtro por etapa */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STAGES.map(s => (
          <Link
            key={s.value}
            href={s.value === 'all' ? '/app/leads' : `/app/leads?stage=${s.value}`}
            className={[
              'flex items-center gap-1.5 shrink-0 h-8 px-3 rounded-lg font-body text-xs font-medium transition-colors',
              activeStage === s.value
                ? 'bg-green text-void'
                : 'bg-surface text-slate hover:text-white',
            ].join(' ')}
          >
            {s.label}
            <span className={[
              'text-[10px] px-1.5 py-0.5 rounded-full',
              activeStage === s.value ? 'bg-void/20 text-void' : 'bg-deep text-slate',
            ].join(' ')}>
              {counts[s.value]}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <Users size={24} className="text-slate" />
          </div>
          <div>
            <p className="font-body text-sm text-white font-medium">
              {activeStage === 'all' ? 'Nenhum lead cadastrado' : 'Nenhum lead nessa etapa'}
            </p>
            <p className="font-body text-xs text-slate mt-1">
              {activeStage === 'all' && 'Adicione seu primeiro lead'}
            </p>
          </div>
          {activeStage === 'all' && (
            <Link
              href="/app/leads/novo"
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:bg-green/90 transition-colors"
            >
              <Plus size={14} />
              Cadastrar lead
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}
