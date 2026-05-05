import type React from 'react'
import Link from 'next/link'
import { getAllTenants } from '@/server/queries/admin'
import { Store, Phone, Mail, Car, Users, Wifi, WifiOff, Clock, Sparkles } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  trial:    'Trial',
  active:   'Ativo',
  past_due: 'Inadimplente',
  canceled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  trial:    'bg-blue-500/15 text-blue-400',
  active:   'bg-green/15 text-green',
  past_due: 'bg-alert/15 text-alert',
  canceled: 'bg-surface text-slate',
}

const PLAN_LABEL: Record<string, string> = {
  trial:   'Trial',
  starter: 'Starter',
  pro:     'Pro',
  elite:   'Elite',
  makeup:  'Makeup',
}

const BUSINESS_TYPE_BADGE: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  car_dealer:   { label: 'Veículos',  icon: Car,      className: 'text-blue-400 bg-blue-400/10' },
  makeup_store: { label: 'Maquiagem', icon: Sparkles,  className: 'text-pink-400 bg-pink-400/10' },
  garage:       { label: 'Oficina',   icon: Store,     className: 'text-orange-400 bg-orange-400/10' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ClientesPage() {
  const tenants = await getAllTenants()

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Clientes</h1>
          <p className="font-body text-sm text-slate mt-0.5">{tenants.length} loja{tenants.length !== 1 ? 's' : ''} cadastrada{tenants.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface py-16">
          <Store size={24} className="text-slate" />
          <p className="font-body text-sm text-slate">Nenhum cliente ainda</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tenants.map(t => (
            <Link
              key={t.id}
              href={`/admin/clientes/${t.id}`}
              className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-5 hover:border-slate/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body font-semibold text-white text-base">{t.name}</span>
                    <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                    <span className="font-body text-[10px] text-slate bg-surface px-2 py-0.5 rounded-full">
                      {PLAN_LABEL[t.plan_code] ?? t.plan_code}
                    </span>
                    {(() => {
                      const badge = BUSINESS_TYPE_BADGE[t.business_type]
                      if (!badge) return null
                      const Icon = badge.icon
                      return (
                        <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.className}`}>
                          <Icon size={9} />
                          {badge.label}
                        </span>
                      )
                    })()}
                  </div>
                  <p className="font-body text-xs text-slate mt-1">Desde {formatDate(t.created_at)}</p>
                </div>
              </div>

              {t.owner && (
                <div className="flex flex-wrap gap-4">
                  {t.owner.full_name && (
                    <span className="font-body text-xs text-slate flex items-center gap-1">
                      <Users size={11} />
                      {t.owner.full_name}
                    </span>
                  )}
                  {t.owner.email && (
                    <span className="font-body text-xs text-slate flex items-center gap-1">
                      <Mail size={11} />
                      {t.owner.email}
                    </span>
                  )}
                  {t.owner.phone && (
                    <span className="font-body text-xs text-slate flex items-center gap-1">
                      <Phone size={11} />
                      {t.owner.phone}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-1 border-t border-surface">
                {t.business_type === 'makeup_store' ? (
                  <span className="font-body text-xs text-slate flex items-center gap-1">
                    <Sparkles size={11} />
                    {t.product_count} produto{t.product_count !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="font-body text-xs text-slate flex items-center gap-1">
                    <Car size={11} />
                    {t.vehicle_count} veículo{t.vehicle_count !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="font-body text-xs text-slate flex items-center gap-1">
                  <Users size={11} />
                  {t.business_type === 'makeup_store'
                    ? `${t.lead_count} cliente${t.lead_count !== 1 ? 's' : ''}`
                    : `${t.lead_count} lead${t.lead_count !== 1 ? 's' : ''}`}
                </span>
                <span className="font-body text-xs text-slate">
                  {t.member_count} usuário{t.member_count !== 1 ? 's' : ''}
                </span>
                <span className={`font-body text-xs flex items-center gap-1 ${t.whatsapp_connected ? 'text-green' : 'text-slate'}`}>
                  {t.whatsapp_connected ? <Wifi size={11} /> : <WifiOff size={11} />}
                  WA
                </span>
                {t.owner?.last_sign_in_at && (
                  <span className="font-body text-xs text-slate flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(t.owner.last_sign_in_at)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
