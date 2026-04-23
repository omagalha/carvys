'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createVehicle } from '@/server/actions/vehicles'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/button'

const initialState = { error: '' }

const currentYear = new Date().getFullYear()

export default function NovoVeiculoPage() {
  const [state, formAction] = useActionState(createVehicle, initialState)
  const router = useRouter()

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface hover:border-slate/40 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate" />
        </button>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Novo veículo</h1>
          <p className="font-body text-sm text-slate mt-0.5">Preencha os dados do veículo</p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-6">

        {/* Identificação */}
        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Identificação</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Marca" name="brand" placeholder="Toyota" required />
            <Input label="Modelo" name="model" placeholder="Corolla" required />
          </div>
          <Input label="Versão" name="version" placeholder="XEi 2.0 (opcional)" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ano fabricação"
              name="year_manufacture"
              type="number"
              placeholder={String(currentYear)}
              required
            />
            <Input
              label="Ano modelo"
              name="year_model"
              type="number"
              placeholder={String(currentYear + 1)}
              required
            />
          </div>
          <Input label="Placa" name="plate" placeholder="ABC-1234 (opcional)" />
        </section>

        {/* Detalhes */}
        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Detalhes</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quilometragem"
              name="mileage"
              type="number"
              placeholder="0"
            />
            <Input label="Cor" name="color" placeholder="Prata (opcional)" />
          </div>
        </section>

        {/* Preço e status */}
        <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
          <h2 className="font-body font-semibold text-white text-sm">Preço e status</h2>
          <Input
            label="Preço de venda (R$)"
            name="price"
            type="number"
            placeholder="85000"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-slate">Status</label>
            <select
              name="status"
              defaultValue="available"
              className="h-11 w-full rounded-lg border border-surface bg-void px-3 font-body text-sm text-white focus:outline-none focus:border-green transition-colors"
            >
              <option value="available">Disponível</option>
              <option value="draft">Rascunho</option>
            </select>
          </div>
        </section>

        {state?.error && (
          <p className="font-body text-xs text-alert text-center">{state.error}</p>
        )}

        <SubmitButton>Salvar veículo</SubmitButton>
      </form>
    </div>
  )
}
