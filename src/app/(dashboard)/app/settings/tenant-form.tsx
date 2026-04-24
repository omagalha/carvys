'use client'

import { useActionState } from 'react'
import { updateTenant } from '@/server/actions/settings'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

const initialState = { error: '', success: false }

interface Props {
  name: string
  slug: string
  plan: string
  whatsappPhone: string | null
}

export function TenantForm({ name, slug, plan, whatsappPhone }: Props) {
  const [state, formAction] = useActionState(updateTenant, initialState)

  const PLAN_LABEL: Record<string, string> = {
    trial: 'Trial gratuito',
    starter: 'Starter — R$97/mês',
    pro: 'Pro — R$197/mês',
    elite: 'Elite — R$297/mês',
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nome da loja"
        name="name"
        defaultValue={name}
        placeholder="Minha Revenda"
        required
      />
      <Input
        label="WhatsApp da loja"
        name="whatsapp_phone"
        type="tel"
        defaultValue={whatsappPhone ?? ''}
        placeholder="(11) 99999-9999"
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-slate">Identificador (slug)</label>
        <div className="h-11 flex items-center rounded-lg border border-surface bg-surface/50 px-3">
          <span className="font-body text-sm text-slate">{slug}</span>
        </div>
        <p className="font-body text-[10px] text-slate">O identificador não pode ser alterado.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-slate">Plano atual</label>
        <div className="h-11 flex items-center justify-between rounded-lg border border-surface bg-surface/50 px-3">
          <span className="font-body text-sm text-white">{PLAN_LABEL[plan] ?? plan}</span>
          <span className="font-body text-[10px] text-green bg-green/10 px-2 py-0.5 rounded-full">Ativo</span>
        </div>
      </div>

      {state.error && (
        <p className="font-body text-xs text-alert">{state.error}</p>
      )}
      {state.success && (
        <p className="font-body text-xs text-green">Loja atualizada com sucesso.</p>
      )}

      <SubmitButton className="self-start px-6">Salvar loja</SubmitButton>
    </form>
  )
}
