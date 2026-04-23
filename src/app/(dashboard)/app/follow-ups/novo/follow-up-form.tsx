'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createFollowUp } from '@/server/actions/follow-ups'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'
import type { LeadWithVehicle } from '@/server/queries/leads'

const initialState = { error: '' }

const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone',    label: 'Ligação' },
  { value: 'email',    label: 'E-mail' },
  { value: 'visit',    label: 'Visita presencial' },
  { value: 'outro',    label: 'Outro' },
]

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

function getDefaults() {
  const now = new Date()
  now.setHours(now.getHours() + 1, 0, 0, 0)
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const hour = String(now.getHours()).padStart(2, '0')
  return { date, hour, minute: '00' }
}

interface Props {
  leads: LeadWithVehicle[]
  defaultLeadId?: string
}

export function FollowUpForm({ leads, defaultLeadId }: Props) {
  const [state, formAction] = useActionState(createFollowUp, initialState)
  const router = useRouter()

  const defaults = getDefaults()
  const [date, setDate] = useState(defaults.date)
  const [hour, setHour] = useState(defaults.hour)
  const [minute, setMinute] = useState(defaults.minute)

  // Combina em ISO string preservando horário local do usuário
  const dueAt = date
    ? new Date(`${date}T${hour}:${minute}:00`).toISOString()
    : ''

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate" />
        </button>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Nova tarefa</h1>
          <p className="font-body text-sm text-slate mt-0.5">Agende um follow-up com seu lead</p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {/* Hidden que vai pro action */}
        <input type="hidden" name="due_at" value={dueAt} />

        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Lead</h2>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Selecione o lead</label>
            <select
              name="lead_id"
              defaultValue={defaultLeadId ?? ''}
              required
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
            >
              <option value="" disabled>Escolha um lead...</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Tarefa</h2>

          <Input
            label="Título"
            name="title"
            placeholder="Ligar para confirmar interesse"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Canal</label>
            <select
              name="channel"
              defaultValue="whatsapp"
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
            >
              {CHANNELS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Data e hora</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="col-span-2 h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors [color-scheme:dark]"
              />
              <div className="grid grid-cols-2 gap-1">
                <select
                  value={hour}
                  onChange={e => setHour(e.target.value)}
                  className="h-11 w-full rounded-lg border border-surface bg-void px-2 font-body text-sm text-white focus:outline-none focus:border-green transition-colors text-center"
                >
                  {HOURS.map(h => (
                    <option key={h} value={h}>{h}h</option>
                  ))}
                </select>
                <select
                  value={minute}
                  onChange={e => setMinute(e.target.value)}
                  className="h-11 w-full rounded-lg border border-surface bg-void px-2 font-body text-sm text-white focus:outline-none focus:border-green transition-colors text-center"
                >
                  {MINUTES.map(m => (
                    <option key={m} value={m}>{m}m</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Observações</h2>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Notas (opcional)</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Detalhes sobre o contato..."
              className="w-full rounded-lg border border-surface bg-void px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors resize-none"
            />
          </div>
        </section>

        {state?.error && (
          <p className="font-body text-xs text-alert text-center">{state.error}</p>
        )}

        <SubmitButton>Agendar tarefa</SubmitButton>
      </form>
    </div>
  )
}
