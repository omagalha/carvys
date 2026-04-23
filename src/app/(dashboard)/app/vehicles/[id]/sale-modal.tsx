'use client'

import { useActionState } from 'react'
import { X } from 'lucide-react'
import { registerSale } from '@/server/actions/sales'

interface Lead { id: string; name: string; phone: string }

interface Props {
  vehicleId: string
  listedPrice: number
  leads: Lead[]
  onClose: () => void
}

const initialState = { error: '' }

export function SaleModal({ vehicleId, listedPrice, leads, onClose }: Props) {
  const [state, formAction] = useActionState(registerSale, initialState)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-deep border border-surface p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-white text-lg">Registrar venda</h2>
            <p className="font-body text-xs text-slate mt-0.5">Preencha os dados para confirmar</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
          >
            <X size={14} className="text-slate" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="vehicle_id" value={vehicleId} />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">
              Preço de venda (R$) <span className="text-alert">*</span>
            </label>
            <input
              name="sale_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={listedPrice}
              required
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Comprador</label>
            <select
              name="lead_id"
              defaultValue=""
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
            >
              <option value="">Sem lead vinculado</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Data da venda</label>
            <input
              name="sold_at"
              type="date"
              defaultValue={today}
              required
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Observações</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Forma de pagamento, condições..."
              className="w-full rounded-lg border border-surface bg-void px-3 py-2.5 font-body text-sm text-white placeholder:text-slate/50 focus:outline-none focus:border-green transition-colors resize-none"
            />
          </div>

          {state.error && (
            <p className="font-body text-xs text-alert text-center">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-surface font-body text-sm text-slate hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-green font-body font-semibold text-sm text-void hover:bg-green/90 transition-colors"
            >
              Confirmar venda
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
