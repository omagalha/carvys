'use client'

import { useActionState } from 'react'
import { updateVehicleDocument } from '@/server/actions/vehicles'
import { CheckCircle2 } from 'lucide-react'
import type { Vehicle } from '@/server/queries/vehicles'

const FUEL_OPTIONS = [
  { value: 'flex',      label: 'Flex' },
  { value: 'gasolina',  label: 'Gasolina' },
  { value: 'etanol',    label: 'Etanol' },
  { value: 'diesel',    label: 'Diesel' },
  { value: 'eletrico',  label: 'Elétrico' },
  { value: 'hibrido',   label: 'Híbrido' },
]

const BODY_OPTIONS = [
  { value: 'hatch',    label: 'Hatch' },
  { value: 'sedan',    label: 'Sedã' },
  { value: 'suv',      label: 'SUV' },
  { value: 'picape',   label: 'Picape' },
  { value: 'van',      label: 'Van / Furgão' },
  { value: 'coupe',    label: 'Cupê' },
  { value: 'moto',     label: 'Moto' },
  { value: 'caminhao', label: 'Caminhão' },
  { value: 'outro',    label: 'Outro' },
]

const TRANSMISSION_OPTIONS = [
  { value: 'manual',    label: 'Manual' },
  { value: 'automatico', label: 'Automático' },
  { value: 'cvt',       label: 'CVT' },
  { value: 'dct',       label: 'Dupla embreagem (DCT)' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs font-medium text-slate">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ name, defaultValue, placeholder }: {
  name: string; defaultValue?: string | null; placeholder?: string
}) {
  return (
    <input
      name={name}
      type="text"
      defaultValue={defaultValue ?? ''}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 focus:outline-none focus:border-green transition-colors"
    />
  )
}

function SelectInput({ name, defaultValue, options, placeholder }: {
  name: string; defaultValue?: string | null
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ''}
      className="h-10 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export function DocEditor({ vehicle }: { vehicle: Vehicle }) {
  const [state, action, pending] = useActionState(updateVehicleDocument, { error: '' })

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="vehicle_id" value={vehicle.id} />

      {/* Identificação do documento */}
      <div className="flex flex-col gap-4">
        <p className="font-body text-xs font-semibold text-slate uppercase tracking-widest">Identificação</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="RENAVAM">
            <TextInput name="renavam" defaultValue={vehicle.renavam} placeholder="00000000000" />
          </Field>
          <Field label="Chassi / VIN">
            <TextInput name="chassis" defaultValue={vehicle.chassis} placeholder="9BWZZZ377VT004251" />
          </Field>
          <Field label="Nº do motor">
            <TextInput name="motor_number" defaultValue={vehicle.motor_number} placeholder="Opcional" />
          </Field>
        </div>
      </div>

      {/* Características */}
      <div className="flex flex-col gap-4">
        <p className="font-body text-xs font-semibold text-slate uppercase tracking-widest">Características</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Combustível">
            <SelectInput name="fuel" defaultValue={vehicle.fuel} options={FUEL_OPTIONS} placeholder="Selecionar…" />
          </Field>
          <Field label="Carroceria">
            <SelectInput name="body_type" defaultValue={vehicle.body_type} options={BODY_OPTIONS} placeholder="Selecionar…" />
          </Field>
          <Field label="Câmbio">
            <SelectInput name="transmission" defaultValue={vehicle.transmission} options={TRANSMISSION_OPTIONS} placeholder="Selecionar…" />
          </Field>
          <Field label="Portas">
            <SelectInput
              name="doors"
              defaultValue={vehicle.doors ? String(vehicle.doors) : null}
              options={[
                { value: '2', label: '2 portas' },
                { value: '4', label: '4 portas' },
              ]}
              placeholder="Selecionar…"
            />
          </Field>
        </div>
      </div>

      {/* Dados de compra */}
      <div className="flex flex-col gap-4">
        <p className="font-body text-xs font-semibold text-slate uppercase tracking-widest">Compra</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Preço de custo (R$)">
            <input
              name="cost_price"
              type="number"
              step="0.01"
              defaultValue={vehicle.cost_price ?? ''}
              placeholder="Ex: 42000"
              className="h-10 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white placeholder:text-slate/40 focus:outline-none focus:border-green transition-colors"
            />
          </Field>
          <Field label="Data de compra">
            <input
              name="purchase_date"
              type="date"
              defaultValue={vehicle.purchase_date ?? ''}
              className="h-10 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors [color-scheme:dark]"
            />
          </Field>
          <Field label="Fornecedor / Vendedor">
            <TextInput name="supplier_name" defaultValue={vehicle.supplier_name} placeholder="Nome ou empresa" />
          </Field>
        </div>
      </div>

      {/* Feedback + salvar */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="h-10 px-5 rounded-lg bg-green text-void font-body font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? 'Salvando…' : 'Salvar dados'}
        </button>

        {state.success && (
          <span className="flex items-center gap-1.5 font-body text-xs text-green">
            <CheckCircle2 size={14} />
            Salvo com sucesso
          </span>
        )}
        {state.error && (
          <span className="font-body text-xs text-alert">{state.error}</span>
        )}
      </div>
    </form>
  )
}
