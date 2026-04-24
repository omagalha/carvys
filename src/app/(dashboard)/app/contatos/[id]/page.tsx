import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Mail, Car, Phone, Clock, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getLead } from '@/server/queries/leads'
import { getLeadsByPhone } from '@/server/queries/contacts'
import { calcTemperature, TEMP_CONFIG } from '@/lib/temperature'

const AVATAR_COLORS = [
  'bg-green/20 text-green',
  'bg-blue-400/20 text-blue-400',
  'bg-purple-400/20 text-purple-400',
  'bg-orange-400/20 text-orange-400',
  'bg-pink-400/20 text-pink-400',
]

const STAGE_LABEL: Record<string, { label: string; color: string }> = {
  new:         { label: 'Novo',        color: 'text-slate border-slate/30 bg-slate/10' },
  contacted:   { label: 'Contatado',   color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  negotiating: { label: 'Negociando',  color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
  won:         { label: 'Ganho ✓',    color: 'text-green border-green/30 bg-green/10' },
  lost:        { label: 'Perdido',     color: 'text-alert border-alert/30 bg-alert/10' },
}

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp',
  site: 'Site', indicacao: 'Indicação', organico: 'Orgânico', outro: 'Outro',
}

function daysSince(iso: string | null) {
  if (!iso) return null
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'hoje'
  if (d === 1) return 'ontem'
  return `há ${d} dias`
}

export default async function ContactProfilePage({
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

  const tenant   = memberships[0].tenants as { id: string }
  const contact  = await getLead(id, tenant.id)
  if (!contact) notFound()

  const otherLeads = await getLeadsByPhone(contact.phone, tenant.id, contact.id)

  const temp     = calcTemperature(contact.stage, contact.last_contact_at, contact.created_at)
  const tempCfg  = temp ? TEMP_CONFIG[temp] : null
  const stageCfg = STAGE_LABEL[contact.stage]
  const color    = AVATAR_COLORS[contact.name.charCodeAt(0) % AVATAR_COLORS.length]
  const initial  = contact.name.charAt(0).toUpperCase()
  const waPhone  = contact.phone.replace(/\D/g, '')
  const allLeads = [contact, ...otherLeads]

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-lg">

      {/* Back */}
      <Link
        href="/app/contatos"
        className="flex items-center gap-2 w-fit font-body text-xs text-slate hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Contatos
      </Link>

      {/* Profile card */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-deep border border-surface p-6 text-center">
        {/* Avatar */}
        <div className={`flex h-20 w-20 items-center justify-center rounded-full font-display text-3xl font-bold ${color}`}>
          {initial}
        </div>

        {/* Name + badges */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display font-bold text-white text-xl">{contact.name}</h1>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className={`font-body text-xs font-medium px-2.5 py-1 rounded-full border ${stageCfg.color}`}>
              {stageCfg.label}
            </span>
            {tempCfg && (
              <span className={`font-body text-xs font-medium px-2.5 py-1 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border}`}>
                {tempCfg.emoji} {tempCfg.label}
              </span>
            )}
            {contact.source && (
              <span className="font-body text-xs text-slate bg-surface px-2.5 py-1 rounded-full">
                {SOURCE_LABEL[contact.source] ?? contact.source}
              </span>
            )}
          </div>
          {contact.last_contact_at && (
            <p className="font-body text-xs text-slate">
              Último contato {daysSince(contact.last_contact_at)}
            </p>
          )}
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/55${waPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 h-11 w-full max-w-xs rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-colors justify-center"
        >
          <MessageCircle size={16} className="text-[#25D366]" />
          <span className="font-body text-sm font-semibold text-[#25D366]">{contact.phone}</span>
        </a>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 rounded-xl bg-deep border border-surface p-4">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 py-2 border-b border-surface/60 hover:opacity-80 transition-opacity"
          >
            <Mail size={14} className="text-slate shrink-0" />
            <span className="font-body text-sm text-white">{contact.email}</span>
          </a>
        )}
        <div className="flex items-center gap-3 py-2 border-b border-surface/60">
          <Phone size={14} className="text-slate shrink-0" />
          <span className="font-body text-sm text-white">{contact.phone}</span>
        </div>
        {contact.vehicles && (
          <Link
            href={`/app/vehicles/${contact.interest_vehicle_id}`}
            className="flex items-center gap-3 py-2 hover:opacity-80 transition-opacity"
          >
            <Car size={14} className="text-slate shrink-0" />
            <span className="font-body text-sm text-white">
              {contact.vehicles.brand} {contact.vehicles.model}
              {contact.vehicles.year_model ? ` · ${contact.vehicles.year_model}` : ''}
            </span>
            <ExternalLink size={11} className="text-slate ml-auto" />
          </Link>
        )}
      </div>

      {/* Histórico de negociações */}
      <div className="flex flex-col gap-3">
        <h2 className="font-body font-semibold text-white text-sm px-1">
          Negociações ({allLeads.length})
        </h2>
        <div className="flex flex-col gap-2">
          {allLeads.map(lead => {
            const s     = STAGE_LABEL[lead.stage]
            const days  = daysSince(lead.last_contact_at ?? lead.created_at)
            const isCurrent = lead.id === contact.id
            return (
              <Link
                key={lead.id}
                href={`/app/leads/${lead.id}`}
                className="flex items-center gap-3 rounded-xl bg-deep border border-surface hover:border-green/30 px-4 py-3 transition-all"
              >
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-white font-medium truncate">
                      {lead.vehicles
                        ? `${lead.vehicles.brand} ${lead.vehicles.model}${lead.vehicles.year_model ? ` ${lead.vehicles.year_model}` : ''}`
                        : 'Sem veículo vinculado'}
                    </span>
                    {isCurrent && (
                      <span className="font-body text-[10px] text-green border border-green/30 bg-green/10 px-1.5 py-0.5 rounded-full shrink-0">
                        atual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={9} className="text-slate" />
                    <span className="font-body text-xs text-slate">{days}</span>
                  </div>
                </div>
                <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${s.color}`}>
                  {s.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Link para ver no pipeline */}
      <Link
        href={`/app/leads/${contact.id}`}
        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-surface font-body text-sm text-slate hover:text-white hover:border-slate/40 transition-colors"
      >
        Ver no pipeline
        <ExternalLink size={13} />
      </Link>
    </div>
  )
}
