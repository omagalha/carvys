'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createLead } from '@/server/actions/leads'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

const initialState = { error: '' }

const SOURCES = [
  { value: '',          label: 'Selecione (opcional)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'site',      label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'organico',  label: 'Orgânico' },
  { value: 'outro',     label: 'Outro' },
]

export default function NovoLeadPage() {
  const [state, formAction] = useActionState(createLead, initialState)
  const router = useRouter()

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
          <h1 className="font-display font-bold text-white text-2xl">Novo lead</h1>
          <p className="font-body text-sm text-slate mt-0.5">Cadastre um novo contato no funil</p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Contato</h2>
          <Input label="Nome" name="name" placeholder="João Silva" required />
          <Input label="Telefone / WhatsApp" name="phone" type="tel" placeholder="(11) 99999-9999" required />
          <Input label="E-mail" name="email" type="email" placeholder="joao@email.com (opcional)" />
        </section>

        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Origem</h2>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Canal de origem</label>
            <select
              name="source"
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
            >
              {SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Observações</h2>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Notas iniciais</label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Interesse em veículo específico, condições, observações..."
              className="w-full rounded-lg border border-surface bg-void px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors resize-none"
            />
          </div>
        </section>

        {state?.error && (
          <p className="font-body text-xs text-alert text-center">{state.error}</p>
        )}

        <SubmitButton>Salvar lead</SubmitButton>
      </form>
    </div>
  )
}
