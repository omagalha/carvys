'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createProduct } from '@/server/actions/products'

const INITIAL: { error: string } = { error: '' }

export default function NovoProdutoPage() {
  const [state, action, pending] = useActionState(createProduct, INITIAL)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/produtos"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate hover:text-white hover:bg-surface transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display text-xl font-semibold text-white">Novo produto</h1>
      </div>

      <form action={action} className="space-y-5">

        {/* Nome + SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-body text-sm text-slate">Nome *</label>
            <input
              name="name"
              required
              placeholder="Ex: Batom Matte Vermelho"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">SKU</label>
            <input
              name="sku"
              placeholder="Ex: BAT-001"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
        </div>

        {/* Categoria + Marca + Fornecedor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Categoria</label>
            <input
              name="category"
              placeholder="Ex: Labial"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Marca</label>
            <input
              name="brand"
              placeholder="Ex: MAC"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Fornecedor</label>
            <input
              name="supplier"
              placeholder="Ex: Distribuidora X"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Preço de custo (R$)</label>
            <input
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Preço de venda (R$)</label>
            <input
              name="sale_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors"
            />
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Data de fabricação</label>
            <input
              name="manufacture_date"
              type="date"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Data de validade</label>
            <input
              name="expiry_date"
              type="date"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
            />
          </div>
        </div>

        {/* Estoque */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Quantidade inicial</label>
            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm text-slate">Estoque mínimo</label>
            <input
              name="min_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-surface text-white font-body text-sm focus:outline-none focus:border-green transition-colors"
            />
          </div>
        </div>

        {state.error && (
          <p className="font-body text-sm text-red-400">{state.error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/app/produtos"
            className="flex-1 h-10 flex items-center justify-center rounded-lg border border-surface text-slate font-body text-sm hover:text-white hover:border-slate/50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 h-10 rounded-lg bg-green text-void font-body text-sm font-medium hover:bg-green/90 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
