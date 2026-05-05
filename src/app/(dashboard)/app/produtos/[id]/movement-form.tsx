'use client'

import { useActionState } from 'react'
import { registerMovement } from '@/server/actions/products'

const INITIAL = { error: '' }

const TYPES = [
  { value: 'in',      label: 'Entrada' },
  { value: 'out',     label: 'Saída' },
  { value: 'return',  label: 'Devolução' },
  { value: 'discard', label: 'Descarte' },
]

export function MovementForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(registerMovement, INITIAL)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Tipo</label>
          <select
            name="type"
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Quantidade</label>
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="font-body text-xs text-slate">Observação</label>
          <input
            name="notes"
            placeholder="Opcional"
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      {state.error && (
        <p className="font-body text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-9 px-4 rounded-lg bg-surface text-white font-body text-sm hover:bg-surface/80 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  )
}
