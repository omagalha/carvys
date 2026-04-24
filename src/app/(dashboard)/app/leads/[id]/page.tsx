import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Car, MessageCircle, MessageCircle as WA, PhoneCall, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getLead } from '@/server/queries/leads'
import { getLeadFollowUps } from '@/server/queries/follow-ups'
import type { FollowUp } from '@/server/queries/follow-ups'
import { StageSelect } from './stage-select'
import { NotesEditor } from './notes-editor'
import { WATemplates } from './wa-templates'
import { Timeline } from './timeline'
import { calcTemperature, TEMP_CONFIG } from '@/lib/temperature'
import { getLeadEvents } from '@/server/queries/lead-events'

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook:  'Facebook',
  whatsapp:  'WhatsApp',
  site:      'Site',
  indicacao: 'Indicação',
  organico:  'Orgânico',
  outro:     'Outro',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}`
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant = memberships[0].tenants as { id: string }
  const [lead, followUps, events] = await Promise.all([
    getLead(id, tenant.id),
    getLeadFollowUps(id, tenant.id),
    getLeadEvents(id, tenant.id),
  ])
  if (!lead) notFound()

  const temp    = calcTemperature(lead.stage, lead.last_contact_at, lead.created_at)
  const tempCfg = temp ? TEMP_CONFIG[temp] : null

  const CHANNEL_ICON: Record<string, React.ElementType> = {
    whatsapp: WA, phone: PhoneCall, email: Mail, visit: MapPin, outro: Calendar,
  }
  const CHANNEL_LABEL: Record<string, string> = {
    whatsapp: 'WhatsApp', phone: 'Ligação', email: 'E-mail', visit: 'Visita', outro: 'Outro',
  }
  function formatDue(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/leads"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-white text-xl truncate">{lead.name}</h1>
            {tempCfg && (
              <span className={`inline-flex items-center gap-1 font-body text-xs font-medium px-2 py-0.5 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border}`}>
                {tempCfg.emoji} {tempCfg.label}
              </span>
            )}
          </div>
          <p className="font-body text-xs text-slate mt-0.5">Desde {formatDate(lead.created_at)}</p>
        </div>
      </div>

      {/* Etapa */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Etapa do funil</h2>
        <StageSelect leadId={lead.id} currentStage={lead.stage} currentLossReason={lead.loss_reason} />
      </section>

      {/* Contato */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Contato</h2>

        <a
          href={whatsappLink(lead.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 h-11 px-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
        >
          <MessageCircle size={16} className="text-[#25D366]" />
          <span className="font-body text-sm text-white">{lead.phone}</span>
          <span className="font-body text-xs text-[#25D366] ml-auto">Abrir WhatsApp</span>
        </a>

        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-3 h-11 px-4 rounded-lg border border-surface hover:border-slate/40 transition-colors"
          >
            <Mail size={16} className="text-slate" />
            <span className="font-body text-sm text-white">{lead.email}</span>
          </a>
        )}

        {lead.source && (
          <div className="flex items-center justify-between py-2 border-t border-surface">
            <span className="font-body text-xs text-slate">Origem</span>
            <span className="font-body text-sm text-white">
              {SOURCE_LABEL[lead.source] ?? lead.source}
            </span>
          </div>
        )}
      </section>

      {/* Templates WhatsApp */}
      <WATemplates
        stage={lead.stage}
        leadName={lead.name}
        phone={lead.phone}
        vehicleName={lead.vehicles
          ? `${lead.vehicles.brand} ${lead.vehicles.model}${lead.vehicles.year_model ? ` ${lead.vehicles.year_model}` : ''}`
          : undefined
        }
      />

      {/* Veículo de interesse */}
      {lead.vehicles && (
        <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Veículo de interesse</h2>
          <Link
            href={`/app/vehicles/${lead.interest_vehicle_id}`}
            className="flex items-center gap-3 h-11 px-4 rounded-lg border border-surface hover:border-slate/40 transition-colors"
          >
            <Car size={16} className="text-slate" />
            <span className="font-body text-sm text-white">
              {lead.vehicles.brand} {lead.vehicles.model}
              {lead.vehicles.year_model ? ` ${lead.vehicles.year_model}` : ''}
            </span>
          </Link>
        </section>
      )}

      {/* Notas */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <h2 className="font-body font-semibold text-white text-sm">Notas</h2>
        <NotesEditor leadId={lead.id} initialNotes={lead.notes} />
      </section>

      {/* Timeline */}
      <Timeline events={events} followUps={followUps} leadCreatedAt={lead.created_at} />

      {/* Follow-ups */}
      <section className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-white text-sm">
            Follow-ups ({followUps.length})
          </h2>
          <Link
            href={`/app/follow-ups/novo?lead_id=${lead.id}`}
            className="font-body text-xs text-green hover:underline"
          >
            + Agendar
          </Link>
        </div>

        {followUps.length === 0 ? (
          <p className="font-body text-xs text-slate">Nenhum follow-up agendado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {followUps.map((f: FollowUp) => {
              const Icon = CHANNEL_ICON[f.channel] ?? Calendar
              const done = f.status === 'done'
              const overdue = f.status === 'pending' && new Date(f.due_at) < new Date()
              return (
                <div key={f.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${overdue ? 'border-alert/30 bg-alert/5' : 'border-surface'}`}>
                  <Icon size={14} className={done ? 'text-green' : overdue ? 'text-alert' : 'text-slate'} />
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <span className={`font-body text-xs font-medium truncate ${done ? 'line-through text-slate' : 'text-white'}`}>
                      {f.title}
                    </span>
                    <span className={`font-body text-[10px] ${overdue ? 'text-alert' : 'text-slate'}`}>
                      {formatDue(f.due_at)}
                    </span>
                  </div>
                  {done && <CheckCircle2 size={14} className="text-green shrink-0" />}
                  {overdue && <Clock size={14} className="text-alert shrink-0" />}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
