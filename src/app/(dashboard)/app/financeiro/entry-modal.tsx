'use client'

import { useActionState, useEffect, useState } from 'react'
import { X, CreditCard } from 'lucide-react'
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

const INSTALLMENT_OPTIONS = [2,3,4,5,6,7,8,9,10,11,12,18,24,36,48,60]

type Vehicle = { id: string; brand: string; model: string; year_model: number | null }

interface Props {
  defaultType: 'expense' | 'income'
  vehicles: Vehicle[]
  label: string
  icon: React.ReactNode
  className?: string
}

const initialState: EntryState = { error: '' }

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

export function EntryModal({ defaultType, vehicles, label, icon, className = '' }: Props) {
  const [open, setOpen]               = useState(false)
  const [installment, setInstallment] = useState(false)
  const [parcelas, setParcelas]       = useState(12)
  const [amount, setAmount]           = useState('')
  const [state, formAction, pending]  = useActionState(addFinancialEntry, initialState)

  useEffect(() => {
    if (state.success) {
      setOpen(false)
      setInstallment(false)
      setParcelas(12)
      setAmount('')
    }
  }, [state.success])

  const today      = new Date().toISOString().split('T')[0]
  const amountNum  = parseFloat(amount) || 0
  const total      = amountNum * (installment ? parcelas : 1)
  const isExpense  = defaultType === 'expense'

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
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => !pending && setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-deep border border-surface p-6 flex flex-col gap-5">

            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">
                {isExpense ? 'Registrar despesa' : 'Entrada manual'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface transition-colors"
              >
                <X size={16} className="text-slate" />
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="type"         value={defaultType} />
              <input type="hidden" name="installments" value={installment ? parcelas : 1} />

              {/* Categoria */}
              {isExpense && (
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
              {!isExpense && <input type="hidden" name="category" value="entrada" />}

              {/* Veículo */}
              {isExpense && vehicles.length > 0 && (
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
                  placeholder={isExpense ? 'Ex: Seguro do veículo' : 'Ex: Depósito cliente'}
                  required
                  className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 outline-none focus:border-green/60 transition-colors"
                />
              </div>

              {/* Valor + Data */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">
                    {installment ? 'Valor da parcela' : 'Valor (R$)'}
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 outline-none focus:border-green/60 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">
                    {installment ? '1ª parcela' : 'Data'}
                  </label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={today}
                    required
                    className="h-11 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white outline-none focus:border-green/60 transition-colors"
                  />
                </div>
              </div>

              {/* Toggle parcelamento — só para despesas */}
              {isExpense && (
                <div className="flex flex-col gap-3 rounded-xl border border-surface bg-void/50 p-3">
                  <button
                    type="button"
                    onClick={() => setInstallment(v => !v)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className={installment ? 'text-green' : 'text-slate'} />
                      <span className="font-body text-sm text-white">Parcelada</span>
                    </div>
                    <div className={[
                      'relative h-5 w-9 rounded-full transition-colors',
                      installment ? 'bg-green' : 'bg-surface',
                    ].join(' ')}>
                      <div className={[
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                        installment ? 'translate-x-4' : 'translate-x-0.5',
                      ].join(' ')} />
                    </div>
                  </button>

                  {installment && (
                    <div className="flex flex-col gap-3 pt-1 border-t border-surface">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-body text-xs font-medium text-slate uppercase tracking-widest">Número de parcelas</label>
                        <select
                          value={parcelas}
                          onChange={e => setParcelas(Number(e.target.value))}
                          className="h-10 rounded-lg border border-surface bg-void px-3 font-body text-sm text-white outline-none focus:border-green/60 transition-colors"
                        >
                          {INSTALLMENT_OPTIONS.map(n => (
                            <option key={n} value={n}>{n}x</option>
                          ))}
                        </select>
                      </div>

                      {amountNum > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-green/5 border border-green/15 px-3 py-2">
                          <span className="font-body text-xs text-slate">{parcelas}× {fmt(amountNum)}</span>
                          <span className="font-body text-sm font-semibold text-green">= {fmt(total)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {state.error && (
                <p className="font-body text-xs text-alert">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className={`h-11 w-full rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                  isExpense ? 'bg-alert text-white' : 'bg-green text-void'
                }`}
              >
                {pending
                  ? 'Salvando...'
                  : installment
                    ? `Lançar ${parcelas} parcelas`
                    : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
