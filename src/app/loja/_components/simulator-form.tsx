'use client'

import { useState, useTransition } from 'react'
import { Calculator, CheckCircle, Loader2 } from 'lucide-react'
import { createSimulationLead } from '@/server/actions/public'

type Props = {
  tenantId:    string
  vehicleId:   string
  vehicleName: string
  vehiclePrice: number
}

const TERMS = [12, 24, 36, 48, 60]
const DEFAULT_RATE = 1.49

function calcPMT(pv: number, rate: number, n: number): number {
  if (rate === 0) return pv / n
  const r = rate / 100
  return (pv * r) / (1 - Math.pow(1 + r, -n))
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function SimulatorForm({ tenantId, vehicleId, vehicleName, vehiclePrice }: Props) {
  const [entry,     setEntry]     = useState(Math.round(vehiclePrice * 0.2))
  const [months,    setMonths]    = useState(48)
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [cpf,       setCpf]       = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')
  const [pending,   start]        = useTransition()

  const financed    = Math.max(0, vehiclePrice - entry)
  const installment = calcPMT(financed, DEFAULT_RATE, months)
  const total       = installment * months + entry
  const entryPct   = Math.round((entry / vehiclePrice) * 100)

  function handleEntry(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value.replace(/\D/g, ''))
    setEntry(Math.min(v, vehiclePrice))
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    setEntry(Number(e.target.value))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    start(async () => {
      const res = await createSimulationLead({
        tenantId, vehicleId, vehicleName,
        name, phone, cpf, birthDate,
        entry, rate: DEFAULT_RATE, months,
        installment: Math.round(installment),
        total: Math.round(total),
        vehiclePrice,
      })
      if (res.error) { setError(res.error); return }
      setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle size={36} className="text-[#C8F135]" />
        <p className="font-display font-bold text-white text-lg">Simulação enviada!</p>
        <p className="font-body text-sm text-white/40">
          Nossa equipe entrará em contato em breve com os detalhes.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Resultado em destaque */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-body text-[10px] text-white/30 uppercase tracking-widest mb-1">{months}x de</p>
          <p className="font-display font-bold text-[#C8F135] text-3xl leading-none">
            {fmt(installment)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-white/30">Total a pagar</p>
          <p className="font-body text-sm font-semibold text-white">{fmt(total)}</p>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Entrada */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="font-body text-xs text-white/50">Entrada</label>
          <span className="font-body text-xs text-white/30">{entryPct}% do valor</span>
        </div>
        <input
          type="range"
          min={0}
          max={vehiclePrice}
          step={1000}
          value={entry}
          onChange={handleSlider}
          className="w-full accent-[#C8F135] cursor-pointer"
        />
        <div className="flex items-center gap-2 h-10 rounded-lg border border-white/10 bg-white/5 px-3">
          <span className="font-body text-xs text-white/30">R$</span>
          <input
            type="text"
            value={entry.toLocaleString('pt-BR')}
            onChange={handleEntry}
            className="flex-1 bg-transparent font-body text-sm text-white outline-none"
          />
        </div>
      </div>

      {/* Prazo */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs text-white/50">Prazo</label>
        <div className="flex gap-1">
          {TERMS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setMonths(t)}
              className={`flex-1 h-10 rounded-lg font-body text-xs font-semibold transition-colors ${
                months === t
                  ? 'bg-[#C8F135] text-[#0A0A0F]'
                  : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex flex-col gap-2">
        {[
          { label: 'Valor financiado', value: fmt(financed) },
          { label: 'Prazo',            value: `${months} meses` },
          { label: 'Total estimado',   value: fmt(total) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="font-body text-xs text-white/40">{label}</span>
            <span className="font-body text-xs text-white">{value}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-white/5" />

      {/* Dados pessoais */}
      <p className="font-body text-xs text-white/30 uppercase tracking-widest">Seus dados para contato</p>

      <div className="flex flex-col gap-3">
        <input
          required
          placeholder="Nome completo"
          value={name}
          onChange={e => setName(e.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 font-body text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C8F135]/40 transition-colors"
        />
        <input
          required
          type="tel"
          placeholder="WhatsApp (com DDD)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 font-body text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C8F135]/40 transition-colors"
        />
        <input
          required
          placeholder="CPF"
          value={cpf}
          onChange={e => setCpf(fmtCPF(e.target.value))}
          className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 font-body text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C8F135]/40 transition-colors"
        />
        <div className="flex flex-col gap-1">
          <label className="font-body text-xs text-white/30">Data de nascimento</label>
          <input
            required
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 font-body text-sm text-white outline-none focus:border-[#C8F135]/40 transition-colors"
          />
        </div>
      </div>

      {error && <p className="font-body text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#C8F135] text-[#0A0A0F] font-body font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending
          ? <><Loader2 size={16} className="animate-spin" /> Enviando...</>
          : <><Calculator size={16} /> Solicitar simulação</>
        }
      </button>
    </form>
  )
}
