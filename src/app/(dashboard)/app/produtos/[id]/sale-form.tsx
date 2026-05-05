'use client'

import { useActionState } from 'react'
import { registerSale } from '@/server/actions/products'

const INITIAL = { error: '' }

export function SaleForm({ productId, salePrice }: { productId: string; salePrice: number | null }) {
  const [state, action, pending] = useActionState(registerSale, INITIAL)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Nome do cliente *</label>
          <input
            name="contact_name"
            required
            placeholder="Ex: Ana Silva"
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Telefone</label>
          <input
            name="contact_phone"
            type="tel"
            placeholder="(11) 99999-9999"
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Qtd</label>
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Preço unit. (R$)</label>
          <input
            name="unit_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={salePrice ?? 0}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Data</label>
          <input
            name="sold_at"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-body text-xs text-slate">Observação</label>
        <input
          name="notes"
          placeholder="Opcional"
          className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
        />
      </div>

      {state.error && (
        <p className="font-body text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-9 px-4 rounded-lg bg-green text-void font-body text-sm font-medium hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Registrando...' : 'Registrar venda'}
      </button>
    </form>
  )
}
