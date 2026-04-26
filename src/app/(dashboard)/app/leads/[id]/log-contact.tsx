'use client'

import { useState, useTransition } from 'react'
import { PhoneCall, X } from 'lucide-react'
import { logContact } from '@/server/actions/leads'

const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
  { value: 'phone',    label: 'Ligação',  emoji: '📞' },
  { value: 'email',    label: 'E-mail',   emoji: '✉️'  },
  { value: 'visit',    label: 'Visita',   emoji: '🏢' },
  { value: 'outro',    label: 'Outro',    emoji: '📝' },
]

export function LogContact({ leadId }: { leadId: string }) {
  const [open, setOpen]           = useState(false)
  const [channel, setChannel]     = useState('whatsapp')
  const [note, setNote]           = useState('')
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      await logContact(leadId, { channel, note })
      setNote('')
      setChannel('whatsapp')
      setOpen(false)
    })
  }

  function cancel() {
    setNote('')
    setChannel('whatsapp')
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-surface font-body text-xs text-slate hover:text-white hover:border-slate/40 transition-colors"
      >
        <PhoneCall size={12} />
        Registrar contato
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancel} />
          <div className="relative w-full max-w-sm rounded-2xl bg-deep border border-surface p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-white text-base">Registrar contato</h2>
                <p className="font-body text-xs text-slate mt-1">Registra na timeline e atualiza o último contato.</p>
              </div>
              <button
                onClick={cancel}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface transition-colors shrink-0"
              >
                <X size={14} className="text-slate" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs text-slate">Canal</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CHANNELS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setChannel(c.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border py-2 px-1 transition-all ${
                        channel === c.value
                          ? 'border-green/50 bg-green/10'
                          : 'border-surface hover:border-surface/80'
                      }`}
                    >
                      <span className="text-base leading-none">{c.emoji}</span>
                      <span className={`font-body text-[9px] leading-tight text-center ${channel === c.value ? 'text-green' : 'text-slate'}`}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs text-slate">Observação (opcional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ex: Cliente pediu para retornar na semana que vem..."
                  rows={3}
                  className="rounded-lg border border-surface bg-void px-3 py-2 font-body text-sm text-white placeholder:text-slate/40 focus:outline-none focus:border-green transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={cancel}
                className="flex-1 h-10 rounded-lg border border-surface font-body text-sm text-slate hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={pending}
                className="flex-1 h-10 rounded-lg bg-green font-body text-sm font-semibold text-[#0A0A0F] disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {pending ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
