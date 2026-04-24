import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Users, Phone, Car, MessageCircle, AlertTriangle, Clock, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getLeads } from '@/server/queries/leads'
import type { LeadStage, LeadWithVehicle } from '@/server/queries/leads'
import { calcTemperature, TEMP_CONFIG } from '@/lib/temperature'
import { ContactsButton } from './contacts-button'

const STAGES: {
  value: LeadStage
  label: string
  empty: string
  accent: string
  dot: string
  urgencyDays: number | null
}[] = [
  { value: 'new',         label: 'Novos',      empty: 'Nenhum lead novo. Prospecte!',          accent: 'text-slate',      dot: 'bg-slate',      urgencyDays: 1 },
  { value: 'contacted',   label: 'Contatados', empty: 'Ninguém contatado ainda.',              accent: 'text-blue-400',   dot: 'bg-blue-400',   urgencyDays: 3 },
  { value: 'negotiating', label: 'Negociando', empty: 'Nenhuma negociação em curso.',           accent: 'text-yellow-400', dot: 'bg-yellow-400', urgencyDays: 5 },
  { value: 'won',         label: 'Ganhos',     empty: 'Nenhuma venda fechada ainda. Bora!',    accent: 'text-green',      dot: 'bg-green',      urgencyDays: null },
  { value: 'lost',        label: 'Perdidos',   empty: 'Nenhum lead perdido 🎉',                accent: 'text-alert',      dot: 'bg-alert',      urgencyDays: null },
]

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook:  'Facebook',
  whatsapp:  'WhatsApp',
  site:      'Site',
  indicacao: 'Indicação',
  organico:  'Orgânico',
  outro:     'Outro',
}

