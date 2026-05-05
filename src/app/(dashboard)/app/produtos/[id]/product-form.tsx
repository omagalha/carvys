'use client'

import { useActionState } from 'react'
import { updateProduct } from '@/server/actions/products'
import type { Product } from '@/server/queries/products'

const INITIAL = { error: '' }

export function ProductForm({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(updateProduct, INITIAL)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={product.id} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="font-body text-xs text-slate">Nome *</label>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">SKU</label>
          <input
            name="sku"
            defaultValue={product.sku ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Categoria</label>
          <input
            name="category"
            defaultValue={product.category ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Marca</label>
          <input
            name="brand"
            defaultValue={product.brand ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Fornecedor</label>
          <input
            name="supplier"
            defaultValue={product.supplier ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Preço de custo (R$)</label>
          <input
            name="cost_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product.cost_price ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Preço de venda (R$)</label>
          <input
            name="sale_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product.sale_price ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Data de fabricação</label>
          <input
            name="manufacture_date"
            type="date"
            defaultValue={product.manufacture_date ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Data de validade</label>
          <input
            name="expiry_date"
            type="date"
            defaultValue={product.expiry_date ?? ''}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Quantidade em estoque</label>
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={product.quantity}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs text-slate">Estoque mínimo</label>
          <input
            name="min_quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={product.min_quantity}
            className="w-full h-10 px-3 rounded-lg bg-void border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      {state.error && (
        <p className="font-body text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 rounded-lg bg-green text-void font-body text-sm font-medium hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
