'use client'

import { useState, useTransition } from 'react'
import { updateVehicleStatus } from '@/server/actions/vehicles'
import { SaleModal } from './sale-modal'

const OPTIONS = [
  { value: 'draft',     label: 'Rascunho' },
  { value: 'available', label: 'Disponível' },
  { value: 'reserved',  label: 'Reservado' },
  { value: 'sold',      label: 'Vendido' },
  { value: 'archived',  label: 'Arquivado' },
]

const STATUS_COLOR: Record<string, string> = {
  draft:     'text-slate',
  available: 'text-green',
  reserved:  'text-yellow-400',
  sold:      'text-slate',
  archived:  'text-slate',
}

interface Lead { id: string; name: string; phone: string }

interface Props {
  vehicleId: string
  currentStatus: string
  listedPrice: number
  leads: Lead[]
}

export function StatusSelect({ vehicleId, currentStatus, listedPrice, leads }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleChange(value: string) {
    if (value === 'sold') {
      setShowSaleModal(true)
      return
    }
    setStatus(value)
    startTransition(async () => {
      await updateVehicleStatus(vehicleId, value)
    })
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={e => handleChange(e.target.value)}
          disabled={pending}
          className={`h-10 flex-1 rounded-lg border border-surface bg-void px-3 font-body text-sm focus:outline-none focus:border-green transition-colors disabled:opacity-60 ${STATUS_COLOR[status]}`}
        >
          {OPTIONS.map(o => (
            <option key={o.value} value={o.value} className="text-white">
              {o.label}
            </option>
          ))}
        </select>
        {pending && <span className="font-body text-xs text-slate">Salvando...</span>}
      </div>

      {showSaleModal && (
        <SaleModal
          vehicleId={vehicleId}
          listedPrice={listedPrice}
          leads={leads}
          onClose={() => setShowSaleModal(false)}
        />
      )}
    </>
  )
}
