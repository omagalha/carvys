'use client'

import { useState, useTransition } from 'react'
import { Car, Check, ChevronDown, X } from 'lucide-react'
import { updateLeadVehicle } from '@/server/actions/leads'

type VehicleOption = {
  id: string
  brand: string
  model: string
  year_model: number | null
}

export function VehicleSelector({
  leadId,
  currentVehicleId,
  vehicles,
}: {
  leadId: string
  currentVehicleId: string | null
  vehicles: VehicleOption[]
}) {
  const [open, setOpen]           = useState(false)
  const [selected, setSelected]   = useState(currentVehicleId)
  const [pending, startTransition] = useTransition()

  const current = vehicles.find(v => v.id === selected)

  function choose(vehicleId: string | null) {
    setSelected(vehicleId)
    setOpen(false)
    startTransition(async () => { await updateLeadVehicle(leadId, vehicleId) })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={pending}
        className="flex items-center gap-3 w-full h-11 px-4 rounded-lg border border-surface hover:border-slate/40 transition-colors disabled:opacity-60"
      >
        <Car size={16} className="text-slate shrink-0" />
        <span className="font-body text-sm text-white flex-1 text-left truncate">
          {current
            ? `${current.brand} ${current.model}${current.year_model ? ` ${current.year_model}` : ''}`
            : 'Nenhum veículo selecionado'}
        </span>
        {pending
          ? <span className="font-body text-xs text-slate">Salvando...</span>
          : <ChevronDown size={14} className="text-slate shrink-0" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-20 rounded-xl border border-surface bg-deep shadow-xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => choose(null)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-surface/40 transition-colors ${!selected ? 'text-green' : 'text-slate'}`}
            >
              <X size={14} className="shrink-0" />
              <span className="font-body text-sm">Remover veículo</span>
            </button>

            {vehicles.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => choose(v.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-surface/40 transition-colors ${selected === v.id ? 'text-green' : 'text-white'}`}
              >
                {selected === v.id
                  ? <Check size={14} className="shrink-0 text-green" />
                  : <Car size={14} className="shrink-0 text-slate" />}
                <span className="font-body text-sm truncate">
                  {v.brand} {v.model}{v.year_model ? ` ${v.year_model}` : ''}
                </span>
              </button>
            ))}

            {vehicles.length === 0 && (
              <p className="px-4 py-3 font-body text-xs text-slate">Nenhum veículo disponível.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
