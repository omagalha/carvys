'use client'

import { useActionState, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { addFinancialEntry, type EntryState } from '@/server/actions/financial-entries'

const EXPENSE_CATEGORIES = [
  { value: 'ipva',       label: 'IPVA' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'lavagem',    label: 'Lavagem' },
  { value: 'comissao',   label: 'Comissão' },
  { value: 'marketing',  label: 'Marketing' },
  { value: 'compra',     label: 'Compra de veículo' },
  { value: 'outros',     label: 'Outros' },
]

type Vehicle = { id: string; brand: string; model: string; year_model: number | null }

interface Props {
  defaultType: 'expense' | 'income'
  vehicles: Vehicle[]
  label: string
  icon: React.ReactNode
  className?: string
}

const initialState: EntryState = { error: '' }

export function EntryModal({ defaultType, vehicles, label, icon, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(addFinancialEntry, initialState)

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state.success])

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 h-9 px-4 rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-80 ${className}`}
      >
        {icon}
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-deep border border-surface p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">
                {defaultType === 'expense' ? 'Registrar despesa' : 'Entrada manual'}
              </h2>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface transition-colors">
                <X size={16} className="text-slate" />
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="type" value={defaultType} />

              {/* Categoria (só para despesa) */}
              {defaultType === 'expense' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">Categoria</label>
                  <select
                    name="category"
                    defaultValue="outros"
                    className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white outline-none focus:border-green/60 transition-colors"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Income não tem categoria específica */}
              {defaultType === 'income' && (
                <input type="hidden" name="category" value="entrada" />
              )}

              {/* Veículo (opcional) */}
              {defaultType === 'expense' && vehicles.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">Veículo (opcional)</label>
                  <select
                    name="vehicle_id"
                    className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white outline-none focus:border-green/60 transition-colors"
                  >
                    <option value="">— Despesa geral —</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model}{v.year_model ? ` ${v.year_model}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descrição */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">Descrição</label>
                <input
                  name="description"
                  type="text"
                  placeholder={defaultType === 'expense' ? 'Ex: IPVA Civic 2020' : 'Ex: Depósito cliente'}
                  required
                  className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 outline-none focus:border-green/60 transition-colors"
                />
              </div>

              {/* Valor + Data */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">Valor (R$)</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    required
                    className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 outline-none focus:border-green/60 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">Data</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={today}
                    required
                    className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white outline-none focus:border-green/60 transition-colors"
                  />
                </div>
              </div>

              {state.error && (
                <p className="font-body text-xs text-alert">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className={`h-11 w-full rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                  defaultType === 'expense' ? 'bg-alert text-white' : 'bg-green text-void'
                }`}
              >
                {pending ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
