'use client'

import { useState, useTransition } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { sendWhatsAppMessage } from '@/server/actions/whatsapp'

type SimData = {
  entry:         number
  rate:          number
  months:        number
  installment:   number
  total:         number
  vehicle_price: number
}

type Props = {
  leadId:      string
  leadName:    string
  phone:       string
  vehicleName?: string
  simulation:  SimData
  waConnected: boolean
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function buildWAMessage(name: string, vehicle: string | undefined, sim: SimData): string {
  const first = name.split(' ')[0]
  const lines = [
    `Olá ${first}! Segue a simulação do seu financiamento 😊`,
    '',
    vehicle ? `🚗 ${vehicle}` : '',
    `💰 Valor: ${fmt(sim.vehicle_price)}`,
    `💵 Entrada: ${fmt(sim.entry)}`,
    `📊 Financiado: ${fmt(sim.vehicle_price - sim.entry)}`,
    `📅 Prazo: ${sim.months} meses`,
    `💳 Parcela estimada: ${fmt(sim.installment)}`,
    `📉 Taxa: ${sim.rate.toFixed(2)}% a.m.`,
    `💰 Total a pagar: ${fmt(sim.total)}`,
    '',
    'Posso te ajudar a fechar? Me chame aqui! 🤝',
  ].filter(l => l !== undefined && (l !== '' || true))
  return lines.join('\n')
}

export function SimulationView({ leadId, leadName, phone, vehicleName, simulation, waConnected }: Props) {
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [pending, start]      = useTransition()

  const rows = [
    { label: 'Veículo',         value: vehicleName ?? '—' },
    { label: 'Valor do veículo', value: fmt(simulation.vehicle_price) },
    { label: 'Entrada',         value: fmt(simulation.entry) },
    { label: 'Financiado',      value: fmt(simulation.vehicle_price - simulation.entry) },
    { label: 'Taxa',            value: `${simulation.rate.toFixed(2)}% a.m.` },
    { label: 'Prazo',           value: `${simulation.months} meses` },
    { label: 'Total a pagar',   value: fmt(simulation.total) },
  ]

  function handleSend() {
    setError('')
    start(async () => {
      const msg = buildWAMessage(leadName, vehicleName, simulation)
      const res = await sendWhatsAppMessage(leadId, phone, msg)
      if (res.error) { setError(res.error); return }
      setSent(true)
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-body font-semibold text-white text-sm">Simulação de Financiamento</h2>
        <span className="font-body text-xs text-green font-semibold">
          {simulation.months}x {fmt(simulation.installment)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b border-surface/50 last:border-0">
            <span className="font-body text-xs text-slate">{label}</span>
            <span className="font-body text-sm text-white">{value}</span>
          </div>
        ))}
      </div>

      {waConnected && (
        <div className="flex flex-col gap-1.5">
          {error && <p className="font-body text-xs text-alert">{error}</p>}
          {sent ? (
            <p className="font-body text-xs text-green text-center py-1">Simulação enviada via WhatsApp ✓</p>
          ) : (
            <button
              onClick={handleSend}
              disabled={pending}
              className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366] font-body text-sm font-medium transition-colors disabled:opacity-50"
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Enviar simulação via WhatsApp
            </button>
          )}
        </div>
      )}
    </section>
  )
}
