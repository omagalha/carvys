'use client'

import { useState, useActionState, useEffect } from 'react'
import { X, MessageCircle, Loader2, CheckCircle } from 'lucide-react'
import { createPublicLead } from '@/server/actions/public'

type Variant = 'card' | 'primary' | 'whatsapp'

const BUTTON_STYLES: Record<Variant, string> = {
  card:      'flex items-center justify-center gap-1.5 h-8 w-full rounded-lg bg-[#C8F135]/10 text-[#C8F135] font-body text-xs font-semibold hover:bg-[#C8F135]/20 transition-colors',
  primary:   'flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-[#C8F135] text-[#0A0A0F] font-body font-bold text-sm hover:opacity-90 transition-opacity',
  whatsapp:  'flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-white/10 text-white/40 font-body text-sm hover:border-[#25D366]/30 hover:text-[#25D366]/70 transition-colors',
}

type Props = {
  tenantId: string
  whatsappPhone: string | null
  vehicleId?: string
  vehicleName?: string
  variant?: Variant
}

const initial: { error: string; success: boolean } = { error: '', success: false }

export function LeadModal({ tenantId, whatsappPhone, vehicleId, vehicleName, variant = 'card' }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createPublicLead, initial)

  useEffect(() => {
    if (!state.success) return
    const timer = setTimeout(() => {
      if (whatsappPhone) {
        const cleaned = whatsappPhone.replace(/\D/g, '')
        const msg = vehicleName
          ? `Olá! Tenho interesse no ${vehicleName}.`
          : 'Olá! Vi o estoque e gostaria de mais informações.'
        window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
      }
      setOpen(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [state.success, whatsappPhone, vehicleName])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={BUTTON_STYLES[variant]}>
        <MessageCircle size={variant === 'primary' ? 18 : 13} />
        {variant === 'whatsapp' ? 'Chamar no WhatsApp' : 'Tenho interesse'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !pending && setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#111118] border border-white/10 p-5 flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-white text-lg leading-tight">Deixe seu contato</h2>
                {vehicleName && (
                  <p className="font-body text-xs text-white/30 mt-0.5 truncate">{vehicleName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white/60 transition-colors disabled:opacity-40"
              >
                <X size={14} />
              </button>
            </div>

            {/* Success */}
            {state.success ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle size={32} className="text-[#C8F135]" />
                <p className="font-body font-semibold text-white text-sm">Contato registrado!</p>
                <p className="font-body text-xs text-white/40">
                  {whatsappPhone ? 'Abrindo WhatsApp...' : 'Entraremos em contato em breve.'}
                </p>
              </div>
            ) : (
              <form action={action} className="flex flex-col gap-3">
                <input type="hidden" name="tenant_id" value={tenantId} />
                {vehicleId && <input type="hidden" name="vehicle_id" value={vehicleId} />}

                <input
                  name="name"
                  placeholder="Seu nome"
                  required
                  autoComplete="name"
                  disabled={pending}
                  className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 font-body text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C8F135]/40 transition-colors disabled:opacity-50"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Seu WhatsApp (com DDD)"
                  required
                  autoComplete="tel"
                  disabled={pending}
                  className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 font-body text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C8F135]/40 transition-colors disabled:opacity-50"
                />

                {state.error && (
                  <p className="font-body text-xs text-red-400">{state.error}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#C8F135] text-[#0A0A0F] font-body font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {pending
                    ? <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                    : <><MessageCircle size={16} /> Continuar no WhatsApp</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
