import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageCircle, BookUser } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'
import { getContacts } from '@/server/queries/contacts'
import { calcTemperature, TEMP_CONFIG } from '@/lib/temperature'
import { SearchInput } from './search-input'

const STAGE_LABEL: Record<string, { label: string; color: string }> = {
  new:         { label: 'Novo',        color: 'text-slate bg-surface' },
  contacted:   { label: 'Contatado',   color: 'text-blue-400 bg-blue-400/10' },
  negotiating: { label: 'Negociando',  color: 'text-yellow-400 bg-yellow-400/10' },
  won:         { label: 'Ganho',       color: 'text-green bg-green/10' },
  lost:        { label: 'Perdido',     color: 'text-alert bg-alert/10' },
}

const AVATAR_COLORS = [
  'bg-green/20 text-green',
  'bg-blue-400/20 text-blue-400',
  'bg-purple-400/20 text-purple-400',
  'bg-orange-400/20 text-orange-400',
  'bg-pink-400/20 text-pink-400',
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export default async function ContatosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getUserTenants()
  if (memberships.length === 0) redirect('/onboarding')

  const tenant   = memberships[0].tenants as { id: string }
  const contacts = await getContacts(tenant.id, q)

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Contatos</h1>
          <p className="font-body text-sm text-slate mt-0.5">{contacts.length} contato{contacts.length !== 1 ? 's' : ''}</p>
        </div>
        <SearchInput />
      </div>

      {/* Empty */}
      {contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
            <BookUser size={24} className="text-slate" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm font-semibold text-white">
              {q ? 'Nenhum contato encontrado' : 'Nenhum contato ainda'}
            </p>
            <p className="font-body text-xs text-slate">
              {q ? `Sem resultados para "${q}"` : 'Contatos aparecem conforme você cadastra leads'}
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {contacts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map(contact => {
            const temp     = calcTemperature(contact.stage, contact.last_contact_at, contact.created_at)
            const tempCfg  = temp ? TEMP_CONFIG[temp] : null
            const stageCfg = STAGE_LABEL[contact.stage]
            const initial  = contact.name.charAt(0).toUpperCase()
            const waPhone  = contact.phone.replace(/\D/g, '')
            const color    = avatarColor(contact.name)

            return (
              <div key={contact.id} className="relative group rounded-xl bg-deep border border-surface hover:border-green/30 transition-all duration-200">
                <Link href={`/app/contatos/${contact.id}`} className="absolute inset-0 z-0 rounded-xl" />

                <div className="relative z-10 flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${color}`}>
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body font-semibold text-white text-sm truncate group-hover:text-green transition-colors">
                        {contact.name}
                      </span>
                      {tempCfg && (
                        <span className={`font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border} shrink-0`}>
                          {tempCfg.emoji}
                        </span>
                      )}
                    </div>
                    <span className="font-body text-xs text-slate">{contact.phone}</span>
                    {contact.vehicles && (
                      <span className="font-body text-xs text-slate/60 truncate">
                        {contact.vehicles.brand} {contact.vehicles.model}
                        {contact.vehicles.year_model ? ` ${contact.vehicles.year_model}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${stageCfg.color}`}>
                      {stageCfg.label}
                    </span>
                    <a
                      href={`https://wa.me/55${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/25 transition-colors"
                    >
                      <MessageCircle size={13} className="text-[#25D366]" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
