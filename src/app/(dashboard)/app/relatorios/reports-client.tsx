'use client'

import { useState, useMemo } from 'react'
import { FileText, Download } from 'lucide-react'

type ReportLead = {
  id: string
  name: string
  phone: string
  email: string | null
  stage: string
  source: string | null
  expected_value: number | null
  created_at: string
  last_contact_at: string | null
}

type ReportSale = {
  id: string
  sale_price: number
  cost_price: number | null
  sold_at: string
  vehicles: { brand: string; model: string; year_model: number | null } | null
  leads: { name: string; phone: string } | null
}

type ReportFollowUp = {
  id: string
  title: string
  type: string
  status: string
  due_at: string
  leads: { name: string } | { name: string }[] | null
}

const STAGE_LABEL: Record<string, string> = {
  new: 'Novo', contacted: 'Contatado', negotiating: 'Negociando', won: 'Ganho', lost: 'Perdido',
}

const PERIODS = [
  { label: 'Este mês',        days: 30  },
  { label: 'Últimos 3 meses', days: 90  },
  { label: 'Tudo',            days: 0   },
] as const

function withinPeriod(iso: string, days: number): boolean {
  if (days === 0) return true
  return new Date(iso) >= new Date(Date.now() - days * 86_400_000)
}

function toCSV(headers: string[], rows: string[][]): string {
  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function leadName(leads: ReportFollowUp['leads']): string {
  if (!leads) return ''
  if (Array.isArray(leads)) return leads[0]?.name ?? ''
  return leads.name
}

export function ReportsClient({
  leads,
  sales,
  followUps,
}: {
  leads: ReportLead[]
  sales: ReportSale[]
  followUps: ReportFollowUp[]
}) {
  const [periodIdx, setPeriodIdx] = useState(0)
  const days = PERIODS[periodIdx].days

  const filteredLeads     = useMemo(() => leads.filter(l => withinPeriod(l.created_at, days)), [leads, days])
  const filteredSales     = useMemo(() => sales.filter(s => withinPeriod(s.sold_at, days)), [sales, days])
  const filteredFollowUps = useMemo(() => followUps.filter(f => withinPeriod(f.due_at, days)), [followUps, days])

  const revenue = filteredSales.reduce((s, v) => s + v.sale_price, 0)
  const profit  = filteredSales.reduce((s, v) => s + v.sale_price - (v.cost_price ?? 0), 0)

  function exportLeads() {
    const headers = ['Nome', 'Telefone', 'E-mail', 'Etapa', 'Origem', 'Valor esperado', 'Cadastrado em', 'Último contato']
    const rows = filteredLeads.map(l => [
      l.name,
      l.phone,
      l.email ?? '',
      STAGE_LABEL[l.stage] ?? l.stage,
      l.source ?? '',
      l.expected_value != null ? String(l.expected_value) : '',
      fmtDate(l.created_at),
      l.last_contact_at ? fmtDate(l.last_contact_at) : '',
    ])
    downloadCSV('leads.csv', toCSV(headers, rows))
  }

  function exportSales() {
    const headers = ['Lead', 'Telefone', 'Veículo', 'Ano', 'Preço de venda', 'Custo', 'Lucro', 'Data da venda']
    const rows = filteredSales.map(s => [
      s.leads?.name ?? '',
      s.leads?.phone ?? '',
      s.vehicles ? `${s.vehicles.brand} ${s.vehicles.model}` : '',
      String(s.vehicles?.year_model ?? ''),
      String(s.sale_price),
      String(s.cost_price ?? ''),
      String(s.sale_price - (s.cost_price ?? 0)),
      fmtDate(s.sold_at),
    ])
    downloadCSV('vendas.csv', toCSV(headers, rows))
  }

  function exportFollowUps() {
    const headers = ['Título', 'Lead', 'Tipo', 'Status', 'Data']
    const rows = filteredFollowUps.map(f => [
      f.title,
      leadName(f.leads),
      f.type,
      f.status === 'pending' ? 'Pendente' : f.status === 'done' ? 'Concluído' : f.status,
      fmtDate(f.due_at),
    ])
    downloadCSV('follow-ups.csv', toCSV(headers, rows))
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-green" />
          <h1 className="font-display font-bold text-white text-xl">Relatórios</h1>
        </div>

        <div className="flex gap-1 bg-deep border border-surface rounded-lg p-1">
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodIdx(i)}
              className={[
                'font-body text-xs px-3 py-1.5 rounded-md transition-colors',
                periodIdx === i ? 'bg-green/15 text-green font-medium' : 'text-slate hover:text-white',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads */}
      <ReportCard
        title="Leads"
        onExport={exportLeads}
        stats={[
          { label: 'Total',        value: String(filteredLeads.length) },
          { label: 'Ganhos',       value: String(filteredLeads.filter(l => l.stage === 'won').length) },
          { label: 'Em andamento', value: String(filteredLeads.filter(l => !['won', 'lost'].includes(l.stage)).length) },
        ]}
      />

      {/* Vendas */}
      <ReportCard
        title="Vendas"
        onExport={exportSales}
        stats={[
          { label: 'Vendas',       value: String(filteredSales.length) },
          { label: 'Faturamento',  value: fmt(revenue) },
          { label: 'Lucro',        value: fmt(profit) },
        ]}
      />

      {/* Follow-ups */}
      <ReportCard
        title="Follow-ups"
        onExport={exportFollowUps}
        stats={[
          { label: 'Total',      value: String(filteredFollowUps.length) },
          { label: 'Pendentes',  value: String(filteredFollowUps.filter(f => f.status === 'pending').length) },
          { label: 'Concluídos', value: String(filteredFollowUps.filter(f => f.status === 'done').length) },
        ]}
      />
    </div>
  )
}

function ReportCard({
  title,
  stats,
  onExport,
}: {
  title: string
  stats: { label: string; value: string }[]
  onExport: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-white text-base">{title}</h2>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green/10 hover:bg-green/20 text-green font-body text-xs font-medium transition-colors"
        >
          <Download size={13} />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="font-display font-bold text-white text-xl leading-none">{s.value}</span>
            <span className="font-body text-xs text-slate">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
