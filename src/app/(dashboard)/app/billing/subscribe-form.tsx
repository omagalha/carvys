'use client'

import { useActionState, useEffect, useState } from 'react'
import { subscribePlan, type BillingState } from '@/server/actions/billing'

const initialState: BillingState = { error: '' }

interface Props {
  planCode: string
  planName: string
  highlight: boolean
}

export function SubscribeForm({ planCode, planName, highlight }: Props) {
  const [state, formAction, pending] = useActionState(subscribePlan, initialState)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (state.paymentUrl) {
      window.location.href = state.paymentUrl
    }
  }, [state.paymentUrl])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`mt-auto h-10 w-full rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-90 ${
          highlight ? 'bg-green text-void' : 'border border-surface text-white hover:border-slate/40'
        }`}
      >
        Assinar {planName}
      </button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 mt-auto">
      <input type="hidden" name="plan_code" value={planCode} />

      <input
        name="cpf_cnpj"
        placeholder="CPF ou CNPJ (só números)"
        maxLength={18}
        required
        className="h-10 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 outline-none focus:border-green/60 transition-colors"
      />

      <select
        name="billing_type"
        defaultValue="PIX"
        className="h-10 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white outline-none focus:border-green/60 transition-colors"
      >
        <option value="PIX">Pix</option>
        <option value="BOLETO">Boleto</option>
      </select>

      {state.error && (
        <p className="font-body text-xs text-alert">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-10 flex-1 rounded-lg border border-surface font-body text-sm text-slate hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className={`h-10 flex-1 rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
            highlight ? 'bg-green text-void' : 'border border-green text-green'
          }`}
        >
          {pending ? 'Aguarde...' : 'Confirmar'}
        </button>
      </div>
    </form>
  )
}