function daysSince(iso: string | null) {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

function isUrgent(lead: LeadWithVehicle, urgencyDays: number | null) {
  if (!urgencyDays) return false
  const ref = lead.last_contact_at ?? lead.created_at
  return daysSince(ref) >= urgencyDays
}

function formatDays(days: number) {
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  return `${days}d atrás`
}

function LeadCard({ lead, urgencyDays }: { lead: LeadWithVehicle; urgencyDays: number | null }) {
  const urgent   = isUrgent(lead, urgencyDays)
  const ref      = lead.last_contact_at ?? lead.created_at
  const days     = daysSince(ref)
  const waPhone  = lead.phone?.replace(/\D/g, '')
  const initial  = lead.name.charAt(0).toUpperCase()
  const temp     = calcTemperature(lead.stage, lead.last_contact_at, lead.created_at)
  const tempCfg  = temp ? TEMP_CONFIG[temp] : null

  return (
    <div className={`relative group rounded-xl bg-deep border transition-all duration-200 hover:border-green/30 hover:shadow-lg hover:shadow-green/5 ${
      urgent ? 'border-alert/40 bg-alert/[0.03]' : 'border-surface'
    }`}>
      {/* Link principal cobre todo o card */}
      <Link href={`/app/leads/${lead.id}`} className="absolute inset-0 z-0 rounded-xl" />

      <div className="relative z-10 flex flex-col gap-3 p-4">
        {/* Topo: avatar + nome + urgência */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-body text-xs font-bold ${
              urgent ? 'bg-alert/20 text-alert' : 'bg-surface text-slate'
            }`}>
              {initial}
            </div>
            <span className="font-body font-semibold text-white text-sm truncate group-hover:text-green transition-colors">
              {lead.name}
            </span>
          </div>
          {urgent && <AlertTriangle size={13} className="text-alert shrink-0 mt-0.5" />}
        </div>

        {/* Detalhes */}
        <div className="flex flex-col gap-1.5">
          {lead.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={10} className="text-slate shrink-0" />
              <span className="font-body text-xs text-slate truncate">{lead.phone}</span>
            </div>
          )}
          {lead.vehicles && (
            <div className="flex items-center gap-1.5">
              <Car size={10} className="text-slate shrink-0" />
              <span className="font-body text-xs text-slate truncate">
                {lead.vehicles.brand} {lead.vehicles.model}
                {lead.vehicles.year_model ? ` ${lead.vehicles.year_model}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé: fonte + temperatura + tempo + WhatsApp */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface/60">
          {lead.source && (
            <span className="font-body text-[10px] text-slate bg-surface/60 px-1.5 py-0.5 rounded-full truncate">
              {SOURCE_LABEL[lead.source] ?? lead.source}
            </span>
          )}
          {tempCfg && (
            <span className={`font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border} shrink-0`}>
              {tempCfg.emoji} {tempCfg.label}
            </span>
          )}
          <div className={`flex items-center gap-1 ml-auto font-body text-[10px] shrink-0 ${urgent ? 'text-alert font-semibold' : 'text-slate'}`}>
            <Clock size={9} />
            {formatDays(days)}
          </div>
          {waPhone && (
            <a
              href={`https://wa.me/55${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 flex h-6 w-6 items-center justify-center rounded-md bg-green/10 hover:bg-green/25 transition-colors shrink-0"
            >
              <MessageCircle size={11} className="text-green" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant   = memberships[0].tenants as { id: string }
  const allLeads = await getLeads(tenant.id)

  const active  = allLeads.filter(l => l.stage !== 'won' && l.stage !== 'lost')
  const urgent  = active.filter(l => {
    const stage  = STAGES.find(s => s.value === l.stage)
    return isUrgent(l, stage?.urgencyDays ?? null)
  })
  const wonThisMonth = allLeads.filter(l => {
    if (l.stage !== 'won') return false
    const now = new Date()
    const created = new Date(l.created_at)
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  })

  const byStage = Object.fromEntries(
    STAGES.map(s => [s.value, allLeads.filter(l => l.stage === s.value)])
  ) as Record<LeadStage, LeadWithVehicle[]>

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 md:px-6 md:pt-6">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Pipeline</h1>
          <p className="font-body text-sm text-slate mt-0.5">{active.length} lead{active.length !== 1 ? 's' : ''} ativos</p>
        </div>
        <div className="flex items-center gap-2">
          {urgent.length > 0 && (
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-alert/10 border border-alert/20">
              <AlertTriangle size={13} className="text-alert" />
              <span className="font-body text-xs text-alert font-semibold">{urgent.length} urgente{urgent.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {wonThisMonth.length > 0 && (
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-green/10 border border-green/20">
              <Trophy size={13} className="text-green" />
              <span className="font-body text-xs text-green font-semibold">{wonThisMonth.length} fechamento{wonThisMonth.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <Link
            href="/app/leads/novo"
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-green text-void font-body font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Novo lead
          </Link>
        </div>
      </div>

      {/* Kanban */}
      {allLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 mx-4 md:mx-6 rounded-2xl border border-dashed border-surface py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <Users size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm font-semibold text-white">Nenhum lead ainda</p>
            <p className="font-body text-xs text-slate">Cadastre seu primeiro lead e comece a fechar negócios</p>
          </div>
          <Link
            href="/app/leads/novo"
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-green text-void font-body font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Cadastrar primeiro lead
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4 pb-6 md:px-6 flex-1">
          {STAGES.map(stage => {
            const leads = byStage[stage.value] ?? []
            return (
              <div key={stage.value} className="flex flex-col gap-3 min-w-[240px] w-[240px] flex-shrink-0">
                {/* Cabeçalho da coluna */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${stage.dot}`} />
                    <span className={`font-body text-xs font-semibold ${stage.accent}`}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="font-body text-xs text-slate bg-surface px-2 py-0.5 rounded-full">
                    {leads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {leads.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface py-8 text-center px-3">
                      <p className="font-body text-xs text-slate leading-relaxed">{stage.empty}</p>
                      {stage.value === 'new' && (
                        <Link
                          href="/app/leads/novo"
                          className="font-body text-xs text-green hover:underline"
                        >
                          + Adicionar lead
                        </Link>
                      )}
                    </div>
                  ) : (
                    leads.map(lead => (
                      <LeadCard key={lead.id} lead={lead} urgencyDays={stage.urgencyDays} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ContactsButton />
    </div>
  )
}
